import React from 'react'
import styles from './WelcomeScreen.module.css'

const SUGGESTIONS = [
  { icon: '📦', label: 'List the top 5 highest-rated products' },
  { icon: '👥', label: 'Search for customers named Emily' },
  { icon: '📋', label: 'Get full details for order ID 1' },
  { icon: '💬', label: 'What are the trending posts right now?' },
  { icon: '🔍', label: 'Show me smartphones sorted by price' },
  { icon: '📊', label: "Show customer Emily's order history" },
]

export default function WelcomeScreen({ onSelect }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Hi, how can I help you today?</h1>
        <p className={styles.sub}>
          Connected to tools across products, customers, orders &amp; community
        </p>

        <div className={styles.grid}>
          {SUGGESTIONS.map(s => (
            <button key={s.label} className={styles.card} onClick={() => onSelect(s.label)}>
              <span className={styles.cardIcon}>{s.icon}</span>
              <span className={styles.cardText}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
