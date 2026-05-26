import React, { useEffect, useRef, useCallback, useState } from 'react'
import styles from './App.module.css'
import { useChatStream } from './hooks/useChatStream'
import ChatSidebar from './components/ChatSidebar'
import TopBar from './components/TopBar'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import WelcomeScreen from './components/WelcomeScreen'

export default function App() {
  const {
    messages,
    isStreaming,
    error,
    sessionId,
    sendMessage,
    stopStreaming,
    clearHistory,
    sessions,
    currentSession,
    switchSession,
    deleteSession,  
  } = useChatStream()

  const messagesEndRef = useRef(null)
  const scrollRef = useRef(null)
  const userScrolled = useRef(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dismissedError, setDismissedError] = useState(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    userScrolled.current = (el.scrollHeight - el.scrollTop - el.clientHeight) > 80
  }, [])

  useEffect(() => {
    if (!userScrolled.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (isStreaming) userScrolled.current = false
  }, [isStreaming])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isStreaming) stopStreaming() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isStreaming, stopStreaming])

  const handleSend = useCallback((text) => {
    userScrolled.current = false
    sendMessage(text)
  }, [sendMessage])

  const showError = error && error !== dismissedError

  return (
    <div className={styles.app}>
      <ChatSidebar
        open={sidebarOpen}
        sessions={sessions}
        currentSession={currentSession}
        onNew={clearHistory}
        onSwitch={switchSession}
        onToggle={() => setSidebarOpen(o => !o)}
        onDelete={deleteSession}
        isStreaming={isStreaming}
      />

      <div className={`${styles.main} ${!sidebarOpen ? styles.mainFull : ''}`}>
        <TopBar
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          sidebarOpen={sidebarOpen}
        />

        {showError && (
          <div className={styles.errorBar}>
            <span className={styles.errorIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </span>
            <span className={styles.errorText}>{error}</span>
            <button className={styles.errorDismiss} onClick={() => setDismissedError(error)}>×</button>
          </div>
        )}

        <div className={styles.messages} ref={scrollRef} onScroll={handleScroll}>
          {messages.length === 0 ? (
            <WelcomeScreen onSelect={handleSend} />
          ) : (
            <MessageList messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputWrap}>
          <ChatInput
            onSend={handleSend}
            onStop={stopStreaming}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  )
}
