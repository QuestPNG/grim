import { EditorState, RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, GutterMarker, gutterLineClass, WidgetType, gutter } from "@codemirror/view";
import katex from "katex";

class BlockMathWidget extends WidgetType {
  constructor(readonly content: string) {
    super()
  }
  toDOM() {
    const div = document.createElement("div")
    div.className = "cm-block-math"
    try {
      katex.render(this.content, div, {
        throwOnError: false,
        displayMode: true,
      })
    } catch (e) {
      div.textContent = this.content
    }

    return div
  }
}

class EmptyMarker extends GutterMarker {
  toDOM() {
    return document.createTextNode("")
  }
}

const emptyMarker = new EmptyMarker()

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

    if (inSelection) continue

    const startLine = state.doc.lineAt(start)
    const endLine = state.doc.lineAt(end)

    const deco = Decoration.widget({
      block: true,
      side: -1,
      widget: new (class extends WidgetType {
        toDOM() {
          const div = document.createElement("div")

          try {
            katex.render(content, div, {
              throwOnError: false,
              displayMode: true,
            })
          } catch (e) {
            div.textContent = content
          }

          return div
        }
      })(),
    })

    builder.add(start, start, deco)
    //builder.add(start, end, Decoration.replace({ side: 1 }))

    const hiddenLine = Decoration.mark({
      attributes: {
        style: `
color: transparent;       /* hide text */
text-shadow: none;        /* prevent ghosting */
user-select: none;        /* prevent selection */
`
      }
    })

    for (let lineNo = startLine.number; lineNo <= endLine.number; lineNo++) {
      const line = state.doc.line(lineNo)
      builder.add(line.from, line.to, hiddenLine)
    }
    //builder.add(closeStart,end, Decoration.replace({}))
  }


  return builder.finish()
}
