'use client'

import { useState, useEffect } from 'react'
import { HistorySessionsList } from './HistorySessionsList'
import { HistoryCalendar } from './HistoryCalendar'
import { HistoryExplorer } from './HistoryExplorer'
import { ChatDetailView } from './ChatDetailView'
import { HistoryApiResponse, HistorySession } from '@/types/history'
import { GroupedSession } from '@/lib/history-parser'

type TabType = 'list' | 'calendar' | 'explorer' | 'favorites'

export function HistoryTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [data, setData] = useState<HistoryApiResponse | null>(null)
  const [terminals, setTerminals] = useState<GroupedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/history')
        const json = (await response.json()) as any

        if (!response.ok) {
          throw new Error(json.error || 'Failed to load history')
        }

        // Convert date strings to Date objects
        const sessions = json.sessions.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }))

        const byDate: Record<string, typeof sessions> = {}
        for (const [key, val] of Object.entries(json.byDate)) {
          byDate[key] = (val as any[]).map((s) => ({
            ...s,
            timestamp: new Date(s.timestamp),
          }))
        }

        setData({
          ...json,
          sessions,
          byDate,
        } as HistoryApiResponse)
        setError(null)

        // Set grouped terminals from Story 1.1
        const terminalList: GroupedSession[] = json.bySessionArray || []
        setTerminals(terminalList)

        // Load favorites
        const fav = JSON.parse(localStorage.getItem('history-favorites-terminals') || '[]')
        setFavorites(new Set(fav))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <p className="text-gama-text-secondary">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-gama-primary mb-3">Erro ao carregar histórico</h2>
          <p className="text-gama-text-secondary mb-4">{error || 'Tente novamente mais tarde'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gama-primary text-gama-dark font-semibold rounded-lg hover:brightness-110 transition-all"
          >
            ↻ Recarregar
          </button>
        </div>
      </div>
    )
  }

  // Filter terminals for active tab (now showing terminals, not individual sessions)
  let filteredTerminals = terminals
  if (activeTab === 'favorites') {
    filteredTerminals = terminals.filter((t, idx) => favorites.has(`${t.firstTime}-${idx}`))
  }

  const tabs: Array<{ id: TabType; label: string; emoji: string }> = [
    { id: 'list', label: 'Terminais', emoji: '📱' },
    { id: 'calendar', label: 'Calendário', emoji: '📅' },
    { id: 'explorer', label: 'Explorador', emoji: '📁' },
    { id: 'favorites', label: 'Favoritos', emoji: '⭐' },
  ]

  return (
    <div className="flex gap-0 h-full">
      {/* Left Panel — Terminals List */}
      <div className="hidden lg:flex lg:flex-col lg:w-96 lg:flex-shrink-0 lg:border-r lg:border-white/10 bg-gama-dark">
        {/* Tabs Header */}
        <div className="bg-gama-surface border-b border-gama-surface-accent p-3 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSelectedSession(null)
              }}
              className={`px-3 py-1 text-sm rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gama-primary text-gama-dark'
                  : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/20'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="px-3 py-2 text-xs text-gama-text-secondary border-b border-gama-surface-accent flex gap-3">
          <span>📱 {filteredTerminals.length} terminal{filteredTerminals.length !== 1 ? 's' : ''}</span>
          <span>💬 {data.stats.total} mensagens</span>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {(activeTab === 'list' || activeTab === 'favorites') && (
            <HistorySessionsList terminals={filteredTerminals} />
          )}
          {activeTab === 'calendar' && (
            <HistoryCalendar byDate={data.byDate} onSelectSession={setSelectedSession} />
          )}
          {activeTab === 'explorer' && (
            <HistoryExplorer sessions={data.sessions} onSelectSession={setSelectedSession} selectedSession={selectedSession} />
          )}
        </div>
      </div>

      {/* Right Panel — Chat Detail View */}
      <div className="flex-1">
        <ChatDetailView session={selectedSession} />
      </div>
    </div>
  )
}
