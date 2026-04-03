'use client'

import { useState, useEffect } from 'react'
import { GroupedSession } from '@/lib/history-parser'
import { TerminalCard } from './TerminalCard'
import { getFavoriteTerminals, addFavoriteTerminal, removeFavoriteTerminal } from '@/lib/history-storage'

interface HistoryTerminalsListProps {
  terminals: GroupedSession[]
}

export function HistorySessionsList({ terminals }: HistoryTerminalsListProps) {
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Load favorites from localStorage
  useEffect(() => {
    const favTerminals = getFavoriteTerminals()
    setFavorites(new Set(favTerminals))
  }, [])

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const filtered = terminals.filter((terminal) => {
    // Time filter: check if any event in terminal is within time range
    const hasRecentEvent = terminal.events.some((e) => {
      const age = now - e.timestamp
      return (
        timeFilter === 'all' ||
        (timeFilter === '24h' && age < day) ||
        (timeFilter === '7d' && age < 7 * day) ||
        (timeFilter === '30d' && age < 30 * day)
      )
    })

    // Search filter: search across all messages in terminal
    const matchSearch =
      search === '' ||
      terminal.events.some((e) => e.display.toLowerCase().includes(search.toLowerCase()))

    return hasRecentEvent && matchSearch
  })

  const toggleFavorite = (terminalId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(terminalId)) {
      newFavorites.delete(terminalId)
      removeFavoriteTerminal(terminalId)
    } else {
      newFavorites.add(terminalId)
      addFavoriteTerminal(terminalId)
    }
    setFavorites(newFavorites)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 bg-gama-surface border-b border-gama-surface-accent space-y-2">
        <input
          type="text"
          placeholder="🔍 Buscar terminals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-sm bg-gama-surface-accent text-gama-text rounded border border-white/10 hover:border-gama-primary/50 focus:border-gama-primary focus:outline-none transition-colors"
        />
        <div className="flex gap-1 flex-wrap">
          {(['24h', '7d', '30d', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                timeFilter === t
                  ? 'bg-gama-primary text-gama-dark'
                  : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/20'
              }`}
            >
              {t === '24h' && '24h'}
              {t === '7d' && '7d'}
              {t === '30d' && '30d'}
              {t === 'all' && 'Tudo'}
            </button>
          ))}
        </div>
      </div>

      {/* Terminals List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gama-text-secondary text-sm text-center">
            <div>
              <div className="text-3xl mb-2">📱</div>
              <p>Nenhum terminal encontrado</p>
            </div>
          </div>
        ) : (
          filtered.map((terminal, idx) => (
            <TerminalCard
              key={`${terminal.firstTime}-${idx}`}
              terminal={terminal}
              terminalId={`${terminal.firstTime}-${idx}`}
              isFavorite={favorites.has(`${terminal.firstTime}-${idx}`)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Keep old HistorySessionsList export for backward compat
export { HistorySessionsList as HistoryTerminalsList }
