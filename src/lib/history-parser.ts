import { HistorySession, ExplorerNode, HistoryStats } from '@/types/history'

export async function parseHistoryJsonl(content: string): Promise<HistorySession[]> {
  const lines = content.trim().split('\n')
  const sessions: HistorySession[] = []

  for (const line of lines) {
    if (!line.trim()) continue

    try {
      const parsed = JSON.parse(line)
      const timestamp = new Date(parsed.timestamp || Date.now())
      const content = parsed.content || ''

      // Generate deterministic ID: timestamp base36 + content hash
      const tsBase36 = timestamp.getTime().toString(36)
      const contentSnippet = content.slice(0, 24).replace(/\W+/g, '')
      const id = `${tsBase36}-${contentSnippet}`.substring(0, 32)

      const session: HistorySession = {
        id,
        timestamp,
        content,
        preview: content.substring(0, 100),
        agent: parsed.agent,
        project: parsed.project,
        wordCount: content.split(/\s+/).length,
        tags: extractAgentAndProject(content),
      }
      sessions.push(session)
    } catch (err) {
      console.error('Failed to parse line:', line, err)
    }
  }

  return sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function organizeByDate(sessions: HistorySession[]): Record<string, HistorySession[]> {
  const grouped: Record<string, HistorySession[]> = {}

  for (const session of sessions) {
    const date = session.timestamp.toISOString().split('T')[0]
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(session)
  }

  return grouped
}

export function organizeByProject(sessions: HistorySession[]): Record<string, HistorySession[]> {
  const grouped: Record<string, HistorySession[]> = {}

  for (const session of sessions) {
    const project = session.project || 'Untagged'
    if (!grouped[project]) {
      grouped[project] = []
    }
    grouped[project].push(session)
  }

  return grouped
}

export function organizeByAgent(sessions: HistorySession[]): Record<string, HistorySession[]> {
  const grouped: Record<string, HistorySession[]> = {}

  for (const session of sessions) {
    const agent = session.agent || 'Direct'
    if (!grouped[agent]) {
      grouped[agent] = []
    }
    grouped[agent].push(session)
  }

  return grouped
}

export function buildExplorerTree(
  sessions: HistorySession[],
  mode: 'date' | 'project' | 'agent'
): ExplorerNode[] {
  let organized: Record<string, HistorySession[]>

  switch (mode) {
    case 'date':
      organized = organizeByDate(sessions)
      break
    case 'project':
      organized = organizeByProject(sessions)
      break
    case 'agent':
      organized = organizeByAgent(sessions)
      break
  }

  return Object.entries(organized).map(([key, value]) => ({
    id: `${mode}-${key}`,
    name: key,
    type: 'folder' as const,
    expanded: false,
    children: value.map((session) => ({
      id: session.id,
      name: session.preview.substring(0, 50) + (session.preview.length > 50 ? '...' : ''),
      type: 'session' as const,
      session,
    })),
  }))
}

export function calculateStats(sessions: HistorySession[]): HistoryStats {
  if (sessions.length === 0) {
    return {
      total: 0,
      dateRange: [null, null] as [null, null],
      projects: [],
      agents: [],
      dayWithMostSessions: null,
    }
  }

  const sortedByDate = sessions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  const projectsSet = new Set(
    sessions
      .map((s) => s.project)
      .filter((p): p is string => p !== undefined)
  )
  const agentsSet = new Set(
    sessions
      .map((s) => s.agent)
      .filter((a): a is string => a !== undefined)
  )

  const byDate = organizeByDate(sessions)
  let maxDay = null
  let maxCount = 0

  for (const [date, daySessions] of Object.entries(byDate)) {
    if (daySessions.length > maxCount) {
      maxCount = daySessions.length
      maxDay = { date, count: daySessions.length }
    }
  }

  return {
    total: sessions.length,
    dateRange: [
      sortedByDate[0].timestamp.toISOString(),
      sortedByDate[sessions.length - 1].timestamp.toISOString(),
    ],
    projects: Array.from(projectsSet),
    agents: Array.from(agentsSet),
    dayWithMostSessions: maxDay,
  }
}

function extractAgentAndProject(content: string): string[] {
  const tags: string[] = []

  // Extract agents: @dev, @architect, @pm, etc.
  const agentMatches = content.match(/@\w+/g)
  if (agentMatches) {
    tags.push(...agentMatches)
  }

  // Extract project names (GAMA_SOMETHING or PROJECT-SOMETHING)
  const projectMatches = content.match(/GAMA_\w+|PROJECT[-_]\w+/g)
  if (projectMatches) {
    tags.push(...projectMatches)
  }

  return [...new Set(tags)] // dedupe
}
