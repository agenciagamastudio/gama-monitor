import { GroupedSession } from './history-parser'

export type PeriodType = '7d' | '30d' | '90d' | 'all'

/**
 * Terminal activity - per-terminal metrics
 */
export interface TerminalActivity {
  sessionId: string
  agents: Set<string>
  projects: Set<string>
  messageCount: number
  firstTime: number
  lastTime: number
  dayOfActivity: string[] // ["2026-04-03", "2026-04-04"]
}

/**
 * Convert GroupedSession to TerminalActivity
 */
function convertToTerminalActivity(grouped: Record<string, GroupedSession>): TerminalActivity[] {
  return Object.entries(grouped).map(([sessionId, session]) => {
    const agents = new Set<string>()
    const projects = new Set<string>()

    session.events.forEach((event) => {
      if (event.sessionId) agents.add(event.sessionId)
      if (event.project) projects.add(event.project)
    })

    // Build day of activity
    const daysSet = new Set<string>()
    session.events.forEach((event) => {
      const date = new Date(event.timestamp)
      daysSet.add(date.toISOString().split('T')[0])
    })

    return {
      sessionId,
      agents,
      projects,
      messageCount: session.count,
      firstTime: session.firstTime,
      lastTime: session.lastTime,
      dayOfActivity: Array.from(daysSet),
    }
  })
}

/**
 * Filter terminals by period (NOW COUNTS TERMINALS, NOT MESSAGES)
 */
export function filterByPeriod(
  grouped: Record<string, GroupedSession> | GroupedSession[],
  period: PeriodType
): TerminalActivity[] {
  // Convert input to grouped format if needed
  let groupedSessions: Record<string, GroupedSession>

  if (Array.isArray(grouped)) {
    groupedSessions = {}
    grouped.forEach((g, idx) => {
      groupedSessions[g.firstTime + '-' + idx] = g
    })
  } else {
    groupedSessions = grouped
  }

  const terminals = convertToTerminalActivity(groupedSessions)

  if (period === 'all') return terminals

  const now = Date.now()
  const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const cutoff = now - daysAgo * 24 * 60 * 60 * 1000

  // Filter terminals that had activity in the period
  return terminals.filter((t) => t.lastTime >= cutoff)
}

/**
 * Group terminals by week (NOW COUNTS UNIQUE TERMINALS PER WEEK)
 */
