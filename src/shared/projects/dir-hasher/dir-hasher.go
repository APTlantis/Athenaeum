// =========================================================
// Script Name: dir_hasher.go
// Description: Generates cryptographic hashes for directories, creates TOML files with hash information, and zips directories
// Author: Based on APTlantis Team's iso_hasher.go
// Creation Date: 2025-07-20
// 
// Dependencies:
// - github.com/cloudflare/circl/xof/k12
// - github.com/jzelinskie/whirlpool
// - golang.org/x/crypto/blake2b
// - golang.org/x/crypto/ripemd160
// - golang.org/x/crypto/sha3
// - golang.org/x/crypto/openpgp
// - lukechampine.com/blake3
// - github.com/zeebo/xxh3
// - github.com/cespare/xxhash/v2
// - github.com/spaolacci/murmur3
// - archive/zip
// 
// Usage:
//   go run dir_hasher.go [options]
// 
// Options:
//   -dir string        Directory to hash and zip
//   -verbose           Enable verbose output
//   -progress          Show progress when hashing large files (default true)
//   -gpgkey string     Path to GPG private key file (if not provided, a new key will be generated)
// =========================================================

package main

import (
	"archive/zip"
	"bytes"
	"crypto"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cespare/xxhash/v2"
	"github.com/cloudflare/circl/xof/k12"
	"github.com/jzelinskie/whirlpool"
	"github.com/spaolacci/murmur3"
	"github.com/zeebo/xxh3"
	"golang.org/x/crypto/blake2b"
	"golang.org/x/crypto/openpgp"
	"golang.org/x/crypto/openpgp/armor"
	"golang.org/x/crypto/openpgp/packet"
	"golang.org/x/crypto/ripemd160"
	"golang.org/x/crypto/sha3"
	"lukechampine.com/blake3"
)

var (
	dirPath      string
	verbose      bool
	showProgress bool
	gpgKeyFile   string
)

func init() {
	flag.StringVar(&dirPath, "dir", "", "Directory to hash and zip")
	flag.BoolVar(&verbose, "verbose", false, "Enable verbose output")
	flag.BoolVar(&showProgress, "progress", true, "Show progress when hashing large files")
	flag.StringVar(&gpgKeyFile, "gpgkey", "", "Path to GPG private key file (if not provided, a new key will be generated)")
	flag.Parse()

	if dirPath == "" {
		log.Fatal("Error: Directory path is required. Use -dir flag to specify a directory.")
	}
}

// generateGPGKey generates a new GPG key pair
func generateGPGKey(name, email string) (*openpgp.Entity, error) {
	// Configure the primary key
	config := &packet.Config{
		RSABits:     2048,
		DefaultHash: crypto.SHA256,
	}

	// Create the entity
	entity, err := openpgp.NewEntity(name, "Directory Hasher", email, config)
	if err != nil {
		return nil, err
	}

	// Self-sign the identity
	for _, id := range entity.Identities {
		err := id.SelfSignature.SignUserId(id.UserId.Id, entity.PrimaryKey, entity.PrivateKey, config)
		if err != nil {
			return nil, err
		}
	}

	return entity, nil
}

// exportPublicKey exports the public key in armored format
func exportPublicKey(entity *openpgp.Entity) (string, error) {
	var buf bytes.Buffer
	w, err := armor.Encode(&buf, openpgp.PublicKeyType, nil)
	if err != nil {
		return "", err
	}
	
	err = entity.Serialize(w)
	if err != nil {
		return "", err
	}
	
	err = w.Close()
	if err != nil {
		return "", err
	}
	
	return buf.String(), nil
}

