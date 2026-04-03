'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { HistoryApiResponse } from '@/types/history'
import {
  filterByPeriod,
  PeriodType,
  groupByWeek,
  topAgents,
  topProjects,
  calcAvgWordCount,
  calcTopAgent,
  buildHeatmapData,
  generateInsights,
} from '@/lib/dashboard-stats'
import { DashboardOverviewCards } from '@/components/dashboard/DashboardOverviewCards'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { AgentProjectCharts } from '@/components/dashboard/AgentProjectCharts'
import { TrendsChart } from '@/components/dashboard/TrendsChart'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { SmartInsights } from '@/components/dashboard/SmartInsights'

export default function DashboardPage() {
  const [data, setData] = useState<HistoryApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<PeriodType>('7d')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/history')
        const json = (await response.json()) as HistoryApiResponse

        if (!response.ok) {
          throw new Error(json.error || 'Failed to load history')
        }

        // Convert timestamps
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

        const byAgent: Record<string, typeof sessions> = {}
        for (const [key, val] of Object.entries(json.byAgent)) {
          byAgent[key] = val.map((s) => ({
            ...s,
            timestamp: new Date(s.timestamp),
          }))
        }

        const byProject: Record<string, typeof sessions> = {}
        for (const [key, val] of Object.entries(json.byProject)) {
          byProject[key] = val.map((s) => ({
            ...s,
            timestamp: new Date(s.timestamp),
          }))
        }

        setData({
          ...json,
          sessions,
          byDate,
          byAgent,
          byProject,
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gama-dark">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <p className="text-gama-text-secondary">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gama-dark">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-gama-primary mb-3">Erro ao carregar</h2>
          <p className="text-gama-text-secondary mb-4">{error || 'Tente novamente mais tarde'}</p>
          <Link
            href="/historic"
            className="px-4 py-2 bg-gama-primary text-gama-dark font-semibold rounded-lg hover:brightness-110 transition-all inline-block"
          >
            ← Voltar
          </Link>
        </div>
      </div>
    )
  }

  // Filter by period (using terminal-grouped data from Story 1.1)
  const bySessionObject = data.bySession || {}
  const allTerminals = data.bySessionArray || []
  const filtered = filterByPeriod(bySessionObject, period)

  // Compute stats (all now count terminals, not messages)
  const avgWords = calcAvgWordCount(filtered)
  const topAgentName = calcTopAgent(filtered)
  const trends = groupByWeek(filtered)
  const agents = topAgents(filtered, 5)
  const projects = topProjects(filtered, 5)
  const heatmapData = buildHeatmapData(filtered)
  const insights = generateInsights(filtered, period, allTerminals)

  const overviewCards = [
    { label: 'Total', value: data.stats.total, emoji: '💬', color: 'bg-gama-surface-accent' },
    { label: period === '7d' ? 'Esta semana' : 'Este período', value: filtered.length, emoji: '📊', color: 'bg-gama-primary/10' },
    { label: 'Média de Palavras', value: avgWords, emoji: '📝', color: 'bg-gama-surface-accent' },
    { label: 'Top Agente', value: topAgentName, emoji: '🤖', color: 'bg-gama-surface-accent' },
  ]

  return (
    <div className="flex flex-col h-screen bg-gama-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gama-dark border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/historic"
            className="text-gama-text-secondary hover:text-white transition-colors text-sm font-semibold"
          >
            ← Histórico
          </Link>
          <h1 className="text-xl font-black text-gama-primary">📊 Dashboard de Estatísticas</h1>
        </div>

        <PeriodSelector period={period} onPeriodChange={setPeriod} />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Overview Cards */}
          <DashboardOverviewCards cards={overviewCards} />

          {/* Activity Heatmap */}
          <ActivityHeatmap data={heatmapData} />

          {/* Charts Grid */}
          <AgentProjectCharts agents={agents} projects={projects} />

          {/* Trends */}
          <TrendsChart data={trends} />

          {/* Insights */}
          <SmartInsights insights={insights} />
        </div>
      </div>
    </div>
  )
}