export function groupByWeek(
  terminals: TerminalActivity[]
): Array<{ week: string; count: number; avgWords: number }> {
  const byWeek: Record<string, Set<string>> = {}
  const wordsByWeek: Record<string, number[]> = {}

  terminals.forEach((terminal) => {
    terminal.dayOfActivity.forEach((day) => {
      const date = new Date(day)
      // Get Monday of that week
      const dayOfWeek = date.getDay()
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(date.setDate(diff))
      const weekKey = monday.toISOString().split('T')[0]

      if (!byWeek[weekKey]) {
        byWeek[weekKey] = new Set()
        wordsByWeek[weekKey] = []
      }
      byWeek[weekKey].add(terminal.sessionId)

      // Track word counts for average calculation
      if (!wordsByWeek[weekKey].includes(terminal.messageCount)) {
        wordsByWeek[weekKey].push(terminal.messageCount)
      }
    })
  })

  return Object.entries(byWeek)
    .map(([week, terminalIds]) => ({
      week,
      count: terminalIds.size, // COUNT OF UNIQUE TERMINALS
      avgWords: Math.round(
        wordsByWeek[week].reduce((a, b) => a + b, 0) / Math.max(wordsByWeek[week].length, 1)
      ),
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

/**
 * Get top agents (NOW COUNTS UNIQUE TERMINALS THAT MENTION AGENT)
 */
export function topAgents(
  terminals: TerminalActivity[],
  n: number = 5
): Array<{ name: string; count: number; pct: number }> {
  const agentTerminals: Record<string, Set<string>> = {}

  // Count unique terminals per agent
  terminals.forEach((terminal) => {
    terminal.agents.forEach((agent) => {
      if (!agentTerminals[agent]) {
        agentTerminals[agent] = new Set()
      }
      agentTerminals[agent].add(terminal.sessionId)
    })
  })

  const total = terminals.length || 1

  return Object.entries(agentTerminals)
    .map(([name, terminalIds]) => ({
      name,
      count: terminalIds.size,
      pct: Math.round((terminalIds.size / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

/**
 * Get top projects (NOW COUNTS UNIQUE TERMINALS THAT MENTION PROJECT)
 */
export function topProjects(
  terminals: TerminalActivity[],
  n: number = 5
): Array<{ name: string; count: number; pct: number }> {
  const projectTerminals: Record<string, Set<string>> = {}

  // Count unique terminals per project
  terminals.forEach((terminal) => {
    terminal.projects.forEach((project) => {
      if (!projectTerminals[project]) {
        projectTerminals[project] = new Set()
      }
      projectTerminals[project].add(terminal.sessionId)
    })
  })

  const total = terminals.length || 1

  return Object.entries(projectTerminals)
    .map(([name, terminalIds]) => ({
      name,
      count: terminalIds.size,
      pct: Math.round((terminalIds.size / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

/**
 * Calculate average word count from terminals
 */
export function calcAvgWordCount(terminals: TerminalActivity[]): number {
  if (terminals.length === 0) return 0
  const total = terminals.reduce((sum, t) => sum + t.messageCount, 0)
  return Math.round(total / terminals.length)
}

/**
 * Get top agent name
 */
export function calcTopAgent(terminals: TerminalActivity[]): string {
  const top = topAgents(terminals, 1)
  return top.length > 0 ? top[0].name : 'N/A'
}

/**
 * Count active weeks
 */
export function calcActiveWeeks(terminals: TerminalActivity[]): number {
  const weeks = new Set<string>()
  terminals.forEach((terminal) => {
    terminal.dayOfActivity.forEach((day) => {
      const date = new Date(day)
      const dayOfWeek = date.getDay()
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(date.setDate(diff))
      weeks.add(monday.toISOString().split('T')[0])
    })
  })
  return weeks.size
}

/**
 * Build heatmap data (NOW COUNTS UNIQUE TERMINALS PER DAY)
 */
export function buildHeatmapData(
  terminals: TerminalActivity[]
): Array<{ date: string; count: number; intensity: 0 | 1 | 2 | 3 | 4 }> {
  const byDate: Record<string, Set<string>> = {}

  // Count unique terminals per day
  terminals.forEach((terminal) => {
    terminal.dayOfActivity.forEach((day) => {
      if (!byDate[day]) {
        byDate[day] = new Set()
      }
      byDate[day].add(terminal.sessionId)
    })
  })

  const allDates = Object.entries(byDate).map(([date, terminalIds]) => ({
    date,
    count: terminalIds.size,
  }))

  if (allDates.length === 0) return []

  // Intensity scale: 0=0, 1=1, 2=2, 3=3, 4=4+
  return allDates.map((d) => {
    let intensity: 0 | 1 | 2 | 3 | 4 = (Math.min(d.count, 4) as 0 | 1 | 2 | 3 | 4)
    return { ...d, intensity }
  })
}

/**
 * Generate smart insights (NOW COUNTS TERMINALS)
 */
export interface Insight {
  emoji: string
  text: string
}

export function generateInsights(
  terminals: TerminalActivity[],
  period: PeriodType,
  allTerminals: TerminalActivity[]
): Insight[] {
  const insights: Insight[] = []

  if (terminals.length === 0) {
    return [{ emoji: '📊', text: 'Sem dados para este período' }]
  }

  // Total terminals
  const terminalCount = terminals.length
  insights.push({ emoji: '📱', text: `${terminalCount} terminal${terminalCount !== 1 ? 's' : ''} ativo${terminalCount !== 1 ? 's' : ''} neste período` })

  // Compare with previous period
  const daysInPeriod = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 999
  const now = Date.now()
  const cutoff = now - daysInPeriod * 24 * 60 * 60 * 1000
  const previousTerminals = allTerminals.filter(
    (t) => t.lastTime < cutoff && t.lastTime >= cutoff - daysInPeriod * 24 * 60 * 60 * 1000
  )

  if (previousTerminals.length > 0) {
    const growth = Math.round(((terminalCount - previousTerminals.length) / previousTerminals.length) * 100)
    if (growth >= 10) {
      insights.push({ emoji: '📈', text: `+${growth}% terminais vs período anterior` })
    } else if (growth <= -10) {
      insights.push({ emoji: '📉', text: `${growth}% terminais vs período anterior` })
    }
  }

  // Top agent
  const topAgent = calcTopAgent(terminals)
  if (topAgent !== 'N/A') {
    const agentCount = topAgents(terminals, 1)[0]?.count || 0
    const pct = Math.round((agentCount / terminalCount) * 100)
    insights.push({ emoji: '🤖', text: `${topAgent} utilizado em ${pct}% dos terminais` })
  }

  // Busiest day
  const byDate: Record<string, Set<string>> = {}
  terminals.forEach((t) => {
    t.dayOfActivity.forEach((day) => {
      if (!byDate[day]) byDate[day] = new Set()
      byDate[day].add(t.sessionId)
    })
  })

  const busiestDay = Object.entries(byDate).sort((a, b) => b[1].size - a[1].size)[0]
  if (busiestDay) {
    const dayName = new Date(busiestDay[0]).toLocaleDateString('pt-BR', { weekday: 'long' })
    insights.push({ emoji: '🔥', text: `Pico em ${dayName} (${busiestDay[1].size} terminal${busiestDay[1].size !== 1 ? 's' : ''})` })
  }

  // Avg words
  const avgWords = calcAvgWordCount(terminals)
  insights.push({ emoji: '📝', text: `Média de ${avgWords} palavras por terminal` })

  // Unique projects
  const projectSet = new Set<string>()
  terminals.forEach((t) => {
    t.projects.forEach((p) => projectSet.add(p))
  })
  if (projectSet.size > 0) {
    insights.push({ emoji: '📁', text: `Trabalhado em ${projectSet.size} projeto${projectSet.size > 1 ? 's' : ''}` })
  }

  return insights.slice(0, 6) // Top 6 insights
}
