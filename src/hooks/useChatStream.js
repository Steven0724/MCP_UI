import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

const API_ENDPOINT = '/api/chat'

function ts() { return Date.now() }
function shortTitle(text) {
  return text.length > 36 ? text.slice(0, 36) + '…' : text
}

export function useChatStream() {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)

  const sessionIdRef = useRef(uuidv4())
  const abortRef = useRef(null)

  const clearHistory = useCallback(() => {
    const newId = uuidv4()
    sessionIdRef.current = newId
    setMessages([])
    setError(null)
    setCurrentSession(null)
  }, [])

  const switchSession = useCallback((session) => {
    setCurrentSession(session.id)
    setMessages(session.messages)
    sessionIdRef.current = session.id
  }, [])

  const sendMessage = useCallback(async (text) => {
    if (isStreaming || !text.trim()) return
    setError(null)

    const userMsg = { id: uuidv4(), role: 'user', content: text.trim(), ts: ts() }
    const assistantId = uuidv4()
    const assistantMsg = { id: assistantId, role: 'assistant', content: '', ts: ts(), streaming: true }

    const newMessages = (prev) => [...prev, userMsg, assistantMsg]

    setMessages(prev => {
      const next = [...prev, userMsg, assistantMsg]

      // Update or create session in sidebar
      setSessions(sessions => {
        const sid = sessionIdRef.current
        const existing = sessions.findIndex(s => s.id === sid)
        const title = sessions.find(s => s.id === sid)?.title || shortTitle(text)
        if (existing >= 0) {
          const updated = [...sessions]
          updated[existing] = { ...updated[existing], messages: next, preview: text, updatedAt: ts() }
          return updated
        }
        return [{ id: sid, title, messages: next, preview: text, createdAt: ts(), updatedAt: ts() }, ...sessions]
      })
      setCurrentSession(sessionIdRef.current)
      return next
    })

    setIsStreaming(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ sessionId: sessionIdRef.current, message: text.trim() }),
        signal: controller.signal,
      })

      if (!response.ok) {
        let detail = `HTTP ${response.status}`
        try { const b = await response.json(); detail = b.details || b.errorCode || detail } catch {}
        throw new Error(detail)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const updateMsg = (chunk) => {
        setMessages(prev => {
          const next = prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
          setSessions(sessions => sessions.map(s =>
            s.id === sessionIdRef.current ? { ...s, messages: next } : s
          ))
          return next
        })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (line.startsWith('data:')) updateMsg(line.slice(5))
        }
      }
      if (buffer.startsWith('data:') && buffer.slice(5)) updateMsg(buffer.slice(5))

      setMessages(prev => {
        const next = prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m)
        setSessions(sessions => sessions.map(s =>
          s.id === sessionIdRef.current ? { ...s, messages: next } : s
        ))
        return next
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, streaming: false, interrupted: true } : m
        ))
      } else {
        setError(err.message || 'Cannot reach the orchestrator on port 8081. Is the server running?')
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [isStreaming])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { messages, isStreaming, error, sessionId: sessionIdRef.current, sessions, currentSession, sendMessage, stopStreaming, clearHistory, switchSession }
}
