import { catppuccinFrappe, catppuccinLatte, catppuccinMacchiato, catppuccinMocha } from "@catppuccin/codemirror";
import CodeMirror, { EditorView, ViewUpdate, EditorState } from "@uiw/react-codemirror";
import { useCallback, useState } from "react";
import { getCatppuccinTheme } from "../theme/theme";
import { flavors } from "@catppuccin/palette";
import { Box } from "@mui/material";
import { getCM, vim } from "@replit/codemirror-vim";
import { inlinePreview } from "../../lib/codemirror/InlinePreview";
import { blockMathField } from "../../lib/codemirror/BlockMath";

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

export function Editor(props: EditorProps) {

  const [colors, setColors] = useState(getCatppuccinTheme("frappe"));
  const [theme, setTheme] = useState(catppuccinFrappe);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  //const [value, setValue] = useState<string>(`console.log('hello world!')
//$\\frac{2}{3}\\ket{0} + \\frac{1-2i}{3}\\ket{1}$`)

  const onChange = useCallback((val: string, _: ViewUpdate) => {
    if (props.view !== null) {
      let childeMode = props.mode
      console.log("Child mode:", childeMode);
    }
    props.setValue(val)
    props.view?.requestMeasure()
  }, [props.view, props.mode]);

  const handleCreateEditor = useCallback((view: EditorView, state: EditorState) => {

    let cm = getCM(view);
    cm?.on("vim-mode-change", (modeObj: any) => {
      props.setMode(modeObj.mode);
      console.log("Vim mode changed to:", modeObj.mode);
    });

    setColors(getCatppuccinTheme(props.flavor))
    switch (props.flavor) {
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
    props.setView(view);
    setEditorState(state);
  }, [props.setMode, props.flavor, props.setView, setTheme, setColors, getCatppuccinTheme,
    catppuccinFrappe, catppuccinLatte, catppuccinMacchiato, catppuccinMocha]);
  return (
    <Box>
    <CodeMirror
        ref={props.editorRef}
        onCreateEditor={handleCreateEditor}
        value={props.value}
        onChange={onChange}
        extensions={[
          theme,
          vim(),
          inlinePreview(),
          blockMathField,
          
        ]}
    />
    </Box>

  );
}
