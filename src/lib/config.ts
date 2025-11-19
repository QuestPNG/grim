import { BaseDirectory, exists, readFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";

export interface AppConfig {
  defaultFile: string;
  lastOpenedDirectory: string | null;
  theme: string;
}

const DEFAULT_CONFIG: AppConfig = {
  defaultFile: "example.md",
  lastOpenedDirectory: null,
  theme: "frappe"
};

const CONFIG_FILE = "grim/config.json";
const NOTES_DIR = "grim/notes";
const EXAMPLE_FILE = "grim/notes/example.md";

const EXAMPLE_CONTENT = `# Welcome to Grim

This is an example markdown file to get you started.

## Features

- **Markdown editing** with syntax highlighting
- **File tree** for navigation  
- **Theme support** with Catppuccin colors
- **Directory picker** to open any folder

## Getting Started

1. Use the "File" button in the toolbar to open a folder
2. Use Vim keybindings in the editor
3. Use Space + key combinations for shortcuts:
   - \`Space + op\` - Toggle file tree
   - \`Space + wh\` - Focus file tree
   - \`Space + wl\` - Focus editor
   - \`Space + tc\` - Toggle color display

Happy writing!
`;

export async function ensureConfigExists(): Promise<AppConfig> {
  try {
    // Check if config file exists
    const configExists = await exists(CONFIG_FILE, { baseDir: BaseDirectory.Config });
    
    if (!configExists) {
      console.log("Config file not found, creating default configuration...");
      
      // Create the grim directory structure
      try {
        await mkdir("grim", { baseDir: BaseDirectory.Config, recursive: true });
        await mkdir(NOTES_DIR, { baseDir: BaseDirectory.Config, recursive: true });
      } catch (error) {
        console.log("Directory already exists or error creating:", error);
      }
      
      // Create example file
      await writeTextFile(EXAMPLE_FILE, EXAMPLE_CONTENT, { baseDir: BaseDirectory.Config });
      
      // Create config file
      const defaultConfigWithPath: AppConfig = {
        ...DEFAULT_CONFIG,
        defaultFile: EXAMPLE_FILE
      };
      
      await writeTextFile(CONFIG_FILE, JSON.stringify(defaultConfigWithPath, null, 2), {
        baseDir: BaseDirectory.Config
      });
      
      return defaultConfigWithPath;
    }
    
    // Read existing config
    const raw = await readFile(CONFIG_FILE, { baseDir: BaseDirectory.Config });
    const decoder = new TextDecoder("utf-8");
    const content = decoder.decode(raw);
    const config = JSON.parse(content) as AppConfig;
    
    return config;
  } catch (error) {
    console.error("Error handling config:", error);
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  try {
    await writeTextFile(CONFIG_FILE, JSON.stringify(config, null, 2), {
      baseDir: BaseDirectory.Config
    });
  } catch (error) {
    console.error("Error saving config:", error);
  }
}

export function getNotesDirectory(): string {
  return NOTES_DIR;
}