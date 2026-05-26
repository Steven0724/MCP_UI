import React from 'react'
import styles from './ChatSidebar.module.css'

function timeLabel(ts) {
  const diff = Date.now() - ts
  if (diff < 60000)    return 'Just now'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ChatSidebar({
  open,
  sessions,
  currentSession,
  onNew,
  onSwitch,
  onToggle,
  onDelete,      
  isStreaming,
}) {
  return (
    <aside className={`${styles.sidebar} ${!open ? styles.closed : ''}`}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span className={styles.logoText}>MCP Chat</span>
        </div>
        <button className={styles.collapseBtn} onClick={onToggle} title="Close sidebar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
      </div>

      {/* New chat */}
      <div className={styles.newChatWrap}>
        <button className={styles.newChatBtn} onClick={onNew} disabled={isStreaming}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
          New chat
        </button>
      </div>

      {/* History */}
      <div className={styles.historyScroll}>
        {sessions.length === 0 ? (
          <div className={styles.empty}>No conversations yet</div>
        ) : (
          <>
            <div className={styles.groupLabel}>Recent</div>
            {sessions.map(s => (
              <div
                key={s.id}
                className={`${styles.sessionRow} ${s.id === currentSession ? styles.sessionActive : ''}`}
              >
                {/* Clickable title area */}
                <button
                  className={styles.sessionBtn}
                  onClick={() => onSwitch(s)}
                  title={s.title}
                >
                  <div className={styles.sessionTitle}>{s.title}</div>
                  <div className={styles.sessionMeta}>{timeLabel(s.updatedAt)}</div>
                </button>

                {/* delete button */}
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation()  
                    onDelete(s.id)
                  }}
                  title="Delete conversation"
                  aria-label={`Delete "${s.title}"`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6"  y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerItem}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
          </svg>
          <span>POC MCP</span>
        </div>
      </div>

    </aside>
  )
}
