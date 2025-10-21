import { EditorState, RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import katex from "katex";

export const blockMathField = StateField.define<DecorationSet>({
  create(state) {
    return buildBlockMathDecos(state)
  },
  update(decos, tr) {
    if (tr.docChanged || tr.selection) {
      return buildBlockMathDecos(tr.state)
    }
    return decos.map(tr.changes)
  },
  provide: f => EditorView.decorations.from(f),
})


function buildBlockMathDecos(state: EditorState): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const text = state.doc.toString()

  const blockMathRegex = /\$\$([^]+?)\$\$/g
  let match
  while ((match = blockMathRegex.exec(text)) !== null) {
    const content = match[1].trim()
    const start = match.index
    const end = start + match[0].length

    let inSelection = false
    for (let range of state.selection.ranges) {
      if (range.from <= end && range.to >= start) {
        inSelection = true
        break
      }

      const line = state.doc.lineAt(range.from)
      if (line.from <= start && line.to >= end) {
        inSelection = true
        break
      }
    }

    if (inSelection) {
      // When in selection, add the math content after the plain text without replacing it
      const deco = Decoration.widget({
        widget: new (class extends WidgetType {
          toDOM() {
            const div = document.createElement("div")
            
            try {
              katex.render(content, div, {
                throwOnError: false,
                displayMode: true,
                strict:false,
              })
            } catch (e) {
              div.textContent = content
            }

            return div
          }
        })(),
        side: 1, // Add after the content
      })

      builder.add(end, end, deco)
    } else {
      // Use Decoration.replace to completely replace the $$...$$ text with the widget
      const deco = Decoration.replace({
        widget: new (class extends WidgetType {
          toDOM() {
            const div = document.createElement("div")
            div.style.display = "block"
            div.style.textAlign = "center"
            div.style.margin = "1em 0"
            
            try {
              katex.render(content, div, {
                throwOnError: false,
                displayMode: true,
                strict:false,
              })
            } catch (e) {
              div.textContent = content
            }

            return div
          }
        })(),
      })

      builder.add(start, end, deco)
    }
  }

  return builder.finish()
}
