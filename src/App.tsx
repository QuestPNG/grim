import { useEffect, useState } from "react";
import { getCatppuccinTheme } from "./ui/theme/theme";
import { Box, CssBaseline, Drawer, ThemeProvider } from "@mui/material";
import { Editor } from "./ui/Editor";
import { EditorView } from "@uiw/react-codemirror";
import Button from "@mui/material/Button";
import { FileTree } from "./ui/components/FileTree";

function App() {
  const [editorView, setEditorView] = useState<EditorView | null>(null)
  const [editorMode, setEditorMode] = useState<string>("normal");
  const [flavor] = useState("frappe");
  const [open, setOpen] = useState(false);

  const [leaderActive, setLeaderActive] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);

  const theme = getCatppuccinTheme(flavor);

  const drawerWidth = 240;

  const handleFileSelect = (fileId: string, fileName: string) => {
    console.log("Selected file:", fileName, "with ID:", fileId);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editorMode === "normal") {
        if (editorView !== null) {
          if (!leaderActive) {
            if (e.code === "Space") {
              console.log("Leader key pressed");
              e.preventDefault();
              setLeaderActive(true);
              setSequence([]);
              return;
            }
          }
        }
      }
    }
    
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [leaderActive, sequence, editorView, editorMode]);

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
          <FileTree theme={theme} onFileSelect={handleFileSelect} />
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
          <Editor flavor={flavor} view={editorView} setView={setEditorView} mode={editorMode} setMode={setEditorMode}/>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
