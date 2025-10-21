import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { getCatppuccinTheme } from "./ui/theme/theme";
import { Box, CssBaseline, Drawer, ThemeProvider } from "@mui/material";
import { Editor } from "./components/Editor";
import { EditorView } from "@uiw/react-codemirror";
import Button from "@mui/material/Button";
import { convertTauriToTreeViewItemsRecursive, FileTree } from "./components/FileTree";
import { TreeViewBaseItem, useTreeViewApiRef } from "@mui/x-tree-view";
import { BaseDirectory, readDir, readFile } from "@tauri-apps/plugin-fs";

function App() {

  // TODO: Create state object to remember which component/item is currently focused
  // Allow FileTree and Editor to set focus state when clicked
  

  const [config, setConfig] = useState<any | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const raw = await readFile("grim/config.json", { baseDir: BaseDirectory.Config });
        const decoder = new TextDecoder("utf-8");
        const content = decoder.decode(raw);
        const obj = JSON.parse(content);
        setConfig(obj);
        console.log("Config loaded:", content);

        const defaultFile = obj.defaultFile;
        const rawFile = await readFile(defaultFile, { baseDir: BaseDirectory.Config });
        const fileContent = decoder.decode(rawFile);
        console.log("Default file content:", fileContent);
        setValue(fileContent);
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

  const [value, setValue] = useState<string>("");

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
  }, [leaderActive, sequence, editorView, editorMode]);

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

  const theme = getCatppuccinTheme(flavor);

  const drawerWidth = 240;


  const handleFileSelect =  async (fileId: string, fileName: string) => {
    console.log("Selected file:", fileName, "with ID:", fileId);
    const raw =  await readFile(fileId, { baseDir: BaseDirectory.Config })
    const decoder = new TextDecoder("utf-8");
    const content = decoder.decode(raw);
    setValue(content);
  };

  useEffect(() => {

    const fetchFiles = async() => {
      console.log("Fetching files...");
      try {
        const dir = await readDir("grim/notes", { baseDir: BaseDirectory.Config });
        const treeItems = await convertTauriToTreeViewItemsRecursive(dir, "grim/notes", BaseDirectory.Config);
        console.log("Tree Items:", treeItems);
        setTreeItems(treeItems);
      } catch(error) {
        console.log("Error reading directory:", error);
      }
    }

    fetchFiles();
  }, [])

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
    }

  }, [open, treeRef, treeItems, resetLeader, editorView, value]);



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
      //console.log("Editor mode: ", editorModeRef.current, " - Ignoring ke);
    }
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
      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <FileTree 
            viewRef={treeViewRef}
            theme={theme}
            onFileSelect={handleFileSelect}
            treeRef={treeRef}
            treeItems={treeItems}
          />
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: open ? 0 : `-${drawerWidth}px`,
            ".cm-editor": {
              backgroundColor: theme.palette.background.paper,
            }
          }}
        >
          <Button onClick={() => setOpen(!open)}>Open</Button>
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
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
