export interface HistorySession {
  id: string
  timestamp: Date
  content: string
  preview: string
  agent?: string
  project?: string
  wordCount: number
  tags: string[]
}

export interface ExplorerNode {
  id: string
  name: string
  type: 'folder' | 'session'
  children?: ExplorerNode[]
  session?: HistorySession
  expanded?: boolean
}

export interface HistoryStats {
  total: number
  dateRange: [string, string] | [null, null]
  projects: string[]
  agents: string[]
  dayWithMostSessions: { date: string; count: number } | null
}

export interface HistoryApiResponse {
  sessions: HistorySession[]
  byDate: Record<string, HistorySession[]>
  byProject: Record<string, HistorySession[]>
  byAgent: Record<string, HistorySession[]>
  bySession?: Record<string, any>
  bySessionArray?: any[]
  stats: HistoryStats
  error?: string
}

export type ExplorerFilterMode = 'date' | 'project' | 'agent' | 'hybrid'
