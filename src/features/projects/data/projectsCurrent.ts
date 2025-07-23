// This file contains the data for all the projects
// In a real app, this would likely come from an API

export interface Project {
  id: string;
  title: string;
  description: string;
  buttonColor: string;
  buttonText: string;
  repoUrl: string;
  logoSrc: string;
  websiteUrl: string;
  demoUrl?: string;
  aboutText?: string;
  releaseYear?: number;
  longDescription?: string;
  features?: string[];
  technologies?: string[];
  languages?: string[];
  frameworks?: string[];
  platforms?: string[];
  screenshots?: string[];
  communityLinks?: {
    type: string;
    url: string;
  }[];
  documentation?: string;
  lastUpdate?: string;
  isArchived?: boolean;
  videos?: string[];
  blogPosts?: string[];
  projectContext?: string;
  minimumRequirements?: string;
  recommendedRequirements?: string;
  hasDownloads?: boolean;
  downloadOptions?: {
    zipToml?: {
      zipPath: string;
      tomlPath: string;
    };
    torrent?: {
      path: string;
    };
  };
}

export const projects: Project[] = [
  {
    id: 'templeoscodeextractor',
    title: 'TempleOS Code Extractor',
    description:
      'A Rust tool for extracting HolyC, C, and Assembly code snippets from TempleOS HTML archives, preserving Terry Davis\'s programming legacy.',
    buttonColor:
      'bg-forest-500 dark:bg-forest-700 text-white hover:bg-forest-600 dark:hover:bg-forest-800',
    buttonText: 'Visit Repository',
    repoUrl: 'https://codeberg.org/holycmodel/templeos-code-extractor',
    logoSrc: '/images/DALL·E 2025-06-26 13.41.16 - A neon-style emblem featuring a fictional corrupted goddess named Malvara, the Goddess of Digital Decay. The figure is fully visible and centered insi.webp',
    websiteUrl: 'https://holycmodel.org/tools/templeos-code-extractor',
    hasDownloads: true,
    downloadOptions: {
      zipToml: {
        zipPath: '/zips/templeos-code-extractor.zip',
        tomlPath: '/src/shared/projects/templeos-code-extractor/Downloads/templeos-code-extractor.toml'
      },
      torrent: {
        path: '/src/shared/projects/templeos-code-extractor/Downloads/TempleOS-Code-Extractor.torrent'
      }
    },
    longDescription: `The TempleOS Code Extractor is a specialized tool designed to preserve Terry Davis's programming legacy by extracting code snippets from archived TempleOS HTML files. The tool scans through HTML archives of the original TempleOS website, identifies code blocks, and extracts them into organized files.

The extractor performs several key functions:
- Scans directories containing HTML files from TempleOS archives
- Filters content related to Terry Davis, TempleOS, or HolyC
- Extracts code snippets from HTML <pre> and <code> tags
- Identifies programming languages (HolyC, C, Assembly) using pattern matching
- Organizes extracted code by language into separate directories
- Adds metadata headers with source information and dates
- Processes files in parallel for efficiency

This tool was instrumental in creating the dataset used for fine-tuning the HolyC AI Model, allowing us to preserve and study Terry Davis's unique programming style and contributions to computing.`,
    minimumRequirements:
      'Rust 1.70+, 512 MB RAM, 1 GB disk space for extracted code',
    recommendedRequirements:
      'Rust 1.75+, multi-core CPU, 1 GB RAM, 5 GB disk space, SSD for faster processing',
    technologies: ['Rust', 'HTML Parsing', 'Parallel Processing', 'Pattern Matching', 'File Management'],
    languages: ['Rust', 'HolyC', 'C', 'Assembly'],
    frameworks: ['html5ever', 'scraper', 'rayon', 'regex', 'walkdir'],
    features: [
      'Intelligent language detection for HolyC, C, and Assembly',
      'Parallel processing for efficient extraction',
      'Metadata preservation with source information',
      'Organized output by programming language',
      'Terry Davis and TempleOS-specific content filtering',
      'Progress tracking for large archives'
    ]
  },
  {
    id: 'tinyllama',
    title: 'HolyC Fine-tuned AI Model',
    description:
      'We create datasets from 1.4 million html pages of the original TempleOS website, fine-tuning TinyLlama to understand and generate code in the HolyC programming language.',
    buttonColor:
      'bg-forest-500 dark:bg-forest-700 text-white hover:bg-forest-600 dark:hover:bg-forest-800',
    buttonText: 'Visit Website',
    repoUrl: 'https://codeberg.org/holycmodel/tinyllama',
    logoSrc: '/images/hecate.webp',
    websiteUrl: 'https://holycmodel.org',
    demoUrl: 'https://demo.holycmodel.org',
    hasDownloads: true,
    downloadOptions: {
      zipToml: {
        zipPath: '/zips/holyc-model.zip',
        tomlPath: '/src/shared/projects/holyc-model/Downloads/holyc-model.toml'
      },
      torrent: {
        path: '/src/shared/projects/holyc-model/Downloads/HolyC-Model.torrent'
      }
    },
    longDescription: `I started out with an archive.org torrent, 830 GB, of the original TempleOS website, which contains 1.4 million html pages. As well as the original TempleOS source code and iso files, it contains a lot of other information about Terry A. Davis, his life, and his work.

Then I wrote a powershell script to flatten the html directory. Then came a Go script to pull all the HolyC source code, which is written by Terry, and extract that. Once I had that I used Python to convert the HolyC JSONL into a usable dataset, then another Python script to fine-tune TinyLlama on the HolyC dataset.`,
    minimumRequirements:
      '1 GHz processor, 256 MB RAM, 700 MB disk space, basic VGA graphics, Internet connection recommended for setup',
    recommendedRequirements:
      '1.5 GHz dual-core processor, 512 MB RAM, 2 GB disk space, standard VGA graphics, Broadband internet connection',
    technologies: ['Python', 'TinyLlama', 'HolyC', 'JSONL', 'Go', 'PowerShell'],
    languages: ['Python', 'HolyC', 'Go', 'PowerShell'],
    frameworks: ['PyTorch', 'Hugging Face Transformers'],
    features: [
      'Fine-tuned language model for HolyC',
      'Dataset creation from TempleOS website',
      'Code generation capabilities',
      'Interactive demo'
    ]
  },
  {
    id: 'isohasher',
    title: 'ISO Hashing Tools',
    description:
        'Creating Rust and Go tools for hashing ISO files, 8 hashes TOML output.',
    buttonColor:
        'bg-forest-500 dark:bg-forest-700 text-white hover:bg-forest-600 dark:hover:bg-forest-800',
    buttonText: 'Visit Website',
    repoUrl: 'https://codeberg.org/aptlantis/isohasher',
    logoSrc: '/images/morrigan-war-fate.webp',
    websiteUrl: 'https://aptlantis.net/tools/isohasher',
    demoUrl: 'https://demo.aptlantis.net/isohasher',
    hasDownloads: true,
    downloadOptions: {
      zipToml: {
        zipPath: '/zips/iso-hasher.zip',
        tomlPath: '/src/shared/projects/iso-hasher/Downloads/iso-hasher.toml'
      },
      torrent: {
        path: '/src/shared/projects/iso-hasher/Downloads/ISO-Hasher.torrent'
      }
    },
    longDescription: `ISO Hasher is a tool I developed for Aptlantis.net, a massive Linux mirror I run. The tool recursively scans directories for ISO files and generates multiple cryptographic hashes for each file, creating TOML files with detailed hash information.

The tool uses 8 different cryptographic hash algorithms organized into categories:
- Standard: SHA-256, SHA-512
- Legacy/Retro: Whirlpool, RIPEMD-160
- Post-Quantum Oriented: KangarooTwelve, SHA-3/Keccak
- Modern/Fast: BLAKE2b, BLAKE3

Each TOML file includes ASCII art, a creation timestamp, and all 8 hash values, making it easy to verify the integrity of ISO files. The tool is designed for performance with features like parallel processing, efficient file reading with a 1MB buffer, and progress reporting for large files.`,
    minimumRequirements:
        'Go 1.16 or later, 256 MB RAM, sufficient disk space for ISO files and TOML files',
    recommendedRequirements:
        'Go 1.18 or later, 512 MB RAM, SSD storage for faster processing',
    technologies: ['Go', 'TOML', 'Cryptography', 'CLI Tools', 'File Hashing'],
    languages: ['Go'],
    frameworks: ['circl/xof/k12', 'whirlpool', 'crypto/blake2b', 'crypto/ripemd160', 'crypto/sha3', 'blake3'],
    features: [
      'Recursive directory scanning for ISO files',
      'Multiple cryptographic hash algorithms (8 different types)',
      'TOML output format with ASCII art and timestamps',
      'Progress reporting for large files',
      'Parallel processing with configurable worker count',
      'Skip existing files option',
      'Verbose logging option'
    ]
  },
  {
    id: 'convertimages',
    title: 'Image to WebP Converter',
    description:
        'Multi-language tools for converting images to WebP format while preserving the original files.',
    buttonColor:
        'bg-forest-500 dark:bg-forest-700 text-white hover:bg-forest-600 dark:hover:bg-forest-800',
    buttonText: 'Visit Website',
    repoUrl: 'https://codeberg.org/aptlantis/convertimages',
    logoSrc: '/images/eris-discord-and-strife.webp',
    websiteUrl: 'https://aptlantis.net/tools/convertimages',
    demoUrl: 'https://demo.aptlantis.net/convertimages',
    hasDownloads: true,
    downloadOptions: {
      zipToml: {
        zipPath: '/zips/convert-images.zip',
        tomlPath: '/src/shared/projects/convert-images/Downloads/convert-images.toml'
      },
      torrent: {
        path: '/src/shared/projects/convert-images/Downloads/Image-Converter.torrent'
      }
    },
    longDescription: `Image to WebP Converter is a versatile tool that converts various image formats (JPEG, PNG, GIF, BMP, TIFF) to WebP format while preserving the original files. The project includes implementations in multiple languages to suit different environments and use cases.

The tool supports the following features:
- Conversion of multiple image formats to WebP
- Preservation of transparency in PNG images
- Customizable quality settings for WebP output
- Recursive directory scanning
- Command-line interface with customizable options
- Cross-platform compatibility

The project includes three implementations:
1. Python script using the Pillow library
2. Go implementation using the github.com/chai2010/webp library
3. Windows batch script for easy use on Windows systems

Each implementation provides similar functionality with language-specific optimizations and features.`,
    minimumRequirements:
        'Python 3.6 or higher with Pillow library, or Go 1.16 or later with github.com/chai2010/webp',
    recommendedRequirements:
        'Python 3.8+ with latest Pillow version, or Go 1.18+ with latest dependencies, 512 MB RAM for processing large images',
    technologies: ['Python', 'Go', 'Batch', 'WebP', 'Image Processing', 'CLI Tools'],
    languages: ['Python', 'Go', 'Batch'],
    frameworks: ['Pillow', 'github.com/chai2010/webp'],
    features: [
      'Support for multiple image formats (JPEG, PNG, GIF, BMP, TIFF)',
      'Preservation of transparency in PNG images',
      'Customizable WebP quality settings',
      'Command-line interface with various options',
      'Multiple language implementations (Python, Go, Batch)',
      'Cross-platform compatibility',
      'Efficient processing of image files'
    ]
  },
  {
    id: 'mirrorcrustcrates',
    title: 'Rust Crates Mirror Script',
    description:
        'Tool for mirroring Rust crates from crates.io to a local directory with multi-threaded downloading and verification.',
    buttonColor:
        'bg-forest-500 dark:bg-forest-700 text-white hover:bg-forest-600 dark:hover:bg-forest-800',
    buttonText: 'Visit Website',
    repoUrl: 'https://codeberg.org/aptlantis/mirrorcrustcrates',
    logoSrc: '/images/DALL·E 2025-06-26 13.43.14 - A neon-style emblem featuring the Slavic god Veles, the deity of earth, waters, magic, and the underworld. The full figure is clearly visible and cent.webp',
    websiteUrl: 'https://aptlantis.net/tools/mirrorcrustcrates',
    demoUrl: 'https://demo.aptlantis.net/mirrorcrustcrates',
    hasDownloads: true,
    downloadOptions: {
      zipToml: {
        zipPath: '/zips/mirror-rust-crates.zip',
        tomlPath: '/src/shared/projects/mirror-rust-crates/Downloads/mirror-rust-crates.toml'
      },
      torrent: {
        path: '/src/shared/projects/mirror-rust-crates/Downloads/Mirror-Rust-Crates.torrent'
      }
    },
    longDescription: `Rust Crates Mirror Script is a tool I developed to automate the process of mirroring Rust crates from crates.io to a local directory. It handles both cloning/updating the crates.io index repository and downloading the actual crate files.

The tool includes the following features:
- Automatic cloning or updating of the crates.io index repository
- Multi-threaded downloading for efficient mirroring
- Rate limiting to avoid overwhelming the crates.io server
- Resume capability for interrupted downloads
- Verification of downloaded crates
- Detailed logging of download progress and errors

The script is designed to be flexible with various command-line options for customizing the mirroring process, including specifying custom directories, adjusting thread count, and controlling rate limiting. It's particularly useful for maintaining local mirrors of Rust crates in environments with limited or expensive internet connectivity.`,
    minimumRequirements:
        'Python 3.6 or higher, Git, requests and tqdm Python packages, sufficient disk space for crate files',
    recommendedRequirements:
        'Python 3.8+, Git 2.0+, 512 MB RAM, SSD storage for faster processing, broadband internet connection',
    technologies: ['Python', 'Git', 'Rust', 'Package Management', 'CLI Tools', 'Mirroring'],
    languages: ['Python', 'Bash'],
    frameworks: ['requests', 'tqdm'],
    features: [
      'Automatic cloning/updating of crates.io index repository',
      'Multi-threaded downloading for efficient mirroring',
      'Rate limiting to avoid overwhelming the server',
      'Resume capability for interrupted downloads',
      'Verification of downloaded crates',
      'Detailed logging of download progress and errors',
      'Customizable options for directories, threads, and rate limiting'
    ]
  },
  {
    id: 'isoscanner',
    title: 'ISO Scanner',
    description:
        'Tool for recursively scanning directories for ISO files and efficiently copying them with rsync.',
    buttonColor:
        'bg-forest-500 dark:bg-forest-700 text-white hover:bg-forest-600 dark:hover:bg-forest-800',
    buttonText: 'Visit Website',
    repoUrl: 'https://codeberg.org/aptlantis/isoscanner',
    logoSrc: '/images/DALL·E 2025-06-26 13.43.07 - A neon-style emblem featuring the Egyptian goddess Sekhmet, the lion-headed goddess of war and healing. The full figure is centered and clearly visibl.webp',
    websiteUrl: 'https://aptlantis.net/tools/isoscanner',
    demoUrl: 'https://demo.aptlantis.net/isoscanner',
    hasDownloads: true,
    downloadOptions: {
      zipToml: {
        zipPath: '/zips/iso-scanner.zip',
        tomlPath: '/src/shared/projects/iso-scanner/Downloads/iso-scanner.toml'
      },
      torrent: {
        path: '/src/shared/projects/iso-scanner/Downloads/ISO-Scanner.torrent'
      }
    },
    longDescription: `ISO Scanner is a tool designed to recursively scan a source directory for ISO files and their checksums, and copy them to a destination directory. It's specifically built to handle large volumes of data (80TB+) efficiently.

The tool includes the following features:
- Recursive scanning for ISO files
- Optional inclusion of checksum files (.md5, .sha1, .sha256, etc.)
- MD5 checksum verification for file integrity
- Efficient copying using rsync
- Parallel processing with multiple worker threads
- Bandwidth limiting options to avoid network congestion
- Dry-run capability for testing before actual copying

The tool is available as both a Go implementation and shell script wrappers for easier use. It creates a structured directory hierarchy in the destination that mirrors the source, making it ideal for organizing large collections of ISO files.`,
    minimumRequirements:
        'Go 1.13 or higher, rsync installed on the system, sufficient disk space for ISO files',
    recommendedRequirements:
        'Go 1.16 or later, multi-core CPU, 1GB+ RAM, SSD storage for faster processing, broadband internet connection',
    technologies: ['Go', 'Rsync', 'CLI Tools', 'File Management', 'Parallel Processing'],
    languages: ['Go', 'Bash'],
    frameworks: [],
    features: [
      'Recursive directory scanning for ISO files',
      'Checksum file support (.md5, .sha1, .sha256)',
      'MD5 verification for file integrity',
      'Efficient copying with rsync',
      'Parallel processing with configurable worker count',
      'Bandwidth limiting options',
      'Dry-run capability for testing',
      'Structured directory mirroring'
    ]
  },
  {
    id: 'organizecrates',
    title: 'Organize Crates',
    description:
        'Tool for organizing Rust crates from a flat directory structure into a hierarchical structure with metadata management.',
    buttonColor:
        'bg-forest-500 dark:bg-forest-700 text-white hover:bg-forest-600 dark:hover:bg-forest-800',
    buttonText: 'Visit Website',
    repoUrl: 'https://codeberg.org/aptlantis/organizecrates',
    logoSrc: '/images/DALL·E 2025-06-26 13.38.24 - A neon-style emblem featuring Ashi, the Zoroastrian spirit of righteousness, reward, and divine order. The figure is centered and fully visible inside.webp',
    websiteUrl: 'https://aptlantis.net/tools/organizecrates',
    demoUrl: 'https://demo.aptlantis.net/organizecrates',
    hasDownloads: true,
    longDescription: `Organize Crates is a comprehensive tool for managing large collections of Rust crates and their metadata. It's particularly useful for maintaining local mirrors of crates.io, where all crate files (approximately 1.5 million) are typically downloaded to a single flat directory.

The project consists of three main components:

1. **Crate Organizer**: Reorganizes Rust crates from a flat directory structure into a hierarchical structure with two levels of subdirectories based on filename, significantly reducing the number of files per directory for easier management.

2. **Metadata Organizer (Python)**: Processes metadata files from the crates.io-index repository and places them alongside their corresponding crate files, making it easier to access and use the metadata.

3. **Metadata Organizer (Go)**: A high-performance Go implementation of the metadata organizer, optimized for processing large numbers of files with features like pre-indexing, efficient parallelism, and regular progress updates.

Key features include multi-threaded processing, dry-run capability for testing, comprehensive logging, and intelligent grouping of directories to balance file distribution. The tools are designed to handle extremely large collections of files efficiently, with options for customizing directories, thread counts, and other parameters.`,
    minimumRequirements:
        'Python 3.6 or higher with tqdm package, or Go 1.16 or later, sufficient disk space for crate files',
    recommendedRequirements:
        'Python 3.8+ or Go 1.18+, multi-core CPU, 1GB+ RAM, SSD storage for faster processing',
    technologies: ['Python', 'Go', 'Batch', 'CLI Tools', 'File Management', 'Parallel Processing'],
    languages: ['Python', 'Go', 'Batch'],
    frameworks: ['tqdm'],
    features: [
      'Hierarchical directory organization for efficient file management',
      'Metadata extraction and organization alongside crate files',
      'Multi-threaded processing for performance',
      'Pre-indexing of files for faster lookups (Go version)',
      'Intelligent grouping of directories to balance file distribution',
      'Dry-run capability for testing',
      'Comprehensive logging with detailed statistics',
      'Progress tracking for long-running operations'
    ]
  },
  {
    id: 'aptdl',
    title: 'APTlantis File Downloader',
    description:
        'Lightweight, cross-platform file downloader designed for humanitarian efforts in restrictive environments.',
    buttonColor:
        'bg-forest-500 dark:bg-forest-700 text-white hover:bg-forest-600 dark:hover:bg-forest-800',
    buttonText: 'Visit Website',
    repoUrl: 'https://codeberg.org/aptlantis/aptdl',
    logoSrc: '/images/DALL·E 2025-06-26 13.38.13 - A neon-style emblem featuring Taweret, the ancient Egyptian goddess of protection, childbirth, and motherhood. The figure is centered and fully visibl.webp',
    websiteUrl: 'https://aptlantis.net/tools/aptdl',
    demoUrl: 'https://demo.aptlantis.net/aptdl',
    hasDownloads: true,
    longDescription: `APTlantis File Downloader is a lightweight, cross-platform file downloader application designed for humanitarian efforts to provide information to people in restrictive environments such as Iran, China, North Korea, and parts of Africa.

The application includes the following features:
- Downloads a file list from aptlantis.net/files.txt
- Displays the file list to users with file sizes (if available)
- Allows selection of one or multiple files for download
- Shows download progress with speed and ETA
- Works across platforms (Windows, macOS, Linux, etc.)
- No external dependencies
- Small executable size
- Uses HTTPS for secure communication
- Stores file list in memory (no local file storage required)
- Handles network interruptions gracefully
- Creates a dedicated downloads folder

Key design considerations include:
- No external dependencies: The application is completely self-contained and doesn't rely on external tools like wget.
- Small footprint: The compiled binary is as small as possible to facilitate distribution in bandwidth-constrained environments.
- Cross-platform: Works on a wide range of devices and operating systems, from modern iPads to Windows 7.
- Secure communication: Uses HTTPS to hide path, file content, and headers from surveillance.
- Simple interface: Easy to use even for users with limited technical experience.`,
    minimumRequirements:
        'Any modern operating system (Windows 7+, macOS 10.12+, Linux with glibc 2.14+), 50MB RAM, 10MB disk space',
    recommendedRequirements:
        'Windows 10+, macOS 10.15+, or Ubuntu 20.04+, 100MB RAM, 20MB disk space, stable internet connection',
    technologies: ['Go', 'HTTPS', 'CLI Tools', 'Cross-platform', 'File Management', 'Humanitarian'],
    languages: ['Go'],
    frameworks: [],
    features: [
      'File list downloading and display',
      'Multiple file selection for download',
      'Progress reporting with speed and ETA',
      'Cross-platform compatibility',
      'No external dependencies',
      'Small executable size',
      'Secure HTTPS communication',
      'In-memory file list storage',
      'Network interruption handling',
      'Simple user interface'
    ]
  }
];