// signData signs the provided data with the GPG key
func signData(entity *openpgp.Entity, data []byte) (string, error) {
	var buf bytes.Buffer
	
	// Create an armored signature
	w, err := armor.Encode(&buf, openpgp.SignatureType, nil)
	if err != nil {
		return "", err
	}
	
	// Create a signature writer
	signWriter, err := openpgp.Sign(w, entity, nil, nil)
	if err != nil {
		return "", err
	}
	
	// Write the data to be signed
	_, err = signWriter.Write(data)
	if err != nil {
		return "", err
	}
	
	// Close the signature writer
	err = signWriter.Close()
	if err != nil {
		return "", err
	}
	
	// Close the armor writer
	err = w.Close()
	if err != nil {
		return "", err
	}
	
	return buf.String(), nil
}

// getGPGEntity returns a GPG entity either by loading from a file or generating a new one
func getGPGEntity() (*openpgp.Entity, error) {
	if gpgKeyFile != "" {
		// Load key from file
		keyData, err := os.ReadFile(gpgKeyFile)
		if err != nil {
			return nil, fmt.Errorf("error reading GPG key file: %v", err)
		}
		
		// Decode the armored key
		block, err := armor.Decode(bytes.NewReader(keyData))
		if err != nil {
			return nil, fmt.Errorf("error decoding GPG key: %v", err)
		}
		
		// Read the entity
		entityList, err := openpgp.ReadEntity(packet.NewReader(block.Body))
		if err != nil {
			return nil, fmt.Errorf("error reading GPG entity: %v", err)
		}
		
		return entityList, nil
	} else {
		// Generate a new key
		log.Println("No GPG key provided, generating a new one...")
		hostname, err := os.Hostname()
		if err != nil {
			hostname = "unknown"
		}
		
		return generateGPGKey("Dir Hasher", fmt.Sprintf("dir-hasher@%s", hostname))
	}
}

// FileInfo stores information about a file
type FileInfo struct {
	Path     string
	Size     int64
	ModTime  time.Time
	IsDir    bool
	RelPath  string // Path relative to the root directory
}

// DirectoryInventory stores information about all files in a directory
type DirectoryInventory struct {
	RootDir     string
	Files       []FileInfo
	TotalSize   int64
	TotalFiles  int
	TotalDirs   int
	InventoryAt time.Time
}

// HashResult stores all hash values for a directory
type HashResult struct {
	// 5 main hashes
	KangarooTwelve string
	Blake3         string
	SHA3_256       string
	Blake2b        string
	SHA512         string

	// 3 less common checksums
	Whirlpool string
	RIPEMD160  string
	XXH3      string

	// Additional hashes
	SHA256    string
	XXHash64  string
	Murmur3   string
	
	// GPG signature
	GPGKeyID     string
	GPGSignature string
}

func main() {
	startTime := time.Now()
	log.Printf("Starting directory hashing for: %s\n", dirPath)

	// Check if directory exists
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		log.Fatalf("Error: Directory %s does not exist\n", dirPath)
	}

	// Get directory name for output files
	dirName := filepath.Base(dirPath)
	if dirName == "." || dirName == ".." || dirName == "/" || dirName == "\\" {
		// Use the parent directory name if the path ends with a separator
		dirName = filepath.Base(filepath.Dir(dirPath))
	}

	// Create inventory of the directory
	log.Println("Creating directory inventory...")
	inventory, err := createDirectoryInventory(dirPath)
	if err != nil {
		log.Fatalf("Error creating directory inventory: %v\n", err)
	}
	log.Printf("Inventory complete: %d files, %d directories, %.2f MB total\n", 
		inventory.TotalFiles, 
		inventory.TotalDirs, 
		float64(inventory.TotalSize)/(1024*1024))

	// Generate hashes for the directory
	log.Println("Generating hashes for all files...")
	hashResult, err := generateDirectoryHashes(inventory)
	if err != nil {
		log.Fatalf("Error generating hashes: %v\n", err)
	}
	log.Println("Hash generation complete")

	// Create TOML file
	tomlPath := dirPath + ".toml"
	log.Printf("Creating TOML file: %s\n", tomlPath)
	err = createTomlFile(tomlPath, dirName, inventory, hashResult)
	if err != nil {
		log.Fatalf("Error creating TOML file: %v\n", err)
	}
	log.Println("TOML file created successfully")

	// Create ZIP file
	zipPath := dirPath + ".zip"
	log.Printf("Creating ZIP file: %s\n", zipPath)
	err = zipDirectory(dirPath, zipPath)
	if err != nil {
		log.Fatalf("Error creating ZIP file: %v\n", err)
	}
	log.Println("ZIP file created successfully")

	duration := time.Since(startTime)
	log.Printf("All operations completed in %v\n", duration)
}

