import { HistorySession, ExplorerNode, HistoryStats } from '@/types/history'

/**
 * History Parser - Session-based grouping utility
 * Parses raw history events and groups them by sessionId (terminal)
 */

export interface HistoryEvent {
  display: string
  pastedContents: Record<string, unknown>
  timestamp: number
  project: string
  sessionId: string
}

export interface SessionMetadata {
  count: number
  firstTime: number
  lastTime: number
  duration: number
  lastDisplay: string
  project: string
}

export interface GroupedSession extends SessionMetadata {
  events: HistoryEvent[]
}

export interface SessionGroup {
  [sessionId: string]: GroupedSession
}

/**
 * Parse raw history events and group by sessionId
 * Accepts both HistoryEvent (raw) and HistorySession (parsed) formats
 * @param events - Array of history events from history.jsonl or HistorySession[]
 * @returns Grouped sessions object with metadata
 */
export function parseHistoryBySession(events: (HistoryEvent | HistorySession | any)[]): SessionGroup {
  const grouped: SessionGroup = {}

  for (const event of events) {
    // Support both raw events (with sessionId) and HistorySession (with id)
    const sessionId = (event as any).sessionId || (event as any).id || 'unknown'
    if (!sessionId) continue

    if (!grouped[sessionId]) {
      grouped[sessionId] = {
        events: [] as HistoryEvent[],
        count: 0,
        firstTime: (event as any).timestamp,
        lastTime: (event as any).timestamp,
        lastDisplay: (event as any).display || (event as any).content || '',
        project: (event as any).project || 'Unknown',
        duration: 0
      }
    }

    // Convert to HistoryEvent format for storage
    const historyEvent: HistoryEvent = {
      display: (event as any).display || (event as any).content || '',
      pastedContents: (event as any).pastedContents || {},
      timestamp: (event as any).timestamp,
      project: (event as any).project || 'Unknown',
      sessionId,
    }

    grouped[sessionId].events.push(historyEvent)
    grouped[sessionId].count++
    grouped[sessionId].lastTime = (event as any).timestamp
    grouped[sessionId].lastDisplay = (event as any).display || (event as any).content || ''
    grouped[sessionId].duration = grouped[sessionId].lastTime - grouped[sessionId].firstTime
  }

  return grouped
}

/**
 * Convert grouped sessions to sorted array (most recent first)
 * @param grouped - Grouped sessions object
 * @returns Array of grouped sessions sorted by lastTime descending
 */
export function sortSessionsByRecent(grouped: SessionGroup): GroupedSession[] {
  return Object.values(grouped).sort((a, b) => b.lastTime - a.lastTime)
}

/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "4 hours 5 minutes")
 */
export function formatDuration(ms: number): string {
  if (ms < 0) return '0 minutes'

  const totalSeconds = Math.floor(ms / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)

  const hours = totalHours % 24
  const minutes = totalMinutes % 60

  const parts: string[] = []

  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)

  if (parts.length === 0) return '0 minutes'
  if (parts.length === 1) return parts[0]

  return parts.slice(0, -1).join(', ') + ' ' + parts[parts.length - 1]
}

// ===== Original history parser functions (preserved) =====

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
