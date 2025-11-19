# Grim

A cross-platform markdown editor built with Tauri, React, and TypeScript, featuring Vim keybindings and a clean interface.

## Features

- **Markdown editing** with syntax highlighting using CodeMirror
- **File tree navigation** for easy file management
- **Vim keybindings** for efficient text editing
- **Theme support** with Catppuccin color schemes
- **Directory picker** to open any folder on your system
- **Cross-platform** support for Windows, macOS, and Linux

## Getting Started

### Prerequisites

- **Node.js** 16+ and npm (or your preferred package manager)
- **Rust** 1.70+ (for Tauri)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd grim
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Run the Tauri desktop application:
```bash
npm run tauri dev
```

### First Run

When you first run Grim, it will automatically create:
- A configuration directory at the standard location for your OS:
  - **Windows**: `%APPDATA%\com.devin.grim\`
  - **macOS**: `~/Library/Application Support/com.devin.grim/`
  - **Linux**: `~/.config/com.devin.grim/`
- Default configuration files and an example markdown document

## Keyboard Shortcuts

Grim uses Vim-style keybindings with leader key sequences:

- **Leader key**: `Space` (when not in insert mode)
- `Space + op` - Toggle file tree
- `Space + wh` - Focus file tree
- `Space + wl` - Focus editor
- `Space + tc` - Toggle color theme display
- `Space + pd` - Print document (debug)

### Vim Commands

- `:w` - Save current file
- Standard Vim navigation and editing commands

## Cross-Platform Notes

### Configuration Storage

Grim stores its configuration and notes in platform-appropriate directories:

- **Windows**: `%APPDATA%\com.devin.grim\`
- **macOS**: `~/Library/Application Support/com.devin.grim/`  
- **Linux**: `~/.config/com.devin.grim/`

The application will automatically create these directories and populate them with default content on first run.

### Building for Different Platforms

To build for specific platforms, use Tauri's build commands:

```bash
# Build for current platform
npm run tauri build

# Build with specific targets
npm run tauri build -- --target universal-apple-darwin  # macOS Universal
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows x64
npm run tauri build -- --target x86_64-unknown-linux-gnu # Linux x64
```

**NOTE:** For building on Linux, you may need to run `NO_STRIP=true npm run tauri build` for compatibility with certain distributions.

### Dependencies

All dependencies are cross-platform compatible:
- No platform-specific build tools required beyond standard Rust/Node.js toolchains
- Uses standard web technologies (React, TypeScript, CSS)
- Tauri handles platform-specific functionality through its unified API

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Editor.tsx      # Main code editor
│   ├── FileTree.tsx    # File navigation
│   └── Toolbar.tsx     # Top toolbar with controls
├── lib/
│   ├── config.ts       # Configuration management
│   └── codemirror/     # CodeMirror extensions
├── ui/
│   └── theme/          # Theme configuration
└── App.tsx             # Main application component

src-tauri/
├── src/                # Rust backend code
├── capabilities/       # Tauri security permissions  
└── tauri.conf.json     # Tauri configuration
```

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### Adding Features

1. **Frontend**: Add React components in `src/components/`
2. **Backend**: Add Rust commands in `src-tauri/src/`
3. **Configuration**: Update interfaces in `src/lib/config.ts`

### Code Style

- TypeScript with strict mode enabled
- React functional components with hooks
- Material-UI for consistent styling
- Descriptive naming and proper TypeScript interfaces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test on multiple platforms if possible
5. Submit a pull request

## License

[License information]

## Troubleshooting

### Common Issues

**"Permission denied" errors**:
- Ensure Tauri has proper filesystem permissions
- Check that the config directory is writable

**"Command not found" errors**:
- Ensure both Node.js and Rust are installed and in PATH
- Run `npm install` to install dependencies

**Build failures**:
- Update Rust toolchain: `rustup update`
- Clear node modules: `rm -rf node_modules && npm install`
- Clear Tauri cache: `npm run tauri build -- --clear`
