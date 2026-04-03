'use client'

import { useState, useEffect } from 'react'
import { HistorySessionsList } from './HistorySessionsList'
import { HistoryCalendar } from './HistoryCalendar'
import { HistoryExplorer } from './HistoryExplorer'
import { ChatDetailView } from './ChatDetailView'
import { HistoryApiResponse, HistorySession } from '@/types/history'

type TabType = 'list' | 'calendar' | 'explorer' | 'favorites'

export function HistoryTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [data, setData] = useState<HistoryApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/history')
        const json = (await response.json()) as HistoryApiResponse

        if (!response.ok) {
          throw new Error(json.error || 'Failed to load history')
        }

        // Convert date strings to Date objects
        const sessions = json.sessions.map((s) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }))

        const byDate: Record<string, typeof sessions> = {}
        for (const [key, val] of Object.entries(json.byDate)) {
          byDate[key] = val.map((s) => ({
            ...s,
            timestamp: new Date(s.timestamp),
          }))
        }

        setData({
          ...json,
          sessions,
          byDate,
        })
        setError(null)

        // Load favorites
        const fav = JSON.parse(localStorage.getItem('history-favorites') || '[]')
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

  // Filter sessions for active tab
  let filteredSessions = data.sessions
  if (activeTab === 'favorites') {
    filteredSessions = data.sessions.filter((s) => favorites.has(s.id))
  }

  const tabs: Array<{ id: TabType; label: string; emoji: string }> = [
    { id: 'list', label: 'Lista', emoji: '📋' },
    { id: 'calendar', label: 'Calendário', emoji: '📅' },
    { id: 'explorer', label: 'Explorador', emoji: '📁' },
    { id: 'favorites', label: 'Favoritos', emoji: '⭐' },
  ]

  return (
    <div className="flex gap-0 h-full">
      {/* Left Panel — List */}
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
          <span>📊 {data.stats.total}</span>
          {data.stats.dayWithMostSessions && <span>🔥 {data.stats.dayWithMostSessions.count}</span>}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'list' && (
            <HistorySessionsList sessions={filteredSessions} onSelectSession={setSelectedSession} selectedSession={selectedSession} />
          )}
          {activeTab === 'calendar' && (
            <HistoryCalendar byDate={data.byDate} onSelectSession={setSelectedSession} />
          )}
          {activeTab === 'explorer' && (
            <HistoryExplorer sessions={data.sessions} onSelectSession={setSelectedSession} selectedSession={selectedSession} />
          )}
          {activeTab === 'favorites' && (
            <HistorySessionsList sessions={filteredSessions} onSelectSession={setSelectedSession} selectedSession={selectedSession} />
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
