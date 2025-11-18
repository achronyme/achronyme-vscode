# Change Log

All notable changes to the Achronyme SOC extension will be documented in this file.

## [0.2.0] - 2024-11-17

### Added

- **Full Language Server Protocol (LSP) Integration**
  - Code Completion with 151 items (109 functions, 19 keywords, 14 types, 9 constants)
  - Signature Help with 56+ function signatures
  - Code Formatting with automatic spacing, indentation, and style normalization
  - Real-time Diagnostics with parse error detection
  - Navigation features (Go to Definition, Find References)
  - Hover Information with rich documentation
  - Document Symbols for outline view

- **Status Bar Integration**
  - Visual indicator showing LSP server status
  - Click to restart the Language Server
  - Tooltip with feature list and status information

- **Automatic LSP Server Download**
  - Extension automatically downloads and installs the Achronyme LSP server on first use
  - Cross-platform support (Windows, macOS, Linux)
  - Support for x64 and ARM64 architectures

### Changed

- **Removed fallback completion provider** - Now fully relies on LSP for intelligent completions
- **Updated package.json** - Added categories, keywords, and improved description
- **Enhanced README** - Comprehensive documentation of all LSP features
- **Version bump** - From 0.1.0 to 0.2.0

### Improved

- Better error handling for LSP server startup
- More informative user messages
- Enhanced configuration options for LSP server

## [0.1.0] - Initial Release

### Added

- Syntax highlighting for Achronyme SOC language
- Basic code completion for keywords and built-in functions
- Code snippets for common patterns
- Bracket matching and auto-closing
- Comment support
- File icons for .soc and .ach files
- Basic language configuration
