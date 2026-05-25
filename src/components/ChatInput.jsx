import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from './ChatInput.module.css'

export default function ChatInput({ onSend, onStop, isStreaming }) {
  const [text, setText] = useState('')
  const taRef = useRef(null)

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'
  }, [text])

  const submit = useCallback(() => {
    const t = text.trim()
    if (!t || isStreaming) return
    onSend(t)
    setText('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }, [text, isStreaming, onSend])

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }, [submit])

  const over = text.length > 2000

  return (
    <div className={styles.wrap}>
      <div className={`${styles.box} ${isStreaming ? styles.boxStreaming : ''}`}>
        <textarea
          ref={taRef}
          className={styles.ta}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message MCP Chat…"
          rows={1}
          disabled={isStreaming}
          maxLength={2200}
          aria-label="Message input"
        />

        <div className={styles.actions}>
          {isStreaming ? (
            <button className={styles.stopBtn} onClick={onStop} title="Stop (Esc)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
              </svg>
            </button>
          ) : (
            <button
              className={styles.sendBtn}
              onClick={submit}
              disabled={!text.trim() || over}
              title="Send (Enter)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className={styles.hint}>
        {over
          ? <span className={styles.over}>Message too long ({text.length}/2000)</span>
          : 'Enter to send · Shift+Enter for new line'
        }
      </p>
    </div>
  )
}
