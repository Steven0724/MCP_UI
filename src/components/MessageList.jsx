import React, { useState } from 'react'
import styles from './MessageList.module.css'
import { parseContent, renderInline } from '../lib/textParser'

// Inline renderer
function Inline({ text }) {
  const parts = renderInline(text)
  return parts.map((p, i) => {
    if (p.type === 'bold')   return <strong key={i}>{p.content}</strong>
    if (p.type === 'italic') return <em key={i}>{p.content}</em>
    if (p.type === 'code')   return <code key={i} className={styles.inlineCode}>{p.content}</code>
    return <React.Fragment key={i}>{p.content}</React.Fragment>
  })
}

// Code block 
function CodeBlock({ lang, content }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeTop}>
        <span className={styles.codeLang}>{lang || 'code'}</span>
        <button className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.codePre}><code>{content}</code></pre>
    </div>
  )
}

// Assistant prose renderer
function Prose({ content, streaming }) {
  const blocks = parseContent(content)
  return (
    <div className={styles.prose}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'codeblock':
            return <CodeBlock key={i} lang={b.lang} content={b.content} />
          case 'listitem':
            return (
              <div key={i} className={styles.li}>
                <span className={styles.bullet}>•</span>
                <span><Inline text={b.content} /></span>
              </div>
            )
          case 'ordereditem':
            return (
              <div key={i} className={styles.li}>
                <span className={styles.ordNum}>{i + 1}.</span>
                <span><Inline text={b.content} /></span>
              </div>
            )
          case 'heading':
            return <p key={i} className={styles.heading}><Inline text={b.content} /></p>
          case 'spacer':
            return <div key={i} className={styles.spacer} />
          default:
            return <p key={i} className={styles.p}><Inline text={b.content} /></p>
        }
      })}
      {streaming && <span className={styles.cursor} />}
    </div>
  )
}

// Thinking dots
function Thinking() {
  return (
    <div className={styles.thinking}>
      <span /><span /><span />
    </div>
  )
}

// Single message
function Message({ msg }) {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <div className={styles.userRow}>
        <div className={styles.userBubble}>{msg.content}</div>
      </div>
    )
  }

  return (
    <div className={styles.assistantRow}>
      <div className={styles.assistantAvatar}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </div>
      <div className={styles.assistantContent}>
        {msg.content
          ? <Prose content={msg.content} streaming={msg.streaming} />
          : msg.streaming ? <Thinking /> : null
        }
        {msg.interrupted && <span className={styles.interrupted}>Response stopped</span>}
      </div>
    </div>
  )
}

// Message list
export default function MessageList({ messages }) {
  return (
    <div className={styles.list}>
      {messages.map(msg => (
        <Message key={msg.id} msg={msg} />
      ))}
    </div>
  )
}
