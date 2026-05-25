/**
 * Lightweight renderer — converts a subset of markdown to React elements.
 * Handles: **bold**, `code`, ```blocks```, - lists, numbered lists,
 * and preserves line breaks. No external deps.
 */

export function parseContent(text) {
  if (!text) return []
  return text
    .split('\n')
    .reduce((acc, line) => {
      // Detect fenced code block boundaries
      if (line.startsWith('```')) {
        if (acc.inCode) {
          acc.blocks.push({ type: 'codeblock', lang: acc.codeLang, content: acc.codeLines.join('\n') })
          acc.inCode = false
          acc.codeLines = []
          acc.codeLang = ''
        } else {
          acc.inCode = true
          acc.codeLang = line.slice(3).trim()
          acc.codeLines = []
        }
        return acc
      }
      if (acc.inCode) {
        acc.codeLines.push(line)
        return acc
      }

      if (!line.trim()) {
        acc.blocks.push({ type: 'spacer' })
      } else if (/^#{1,3}\s/.test(line)) {
        const level = line.match(/^(#{1,3})/)[1].length
        acc.blocks.push({ type: 'heading', level, content: line.replace(/^#{1,3}\s/, '') })
      } else if (/^[-*]\s/.test(line)) {
        acc.blocks.push({ type: 'listitem', content: line.replace(/^[-*]\s/, '') })
      } else if (/^\d+\.\s/.test(line)) {
        acc.blocks.push({ type: 'ordereditem', content: line.replace(/^\d+\.\s/, '') })
      } else {
        acc.blocks.push({ type: 'paragraph', content: line })
      }
      return acc
    }, { blocks: [], inCode: false, codeLines: [], codeLang: '' })
    .blocks
}

/**
 * Inline span renderer — handles **bold**, *italic*, `code`
 */
export function renderInline(text) {
  // Split on bold, italic, inline code markers
  const parts = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let last = 0
  let m

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) })
    const raw = m[0]
    if (raw.startsWith('**')) {
      parts.push({ type: 'bold', content: raw.slice(2, -2) })
    } else if (raw.startsWith('*')) {
      parts.push({ type: 'italic', content: raw.slice(1, -1) })
    } else if (raw.startsWith('`')) {
      parts.push({ type: 'code', content: raw.slice(1, -1) })
    }
    last = m.index + raw.length
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) })
  return parts
}
