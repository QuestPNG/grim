import { catppuccinFrappe, catppuccinLatte, catppuccinMacchiato, catppuccinMocha } from "@catppuccin/codemirror";
import CodeMirror, { EditorView, ViewUpdate, EditorState, Prec } from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { getCM, vim } from "@replit/codemirror-vim";
import { inlinePreview } from "../lib/codemirror/InlinePreview";
import { blockMathField } from "../lib/codemirror/BlockMath";

interface EditorProps {
  editorRef: React.RefObject<any>
  view: EditorView | null
  setView: (newView: EditorView | null) => void
  value: string
  setValue: (newValue: string) => void
  flavor: string
  mode: string
  setMode: (newMode: string) => void
};

// TODO: Memoize onChange callback
export function Editor(props: EditorProps) {

  const [theme, setTheme] = useState(catppuccinFrappe);
  //const [value, setValue] = useState<string>(`console.log('hello world!')
//$\\frac{2}{3}\\ket{0} + \\frac{1-2i}{3}\\ket{1}$`)

  const viewRef = useRef(props.view)
  const modeRef = useRef(props.mode)
  const setModeRef = useRef(props.setMode)
  const setViewRef = useRef(props.setView)
  const flavorRef = useRef(props.flavor)

  useEffect(() => {
    viewRef.current = props.view
    modeRef.current = props.mode
    setModeRef.current = props.setMode
    setViewRef.current = props.setView
    flavorRef.current = props.flavor
  }, [props.view, props.mode, props.setMode, props.setView, props.flavor]);

  const onChange = useCallback((val: string, _: ViewUpdate) => {
    /*if (props.view !== null) {
      let childeMode = props.mode
      console.log("Child mode:", childeMode);
    }*/
    props.setValue(val)
    //props.view?.requestMeasure()
    viewRef.current?.requestMeasure()
  }, [props.setValue]);

  const handleCreateEditor = useCallback((view: EditorView, _: EditorState) => {

    let cm = getCM(view);
    cm?.on("vim-mode-change", (modeObj: any) => {
      setModeRef.current(modeObj.mode);
      console.log("Vim mode changed to:", modeObj.mode);
    });

    switch (flavorRef.current) {
      case "frappe":
        setTheme(catppuccinFrappe);
        break;
      case "macchiato":
        setTheme(catppuccinMacchiato);
        break;
      case "mocha":
        setTheme(catppuccinMocha);
        break;
      case "latte":
        setTheme(catppuccinLatte);
        break;
    }
    setViewRef.current(view);
  }, []);
  // NOTE: likely need more permanent fix to prevent codemirror keymaps from clashing with vim plugin keymaps
  return (
    <Box>
    <CodeMirror
        ref={props.editorRef}
        onCreateEditor={handleCreateEditor}
        value={props.value}
        onChange={onChange}
        extensions={[
          theme,
          Prec.high(vim()),
          inlinePreview(),
          blockMathField,
        ]}
    />
    </Box>

  );
}
