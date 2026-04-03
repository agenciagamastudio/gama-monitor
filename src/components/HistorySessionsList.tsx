'use client'

import { useState } from 'react'
import { HistorySession } from '@/types/history'

interface HistorySessionsListProps {
  sessions: HistorySession[]
  selectedSession: HistorySession | null
  onSelectSession: (session: HistorySession) => void
}

export function HistorySessionsList({ sessions, selectedSession, onSelectSession }: HistorySessionsListProps) {
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all')

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const filtered = sessions.filter((s) => {
    // Time filter
    const age = now - s.timestamp.getTime()
    const withinTime =
      timeFilter === 'all' ||
      (timeFilter === '24h' && age < day) ||
      (timeFilter === '7d' && age < 7 * day) ||
      (timeFilter === '30d' && age < 30 * day)

    // Search filter
    const matchSearch = search === '' || s.content.toLowerCase().includes(search.toLowerCase())

    return withinTime && matchSearch
  })

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 bg-gama-surface border-b border-gama-surface-accent space-y-2">
        <input
          type="text"
          placeholder="🔍 Buscar..."
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

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gama-text-secondary text-sm text-center p-4">
            <div>
              <div className="text-3xl mb-2">🔍</div>
              <p>Nenhuma conversa</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`w-full text-left p-3 hover:bg-gama-surface-accent transition-colors ${
                  selectedSession?.id === session.id ? 'bg-gama-primary/10 border-l-2 border-gama-primary' : ''
                }`}
              >
                <div className="text-xs text-gama-text-secondary mb-1">
                  {session.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-1 mb-1 text-xs">
                  {session.agent && <span className="px-1.5 py-0.5 bg-gama-primary/20 text-gama-primary rounded text-xs">{session.agent}</span>}
                  {session.project && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{session.project}</span>}
                </div>
                <p className="text-xs text-gama-text line-clamp-2">{session.preview}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
