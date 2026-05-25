import React, { useState, useEffect } from 'react'
import styles from './TopBar.module.css'

/**
 * Health check strategy:
 *
 * - Orchestrator (:8081)  → proxied via Vite as /health/orchestrator
 *   The orchestrator's actuator is CORS-open to the browser (allowedOrigins includes 5173).
 *   We call it through the Vite proxy to keep URLs clean.
 *
 * - MCP Server (:8080)    → proxied via Vite as /health/mcp
 *   The MCP server's actuator only whitelists :8081 (the orchestrator).
 *   Direct browser calls are blocked by CORS. We route through the Vite proxy so
 *   the request originates from the Node dev server, bypassing CORS entirely.
 *
 * - LLM → derived: if the orchestrator is UP it means Spring AI
 *   already connected to Databricks at startup, so we treat orchestrator UP = LLM UP.
 */
function useServiceHealth(proxyPath, interval = 12000) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const res = await fetch(proxyPath, {
          method: 'GET',
          signal: AbortSignal.timeout(4000),
        })
        if (!cancelled) {
          // Spring Boot actuator returns { status: "UP" } with HTTP 200
          if (res.ok) {
            const json = await res.json().catch(() => ({}))
            setStatus(json.status === 'UP' ? 'up' : 'down')
          } else {
            setStatus('down')
          }
        }
      } catch {
        if (!cancelled) setStatus('down')
      }
    }

    check()
    const id = setInterval(check, interval)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [proxyPath, interval])

  return status
}

function Indicator({ label, status }) {
  const statusText = status === 'checking' ? 'connecting…' : status === 'up' ? 'online' : 'offline'
  return (
    <div className={styles.indicator} title={`${label} — ${statusText}`}>
      <span className={`${styles.dot} ${styles[status]}`} />
      <span className={styles.indLabel}>{label}</span>
    </div>
  )
}

export default function TopBar({ onToggleSidebar, sidebarOpen }) {
  const mcpStatus  = useServiceHealth('/health/mcp')
  const orchStatus = useServiceHealth('/health/orchestrator')
  // LLM is considered up if the orchestrator is up (it connected at startup)
  const llmStatus  = orchStatus === 'up' ? 'up' : orchStatus === 'checking' ? 'checking' : 'down'

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {!sidebarOpen && (
          <button className={styles.menuBtn} onClick={onToggleSidebar} title="Open sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        )}
        {!sidebarOpen && <span className={styles.brandCollapsed}>MCP Chat</span>}
      </div>

      <div className={styles.center}>
        <Indicator label="MCP Server :8080"    status={mcpStatus} />
        <div className={styles.sep} />
        <Indicator label="Orchestrator :8081"  status={orchStatus} />
        <div className={styles.sep} />
        <Indicator label="LLM · Llama 3.3 70B" status={llmStatus} />
      </div>

      <div className={styles.right} />
    </header>
  )
}