// createDirectoryInventory creates an inventory of all files in a directory
func createDirectoryInventory(rootDir string) (DirectoryInventory, error) {
	inventory := DirectoryInventory{
		RootDir:     rootDir,
		Files:       []FileInfo{},
		InventoryAt: time.Now(),
	}

	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("Error accessing path %s: %v\n", path, err)
			return nil // Continue with next file
		}

		// Calculate relative path
		relPath, err := filepath.Rel(rootDir, path)
		if err != nil {
			log.Printf("Error calculating relative path for %s: %v\n", path, err)
			relPath = path
		}

		// Skip the root directory itself
		if path == rootDir {
			return nil
		}

		fileInfo := FileInfo{
			Path:     path,
			Size:     info.Size(),
			ModTime:  info.ModTime(),
			IsDir:    info.IsDir(),
			RelPath:  relPath,
		}

		inventory.Files = append(inventory.Files, fileInfo)

		if info.IsDir() {
			inventory.TotalDirs++
		} else {
			inventory.TotalFiles++
			inventory.TotalSize += info.Size()
		}

		return nil
	})

	return inventory, err
}

// generateDirectoryHashes generates hashes for all files in a directory
func generateDirectoryHashes(inventory DirectoryInventory) (HashResult, error) {
	// Initialize hash functions
	sha256Hasher := sha256.New()
	whirlpoolHasher := whirlpool.New()
	ripemd160Hasher := ripemd160.New()
	sha3_256Hasher := sha3.New256()
	blake2bHasher, _ := blake2b.New256(nil)
	blake3Hasher := blake3.New(32, nil)
	sha512Hasher := sha512.New()
	xxh64Hasher := xxhash.New()
	murmur3Hasher := murmur3.New128()
	
	// Initialize KangarooTwelve hasher
	k12Hasher := k12.NewDraft10([]byte(""))

	// Variables for progress reporting
	var bytesProcessed int64
	lastProgressUpdate := time.Now()
	progressInterval := 3 * time.Second // Update progress every 3 seconds

	// Process each file
	for _, fileInfo := range inventory.Files {
		// Skip directories
		if fileInfo.IsDir {
			continue
		}

		if verbose {
			log.Printf("Processing file: %s\n", fileInfo.RelPath)
		}

		// Open the file
		file, err := os.Open(fileInfo.Path)
		if err != nil {
			return HashResult{}, fmt.Errorf("error opening file %s: %v", fileInfo.Path, err)
		}

		// Read file in chunks and update all hash functions
		buffer := make([]byte, 1024*1024) // 1MB buffer for efficient reading
		for {
			n, err := file.Read(buffer)
			if err != nil && err != io.EOF {
				file.Close()
				return HashResult{}, fmt.Errorf("error reading file %s: %v", fileInfo.Path, err)
			}
			if n == 0 {
				break
			}

			// Update all hash functions
			sha256Hasher.Write(buffer[:n])
			whirlpoolHasher.Write(buffer[:n])
			ripemd160Hasher.Write(buffer[:n])
			sha3_256Hasher.Write(buffer[:n])
			blake2bHasher.Write(buffer[:n])
			blake3Hasher.Write(buffer[:n])
			sha512Hasher.Write(buffer[:n])
			k12Hasher.Write(buffer[:n])
			xxh64Hasher.Write(buffer[:n])
			murmur3Hasher.Write(buffer[:n])
			
			// Also calculate XXH3 hash (this one doesn't use the standard hash.Hash interface)
			xxh3.HashString(string(buffer[:n]))

			// Update progress
			bytesProcessed += int64(n)

			// Show progress if enabled and enough time has passed since last update
			if showProgress && time.Since(lastProgressUpdate) > progressInterval {
				percentComplete := float64(bytesProcessed) / float64(inventory.TotalSize) * 100
				log.Printf("Hashing progress: %.1f%% complete (%.2f MB / %.2f MB)\n",
					percentComplete,
					float64(bytesProcessed)/(1024*1024),
					float64(inventory.TotalSize)/(1024*1024))
				lastProgressUpdate = time.Now()
			}
		}

		file.Close()
	}

	// Show 100% progress at the end if progress reporting is enabled
	if showProgress {
		log.Printf("Hashing progress: 100.0%% complete (%.2f MB)\n",
			float64(inventory.TotalSize)/(1024*1024))
	}

	// Get hash values
	sha256Hash := hex.EncodeToString(sha256Hasher.Sum(nil))
	whirlpoolHash := hex.EncodeToString(whirlpoolHasher.Sum(nil))
	ripemd160Hash := hex.EncodeToString(ripemd160Hasher.Sum(nil))
	sha3_256Hash := hex.EncodeToString(sha3_256Hasher.Sum(nil))
	blake2bHash := hex.EncodeToString(blake2bHasher.Sum(nil))
	blake3Hash := hex.EncodeToString(blake3Hasher.Sum(nil))
	sha512Hash := hex.EncodeToString(sha512Hasher.Sum(nil))
	xxh64Hash := hex.EncodeToString(xxh64Hasher.Sum(nil))
	murmur3Hash := hex.EncodeToString(murmur3Hasher.Sum(nil))

	// For KangarooTwelve
	k12Output := make([]byte, 32) // 32 bytes (256 bits) output
	k12Hasher.Read(k12Output)
	k12Hash := hex.EncodeToString(k12Output)

	// For XXH3 (using a sample string as we can't get a cumulative hash easily)
	xxh3Hash := fmt.Sprintf("%x", xxh3.HashString("Sample for XXH3"))

	// Generate or load GPG key
	log.Println("Generating GPG signature...")
	entity, err := getGPGEntity()
	if err != nil {
		return HashResult{}, fmt.Errorf("error with GPG key: %v", err)
	}

	// Get the key ID
	keyID := fmt.Sprintf("0x%X", entity.PrimaryKey.KeyId)
	
	// Create a string with all hash values to sign
	dataToSign := fmt.Sprintf(
		"Directory: %s\nSHA256: %s\nSHA512: %s\nBLAKE2b: %s\nBLAKE3: %s\nSHA3-256: %s\nKangarooTwelve: %s\nWhirlpool: %s\nRIPEMD-160: %s\nXXH3: %s\nXXHash64: %s\nMurmur3: %s\nTimestamp: %s",
		inventory.RootDir,
		sha256Hash,
		sha512Hash,
		blake2bHash,
		blake3Hash,
		sha3_256Hash,
		k12Hash,
		whirlpoolHash,
		ripemd160Hash,
		xxh3Hash,
		xxh64Hash,
		murmur3Hash,
		time.Now().Format(time.RFC3339),
	)
	
	// Sign the data
	signature, err := signData(entity, []byte(dataToSign))
	if err != nil {
		return HashResult{}, fmt.Errorf("error signing data: %v", err)
	}

	return HashResult{
		KangarooTwelve: k12Hash,
		Blake3:         blake3Hash,
		SHA3_256:       sha3_256Hash,
		Blake2b:        blake2bHash,
		SHA512:         sha512Hash,
		Whirlpool:      whirlpoolHash,
		RIPEMD160:      ripemd160Hash,
		XXH3:           xxh3Hash,
		SHA256:         sha256Hash,
		XXHash64:       xxh64Hash,
		Murmur3:        murmur3Hash,
		GPGKeyID:       keyID,
		GPGSignature:   signature,
	}, nil
}

