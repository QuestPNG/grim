import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Button from "@mui/material/Button";
import { getCatppuccinTheme } from "./ui/theme/theme";
import { Box, CssBaseline, Drawer, Input, ThemeProvider } from "@mui/material";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  const [flavor, setFlavor] = useState("frappe");
  const [open, setOpen] = useState(false);

  const theme = getCatppuccinTheme(flavor);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main className="container">
        <h1>Welcome to Tauri + React</h1>

        <div className="row">
          <a href="https://vite.dev" target="_blank">
            <img src="/vite.svg" className="logo vite" alt="Vite logo" />
          </a>
          <a href="https://tauri.app" target="_blank">
            <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <p>Click on the Tauri, Vite, and React logos to learn more.</p>

        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <Input 
            id="greet-input-mui"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <Button variant="contained" type="submit">Greet</Button>
        </form>
        <p>{greetMsg}</p>
        <Button onClick={() => setOpen(!open)}>Open</Button>
        <Drawer variant="persistent" open={open} onClose={() => setOpen(false)}>
          <h1>File Tree</h1>
        </Drawer>
      </main>
    </ThemeProvider>
  );
}

export default App;
