import { HistorySession } from '@/types/history'

export type PeriodType = '7d' | '30d' | '90d' | 'all'

/**
 * Filter sessions by period
 */
export function filterByPeriod(sessions: HistorySession[], period: PeriodType): HistorySession[] {
  if (period === 'all') return sessions

  const now = Date.now()
  const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90

  const cutoff = now - daysAgo * 24 * 60 * 60 * 1000

  return sessions.filter((s) => s.timestamp.getTime() >= cutoff)
}

/**
 * Group sessions by week
 */
export function groupByWeek(sessions: HistorySession[]): Array<{ week: string; count: number; avgWords: number }> {
  const byWeek: Record<string, HistorySession[]> = {}

  sessions.forEach((session) => {
    const date = new Date(session.timestamp)
    // Get Monday of that week
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(date.setDate(diff))
    const weekKey = monday.toISOString().split('T')[0]

    if (!byWeek[weekKey]) {
      byWeek[weekKey] = []
    }
    byWeek[weekKey].push(session)
  })

  return Object.entries(byWeek)
    .map(([week, sessionsInWeek]) => ({
      week,
      count: sessionsInWeek.length,
      avgWords: Math.round(sessionsInWeek.reduce((sum, s) => sum + s.wordCount, 0) / sessionsInWeek.length),
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

/**
 * Get top agents
 */
export function topAgents(
  byAgent: Record<string, HistorySession[]>,
  n: number = 5
): Array<{ name: string; count: number; pct: number }> {
  const total = Object.values(byAgent).reduce((sum, arr) => sum + arr.length, 0)

  return Object.entries(byAgent)
    .map(([name, sessions]) => ({
      name,
      count: sessions.length,
      pct: Math.round((sessions.length / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

/**
 * Get top projects
 */
export function topProjects(
  byProject: Record<string, HistorySession[]>,
  n: number = 5
): Array<{ name: string; count: number; pct: number }> {
  const total = Object.values(byProject).reduce((sum, arr) => sum + arr.length, 0)

  return Object.entries(byProject)
    .map(([name, sessions]) => ({
      name,
      count: sessions.length,
      pct: Math.round((sessions.length / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

/**
 * Calculate average word count
 */
export function calcAvgWordCount(sessions: HistorySession[]): number {
  if (sessions.length === 0) return 0
  const total = sessions.reduce((sum, s) => sum + s.wordCount, 0)
  return Math.round(total / sessions.length)
}

/**
 * Get top agent name
 */
export function calcTopAgent(byAgent: Record<string, HistorySession[]>): string {
  const top = topAgents(byAgent, 1)
  return top.length > 0 ? top[0].name : 'N/A'
}

/**
 * Count active weeks
 */
export function calcActiveWeeks(sessions: HistorySession[]): number {
  const weeks = new Set(
    sessions.map((s) => {
      const date = new Date(s.timestamp)
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(date.setDate(diff))
      return monday.toISOString().split('T')[0]
    })
  )
  return weeks.size
}

/**
 * Build heatmap data (12 weeks)
 */
export function buildHeatmapData(
  byDate: Record<string, HistorySession[]>
): Array<{ date: string; count: number; intensity: 0 | 1 | 2 | 3 | 4 }> {
  const allDates = Object.entries(byDate).map(([date, sessions]) => ({
    date,
    count: sessions.length,
  }))

  if (allDates.length === 0) return []

  const maxCount = Math.max(...allDates.map((d) => d.count), 1)

  return allDates.map((d) => {
    let intensity: 0 | 1 | 2 | 3 | 4 = 0
    if (d.count > 0) {
      const ratio = d.count / maxCount
      intensity =
        ratio < 0.25 ? (1 as const) : ratio < 0.5 ? (2 as const) : ratio < 0.75 ? (3 as const) : (4 as const)
    }
    return { ...d, intensity }
  })
}

/**
 * Generate smart insights
 */
export interface Insight {
  emoji: string
  text: string
}

export function generateInsights(
  sessions: HistorySession[],
  byAgent: Record<string, HistorySession[]>,
  period: PeriodType,
  allSessions: HistorySession[]
): Insight[] {
  const insights: Insight[] = []

  if (sessions.length === 0) {
    return [{ emoji: '📊', text: 'Sem dados para este período' }]
  }

  // Total hours (estimate: avg 5 min per session)
  const hours = Math.round((sessions.length * 5) / 60)
  insights.push({ emoji: '⚡', text: `Você trabalhou ${hours}h neste período` })

  // Compare with previous period
  const daysInPeriod = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 999
  const previousSessions = filterByPeriod(
    allSessions,
    period === 'all' ? 'all' : ('7d' as PeriodType)
  ).filter((s) => {
    const diff = (Date.now() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= daysInPeriod && diff < daysInPeriod * 2
  })

  if (previousSessions.length > 0) {
    const growth = Math.round(((sessions.length - previousSessions.length) / previousSessions.length) * 100)
    if (growth >= 10) {
      insights.push({ emoji: '📈', text: `+${growth}% sessões vs período anterior` })
    } else if (growth <= -10) {
      insights.push({ emoji: '📉', text: `${growth}% sessões vs período anterior` })
    }
  }

  // Top agent
  const topAgent = calcTopAgent(byAgent)
  if (topAgent !== 'N/A') {
    const agentSessions = byAgent[topAgent]?.length || 0
    const pct = Math.round((agentSessions / sessions.length) * 100)
    insights.push({ emoji: '🤖', text: `${topAgent} liderou com ${pct}% das sessões` })
  }

  // Busiest day
  const byDate: Record<string, HistorySession[]> = {}
  sessions.forEach((s) => {
    const date = s.timestamp.toISOString().split('T')[0]
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(s)
  })

  const busiestDay = Object.entries(byDate).sort((a, b) => b[1].length - a[1].length)[0]
  if (busiestDay) {
    const dayName = new Date(busiestDay[0]).toLocaleDateString('pt-BR', { weekday: 'long' })
    insights.push({ emoji: '🔥', text: `Pico em ${dayName} (${busiestDay[1].length} sessões)` })
  }

  // Avg words
  const avgWords = calcAvgWordCount(sessions)
  insights.push({ emoji: '📝', text: `Média de ${avgWords} palavras por conversa` })

  // Unique projects
  const projects = new Set(sessions.map((s) => s.project).filter(Boolean))
  if (projects.size > 0) {
    insights.push({ emoji: '📁', text: `Trabalhado em ${projects.size} projeto${projects.size > 1 ? 's' : ''}` })
  }

  return insights.slice(0, 6) // Top 6 insights
}