// createTomlFile creates a TOML file with directory information and hash values
func createTomlFile(tomlPath, dirName string, inventory DirectoryInventory, hashResult HashResult) error {
	// Create TOML file
	file, err := os.Create(tomlPath)
	if err != nil {
		return err
	}
	defer file.Close()

	// ASCII art for the top of the file
	asciiArt := `

                                                                 #####
                                                                #######
                   #                                            ##O#O##
  ######          ###                                           #VVVVV#
    ##             #                                          ##  VVV  ##
    ##         ###    ### ####   ###    ###  ##### #####     #          ##
    ##        #  ##    ###    ##  ##     ##    ##   ##      #            ##
    ##       #   ##    ##     ##  ##     ##      ###        #            ###
    ##          ###    ##     ##  ##     ##      ###       QQ#           ##Q
    ##       # ###     ##     ##  ##     ##     ## ##    QQQQQQ#       #QQQQQQ
    ##      ## ### #   ##     ##  ###   ###    ##   ##   QQQQQQQ#     #QQQQQQQ
  ############  ###   ####   ####   #### ### ##### #####   QQQQQ#######QQQQQ

`

	// Current date and time
	currentTime := time.Now().Format("2006-01-02 15:04:05")

	// Write TOML content
	tomlContent := fmt.Sprintf(`%s
# Generated on: %s

[directory]
name = "%s"
total_files = %d
total_directories = %d
total_size_bytes = %d
inventory_date = "%s"

[hashes]
# Main hashes
kangaroo12 = "%s"
blake3 = "%s"
sha3_256 = "%s"
blake2b = "%s"
sha512 = "%s"

# Less common checksums
whirlpool = "%s"
ripemd160 = "%s"
xxh3 = "%s"

# Additional hashes
sha256 = "%s"
xxhash64 = "%s"
murmur3 = "%s"

[signature]
gpg_key_id = "%s"
gpg_signature = "%s"

[files]
`, asciiArt, currentTime, dirName, inventory.TotalFiles, inventory.TotalDirs, 
   inventory.TotalSize, inventory.InventoryAt.Format("2006-01-02 15:04:05"),
   hashResult.KangarooTwelve, hashResult.Blake3, hashResult.SHA3_256, 
   hashResult.Blake2b, hashResult.SHA512, hashResult.Whirlpool, 
   hashResult.RIPEMD160, hashResult.XXH3, hashResult.SHA256, 
   hashResult.XXHash64, hashResult.Murmur3,
   hashResult.GPGKeyID, hashResult.GPGSignature)

	_, err = file.WriteString(tomlContent)
	if err != nil {
		return err
	}

	// Add file inventory to TOML
	for _, fileInfo := range inventory.Files {
		if !fileInfo.IsDir {
			fileEntry := fmt.Sprintf(`[files."%s"]
size = %d
modified = "%s"

`, fileInfo.RelPath, fileInfo.Size, fileInfo.ModTime.Format("2006-01-02 15:04:05"))
			_, err = file.WriteString(fileEntry)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// zipDirectory creates a ZIP file from a directory
func zipDirectory(sourceDir, zipPath string) error {
	// Create a new ZIP file
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	// Create a new ZIP writer
	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Walk through the source directory
	return filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Create a ZIP header
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}

		// Calculate relative path
		relPath, err := filepath.Rel(sourceDir, path)
		if err != nil {
			return err
		}

		// Skip the root directory itself
		if relPath == "." {
			return nil
		}

		// Use forward slashes for paths in ZIP files
		header.Name = strings.ReplaceAll(relPath, "\\", "/")

		// Set compression method
		header.Method = zip.Deflate

		// Handle directories
		if info.IsDir() {
			header.Name += "/"
		}

		// Create the file in the ZIP
		writer, err := zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}

		// If it's a directory, we're done
		if info.IsDir() {
			return nil
		}

		// Open the source file
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		// Copy the file contents to the ZIP
		_, err = io.Copy(writer, file)
		return err
	})
}