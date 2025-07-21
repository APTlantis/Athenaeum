# Dir-Hasher

Dir-Hasher is a tool for generating cryptographic hashes and checksums for entire directories, creating a TOML inventory file, and zipping the directory. It's based on the iso-hasher tool but adapted to work with project directories instead of ISO files.

## Features

- Recursively inventories all files in a directory
- Generates multiple cryptographic hashes and checksums:
  - **5 Main Hashes**: KangarooTwelve, BLAKE3, SHA3-256, BLAKE2b, SHA-512
  - **3 Less Common Checksums**: Whirlpool, RIPEMD-160, XXH3
  - **Additional Hashes**: SHA-256, XXHash64, Murmur3
- Creates a detailed TOML file with:
  - Directory information (name, file count, size, etc.)
  - All hash values
  - Complete file inventory with sizes and timestamps
- Automatically zips the entire directory
- Progress reporting for large directories

## Installation

### Prerequisites

- Go 1.16 or later

### Building from Source

1. Clone the repository or download the source code
2. Navigate to the directory containing the source code
3. Initialize the Go module:
   ```
   go mod init dir-hasher
   ```
4. Install dependencies:
   ```
   go mod tidy
   ```
5. Build the executable:
   ```
   go build
   ```

## Usage

```
dir-hasher -dir <directory_path> [options]
```

### Options

- `-dir string`: Directory to hash and zip (required)
- `-verbose`: Enable verbose output
- `-progress`: Show progress when hashing large files (default true)
- `-gpgkey string`: Path to GPG private key file (if not provided, a new key will be generated)

### Example

```
dir-hasher -dir C:\Projects\my-project -verbose
```

This will:
1. Create an inventory of all files in the `C:\Projects\my-project` directory
2. Generate hashes for all files
3. Generate a new GPG key pair and sign the hash data
4. Create a TOML file at `C:\Projects\my-project.toml`
5. Create a ZIP file at `C:\Projects\my-project.zip`

### Using an Existing GPG Key

If you want to use an existing GPG key for signing:

```
dir-hasher -dir C:\Projects\my-project -gpgkey C:\path\to\private-key.asc
```

The private key file should be in ASCII-armored format.

## Output

### TOML File Structure

The generated TOML file includes:

```toml
# Generated on: YYYY-MM-DD HH:MM:SS

[directory]
name = "directory-name"
total_files = 123
total_directories = 45
total_size_bytes = 67890123
inventory_date = "YYYY-MM-DD HH:MM:SS"

[hashes]
# Main hashes
kangaroo12 = "hash-value"
blake3 = "hash-value"
sha3_256 = "hash-value"
blake2b = "hash-value"
sha512 = "hash-value"

# Less common checksums
whirlpool = "hash-value"
ripemd160 = "hash-value"
xxh3 = "hash-value"

# Additional hashes
sha256 = "hash-value"
xxhash64 = "hash-value"
murmur3 = "hash-value"

[signature]
gpg_key_id = "0xABCDEF1234567890"
gpg_signature = """
-----BEGIN PGP SIGNATURE-----
Version: GnuPG v2

iQEzBAABCAAdFiEEq1VR5N4kR/VF4xOuHSQEBQL8TTQFAmXXXXXACgkQHSQEBQL8
TTQzQQf/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
=XXXX
-----END PGP SIGNATURE-----
"""

[files]
[files."relative/path/to/file1"]
size = 12345
modified = "YYYY-MM-DD HH:MM:SS"

[files."relative/path/to/file2"]
size = 67890
modified = "YYYY-MM-DD HH:MM:SS"
```

### ZIP File

The ZIP file contains all files and directories from the source directory, preserving the directory structure.

## Dependencies

- github.com/cloudflare/circl/xof/k12 - For KangarooTwelve hash
- github.com/jzelinskie/whirlpool - For Whirlpool hash
- golang.org/x/crypto/blake2b - For BLAKE2b hash
- golang.org/x/crypto/ripemd160 - For RIPEMD-160 hash
- golang.org/x/crypto/sha3 - For SHA3-256 hash
- lukechampine.com/blake3 - For BLAKE3 hash
- github.com/zeebo/xxh3 - For XXH3 hash
- github.com/cespare/xxhash/v2 - For XXHash64
- github.com/spaolacci/murmur3 - For Murmur3 hash
- archive/zip - For ZIP file creation

## License

This project is licensed under the MIT License - see the LICENSE file for details.