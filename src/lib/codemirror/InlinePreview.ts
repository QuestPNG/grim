import { Decoration, ViewPlugin, DecorationSet, EditorView, WidgetType} from "@codemirror/view"
import { RangeSetBuilder } from "@codemirror/state"
import katex from "katex"

function inlineMarkdownPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view)
      }

      update(update: any) {
        if (update.docChanged || update.selectionSet || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view)
        }
      }

      buildDecorations(view: EditorView) {
        const builder = new RangeSetBuilder<Decoration>()
        const doc = view.state.doc
        const decorations: { from: number; to: number; deco: Decoration }[] = []

        for (let { from, to } of view.visibleRanges) {
          const text = doc.sliceString(from, to)

          // --- Bold / Italic / Bold+Italic ---
          const regex = /(\*{1,3})(?!\s)([^\n*]+?)(?<!\s)\1/g
          let match
          while ((match = regex.exec(text)) !== null) {
            const stars = match[1].length
            const content = match[2]

            // Hide preview if cursor on text
            const markerStart = from + match.index
            const contentStart = markerStart + stars
            const contentEnd = contentStart + content.length
            const markerEnd = contentEnd + stars

            let inSelection = false
            for (let range of view.state.selection.ranges) {
              if (range.from <= markerEnd && range.to >= markerStart) {
                inSelection = true
                break
              }
            }
            if (inSelection) continue

            const deco = Decoration.replace({
              widget: new (class extends WidgetType {
                toDOM() {
                  if (stars === 1) {
                    const em = document.createElement("em")
                    em.textContent = content
                    return em
                  }
                  if (stars === 2) {
                    const strong = document.createElement("strong")
                    strong.textContent = content
                    return strong
                  }
                  const span = document.createElement("span")
                  span.style.fontWeight = "bold"
                  span.style.fontStyle = "italic"
                  span.textContent = content
                  return span
                }
              })(),
            })

            //builder.add(from + match.index, from + match.index + match[0].length, deco)
            decorations.push({
              from: from + match.index,
              to: from + match.index + match[0].length,
              deco 
            })
          }

          // --- Headers ---
          const headerRegex = /^(#{1,6}) (.*)$/gm
          let headerMatch
          while ((headerMatch = headerRegex.exec(text)) !== null) {
            const level = headerMatch[1].length
            const content = headerMatch[2]
            const start = from + headerMatch.index
            const end = start + headerMatch[0].length

            // Check if cursor is inside this header line
            let inSelection = false
            for (let range of view.state.selection.ranges) {
              if (range.from <= end && range.to >= start) {
                inSelection = true
                break
              }
            }

            if (inSelection) continue

            const deco = Decoration.replace({
              widget: new (class extends WidgetType {
                toDOM() {
                  const h = document.createElement(`h${level}`)
                  h.textContent = content
                  h.style.textAlign = "left" // keep consistent
                  h.className = `cm-header cm-header-${level}`
                  return h
                }
              })(),
            })

            decorations.push({ from: start, to: end, deco })
            //builder.add(start, end, deco)
          }

          const listRegex = /^([*-]) (.*)$/gm
          let listMatch
          while ((listMatch = listRegex.exec(text)) !== null) {
            const content = listMatch[2]
            const start = from + listMatch.index
            const end = start + listMatch[0].length

            // Skip if cursor is on this line
            let inSelection = false
            for (let range of view.state.selection.ranges) {
              if (range.from <= end && range.to >= start) {
                inSelection = true
                break
              }
            }
            if (inSelection) continue
            const deco = Decoration.replace({
              widget: new (class extends WidgetType {
                toDOM() {
                  const span = document.createElement("span")
                  span.style.display = "inline-flex"
                  span.style.alignItems = "center"

                  const bullet = document.createElement("span")
                  bullet.textContent = "•"
                  bullet.style.marginRight = "0.5em"

                  const text = document.createElement("span")
                  text.textContent = content

                  span.appendChild(bullet)
                  span.appendChild(text)
                  return span 
                }
              })(),
            })

            decorations.push({ from: start, to: end, deco })

          }


          // --- Ordered Lists ---
          const orderedListRegex = /^(\d+)\.\s+(.*)$/gm
          let orderedMatch
          while ((orderedMatch = orderedListRegex.exec(text)) !== null) {
            const number = orderedMatch[1]
            const content = orderedMatch[2]
            const start = from + orderedMatch.index
            const end = start + orderedMatch[0].length

            // Skip if cursor is on this line
            /*
            let inSelection = false
            for (let range of view.state.selection.ranges) {
              if (range.from <= end && range.to >= start) {
                inSelection = true
                break
              }
            }
            if (inSelection) continue
          */

            const deco = Decoration.replace({
              widget: new (class extends WidgetType {
                toDOM() {
                  const span = document.createElement("span")
                  span.style.display = "inline-flex"
                  span.style.alignItems = "center"

                  const numberSpan = document.createElement("span")
                  numberSpan.textContent = `\t${number}.`
                  numberSpan.style.marginRight = "0.5em"
                  //numberSpan.style.color = "#888" // optional, like Markdown previewers
                  //numberSpan.style.background = "#f00"

                  const textSpan = document.createElement("span")
                  textSpan.textContent = content

                  span.appendChild(numberSpan)
                  span.appendChild(textSpan)
                  return span
                }
              })(),
            })

            decorations.push({ from: start, to: end, deco })
          }


          // KaTeX
          // Inline
          const mathRegex = /\$([^\n]+?)\$/g
          let mathMatch
          while ((mathMatch = mathRegex.exec(text)) !== null) {
            const content = mathMatch[1]
            const start = from + mathMatch.index
            const end = start + mathMatch[0].length

            let inSelection = false
            for (let range of view.state.selection.ranges) {
              if (range.from <= end && range.to >= start) {
                inSelection = true
                break
              }
            }

            if (inSelection) continue

            const deco = Decoration.replace({
              widget: new (class extends WidgetType {
                toDOM() {
                  const span = document.createElement("span")
                  try {
                    katex.render(content, span, {
                      throwOnError: false,
                      displayMode: false,
                      strict:false,
                    })
                  } catch (e) {
                    span.textContent = content
                  }
                  return span
                }
              })(),
            })

            decorations.push({ from: start, to: end, deco })
          }

        }


        decorations.sort((a, b) => a.from - b.from || a.to - b.to)

        for (const { from, to, deco } of decorations) {
          builder.add(from, to, deco)
        }

        return builder.finish()
      }
    },
    {
      decorations: v => v.decorations,
    }
  )
}

export const inlinePreview = () => [inlineMarkdownPlugin()];
