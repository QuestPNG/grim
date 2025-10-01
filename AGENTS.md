# Agent Guidelines for Grim

## Build/Test Commands
- **Dev**: `npm run dev` - Start development server
- **Build**: `npm run build` - TypeScript compile + Vite build
- **Preview**: `npm run preview` - Preview production build
- **Tauri**: `npm run tauri dev` - Start Tauri desktop app
- **Lint**: `tsc --noEmit` - TypeScript type checking
- **Rust build**: `cd src-tauri && cargo build`
- **Rust test**: `cd src-tauri && cargo test`

## Code Style
- **TypeScript**: Strict mode enabled, no unused locals/parameters
- **Imports**: Group by external libs, then internal modules
- **Components**: PascalCase function components with explicit interfaces
- **Props**: Define interfaces for all component props (e.g., `EditorProps`)
- **State**: Use descriptive names, destructure useState hooks
- **Styling**: Material-UI + Emotion, theme-based colors via `getCatppuccinTheme()`
- **Callbacks**: Use `useCallback` for event handlers and functions passed as props
- **File structure**: `/src/ui/` for components, `/src/lib/` for utilities
- **Extensions**: `.tsx` for React components, `.ts` for utilities
- **Rust**: Standard Rust conventions, serde for serialization