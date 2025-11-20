import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { getCatppuccinTheme } from "./ui/theme/theme";
import { Box, Collapse, CssBaseline, IconButton, ThemeProvider } from "@mui/material";
import { Editor } from "./components/Editor";
import { Toolbar } from "./components/Toolbar";
import { ThemeColorDisplay } from "./components/ThemeColorDisplay";
import { EditorView } from "@uiw/react-codemirror";
import { convertTauriToTreeViewItemsRecursive, FileTree } from "./components/FileTree";
import { TreeViewBaseItem, useTreeViewApiRef } from "@mui/x-tree-view";
import { BaseDirectory, readDir, readFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { Vim } from "@replit/codemirror-vim";
import MenuIcon from '@mui/icons-material/Menu';
import { ensureConfigExists, saveConfig, getNotesDirectory, type AppConfig } from "./lib/config";

function App() {

  // TODO: Create state object to remember which component/item is currently focused
  // Allow FileTree and Editor to set focus state when clicked
  

  const [config, setConfig] = useState<AppConfig | null>(null);

  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const currentFileRef = useRef(currentFile);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const appConfig = await ensureConfigExists();
        setConfig(appConfig);
        console.log("Config loaded:", appConfig);

        const defaultFile = appConfig.defaultFile;
        const raw = await readFile(defaultFile, { baseDir: BaseDirectory.Config });
        const decoder = new TextDecoder("utf-8");
        const fileContent = decoder.decode(raw);
        console.log("Default file content:", fileContent);
        setValue(fileContent);
        setCurrentFile(defaultFile);
      } catch (error) {
        console.log("Error reading config file:", error);
      }
    };

    fetchConfig();
  }, []);

  // Component Refs
  //const editorRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const treeRef = useTreeViewApiRef();
  const treeViewRef = useRef<any>(null);

  const [editorView, setEditorView] = useState<EditorView | null>(null)
  const [editorMode, setEditorMode] = useState<string>("normal");
  const [flavor] = useState("frappe");
  const [open, setOpen] = useState(false);
  const [showColorDisplay, setShowColorDisplay] = useState(false);

  const [value, setValue] = useState<string>("");

  const valueRef = useRef(value);

  const LEADER_TIMEOUT = 700;
  const [leaderActive, setLeaderActive] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  //const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetLeader = useCallback(() => {
    setLeaderActive(false);
    setSequence([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const leaderActiveRef = useRef(leaderActive);
  const sequenceRef = useRef(sequence);
  const editorViewRef = useRef(editorView);
  const editorModeRef = useRef(editorMode);


  useEffect(() => {
    leaderActiveRef.current = leaderActive;
    sequenceRef.current = sequence;
    editorViewRef.current = editorView;
    editorModeRef.current = editorMode;

    valueRef.current = value;
    currentFileRef.current = currentFile;
  }, [leaderActive, sequence, editorView, editorMode, value]);

  const startTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      console.log("Leader key timeout, resetting");
      resetLeader();
    }, LEADER_TIMEOUT);
  }, []);


  const [treeItems, setTreeItems] = useState<TreeViewBaseItem[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);

  const theme = getCatppuccinTheme(flavor);

  const drawerWidth = 200;

  const sidebarWidth = 40;


  const handleFileSelect =  async (fileId: string, fileName: string) => {
    console.log("Selected file:", fileName, "with ID:", fileId);
    
    try {
      let fileContent: string;
      
      if (currentDirectory) {
        // If we have a current directory, read file from there
        const raw = await readFile(fileId);
        const decoder = new TextDecoder("utf-8");
        fileContent = decoder.decode(raw);
      } else {
        // Fallback to the original behavior for config directory
        const raw = await readFile(fileId, { baseDir: BaseDirectory.Config });
        const decoder = new TextDecoder("utf-8");
        fileContent = decoder.decode(raw);
      }
      
      setValue(fileContent);
      setCurrentFile(fileId);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const handleFileCreated = useCallback(async (fileName: string, filePath: string) => {
    console.log("File created:", fileName, "at path:", filePath);
    
    // Refresh the tree items to show the new file
    try {
      const notesDir = getNotesDirectory();
      const dir = await readDir(notesDir, { baseDir: BaseDirectory.Config });
      const newTreeItems = await convertTauriToTreeViewItemsRecursive(dir, notesDir, BaseDirectory.Config);
      setTreeItems(newTreeItems);
      
      // Optionally, select the newly created file
      setValue(''); // Start with empty content
      setCurrentFile(filePath);
    } catch (error) {
      console.error("Error refreshing tree after file creation:", error);
    }
  }, []);

  useEffect(() => {

    const fetchFiles = async() => {
      console.log("Fetching files...");
      try {
        const notesDir = getNotesDirectory();
        const dir = await readDir(notesDir, { baseDir: BaseDirectory.Config });
        const treeItems = await convertTauriToTreeViewItemsRecursive(dir, notesDir, BaseDirectory.Config);
        console.log("Tree Items:", treeItems);
        setTreeItems(treeItems);
      } catch(error) {
        console.log("Error reading directory:", error);
      }
    }

    fetchFiles();
  }, [])

  const handleDirectorySelected = useCallback(async (directoryPath: string) => {
    console.log("Loading directory:", directoryPath);
    setCurrentDirectory(directoryPath);
    
    try {
      // Read the selected directory contents
      const dir = await readDir(directoryPath);
      const newTreeItems = await convertTauriToTreeViewItemsRecursive(dir, directoryPath);
      console.log("New tree items for directory", directoryPath, ":", newTreeItems);
      setTreeItems(newTreeItems);
      
      // Save the last opened directory to config
      if (config) {
        const updatedConfig = { ...config, lastOpenedDirectory: directoryPath };
        setConfig(updatedConfig);
        await saveConfig(updatedConfig);
      }
    } catch (error) {
      console.error("Error reading selected directory:", error);
      // Optionally show an error message to the user
    }
  }, [config]);

  const handleSequence = useCallback((seq: string[]) => {
    const seqStr = seq.join("");

    switch (seqStr) {
      case "wh":
        if(open && treeRef.current && treeItems.length > 0) {
          console.log("Switch focus to the left pane");
          treeRef.current.focusItem({} as any, treeItems[0].id);
        }
        resetLeader();
        break
      case "wl":
        if(editorView) {
          console.log("Switch focus to the editor");
          editorView.focus();
        }
        resetLeader();
        break
      case "pd":
        console.log("Print document");
        console.log("Document content:", value);
        resetLeader();
        break
      case "op":
        setOpen(!open);
        resetLeader();
        break
      case "tc":
        setShowColorDisplay(!showColorDisplay);
        resetLeader();
        break
    }

  }, [open, treeRef, treeItems, resetLeader, editorView, value, showColorDisplay]);



  const startTimeoutRef = useRef(startTimeout);
  const handleSequenceRef = useRef(handleSequence);

  useEffect(() => {
    startTimeoutRef.current = startTimeout;
    handleSequenceRef.current = handleSequence;
  })

  const handler = useCallback((e: KeyboardEvent) => {
    const editorElement = editorViewRef.current?.dom;
    const isEditorFocused = editorElement?.contains(document.activeElement);

    if (editorModeRef.current === "normal" || isEditorFocused === false) {
      if (!leaderActiveRef.current && e.code === "Space") {
        console.log("Editor focused:", isEditorFocused);
        console.log("Editor mode:", editorModeRef.current);
        console.log("Leader key pressed.");
        e.preventDefault();
        e.stopImmediatePropagation();
        setLeaderActive(true);
        setSequence([]);
        startTimeoutRef.current();
        return;
      }

      if (leaderActiveRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (e.code === "Escape") {
          setLeaderActive(false);
          setSequence([]);
          return
        }

        const newSequence = [...sequenceRef.current, e.key];
        setSequence(newSequence);

        startTimeoutRef.current();
        const seqStr = newSequence.join("");
        console.log("Current sequence:", seqStr);
        handleSequenceRef.current(newSequence);
      }
    } else {
      if (e.code === "j") {
        // Focus next item in the tree view
      } if (e.code === "k") {
        // Focus previous item in the tree view

      }
      //console.log("Editor mode: ", editorModeRef.current, " - Ignoring ke);
    }
  }, []);

  useEffect(() => {
    Vim.defineEx('write', 'w', () => {
      console.log("Vim write command triggered");
      console.log("Current file contents:", valueRef.current);
      console.log("Current file:", currentFileRef.current);
      // Implement file saving logic here
      writeTextFile(currentFileRef.current || "untitled.txt", valueRef.current || "", { baseDir: BaseDirectory.Config }).catch(err => {
        console.error("Error writing file:", err);
      });
    });
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', handler, { capture: true });
    return () => {
      console.log("Removing keydown listener");
      document.removeEventListener('keydown', handler, { capture: true });
    }
  }, [handler])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Toolbar onDirectorySelected={handleDirectorySelected} />
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <div
            style={{
              width: sidebarWidth,
              //marginLeft: open ? 0 : `-${drawerWidth}px`,
              backgroundColor: theme.palette.background.paper,
              height: '100%',
              border: 'none',
            }}
          >
            <IconButton 
              onClick={() => setOpen(!open)} 
              sx = {{ 
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                borderRadius: '0%',
                boxShadow: 0,
              }}
            >
              <MenuIcon />
            </IconButton>
          </div>
          <Collapse 
            in={open} 
            orientation="horizontal"
            sx={{
            }}
          >
            <Box
              sx={{
                minWidth: drawerWidth,
                flexShrink: 0,
                bgcolor: theme.palette.background.paper,
                height: '100%',
                borderRight: `1px solid ${theme.palette.divider}`,
                overflow: 'auto',
              }}
            >
              <FileTree 
                viewRef={treeViewRef}
                theme={theme}
                onFileSelect={handleFileSelect}
                treeRef={treeRef}
                treeItems={treeItems}
                currentDirectory={currentDirectory || getNotesDirectory()}
                onFileCreated={handleFileCreated}
              />
            </Box>
          </Collapse>

        <Box
          component="main"
          sx={{
              flexGrow: 1,
              minWidth: 0,
              transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              //marginLeft: open ? 0 : `${sidebarWidth}px`,
              marginLeft: 0,
              ".cm-editor": {
                backgroundColor: theme.palette.background.paper,
              }
            }}
          >
            {showColorDisplay ? (
              <ThemeColorDisplay flavor={flavor} />
            ) : (
                <Editor 
                  editorRef={editorRef}
                  flavor={flavor}
                  view={editorView}
                  setView={setEditorView}
                  mode={editorMode}
                  setMode={setEditorMode}
                  value={value}
                  setValue={setValue}
                />
              )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
