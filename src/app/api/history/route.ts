import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import {
  parseHistoryJsonl,
  organizeByDate,
  organizeByProject,
  organizeByAgent,
  calculateStats,
  parseHistoryBySession,
  sortSessionsByRecent,
} from '@/lib/history-parser'
import { HistoryApiResponse } from '@/types/history'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<HistoryApiResponse>> {
  try {
    // Path to history.jsonl file
    const historyPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'history.jsonl')

    // Read file
    const content = await fs.readFile(historyPath, 'utf-8')

    // Parse
    const sessions = await parseHistoryJsonl(content)

    // Organize
    const byDate = organizeByDate(sessions)
    const byProject = organizeByProject(sessions)
    const byAgent = organizeByAgent(sessions)

    // Group by session (terminal) - Story 1.1
    const bySessionGrouped = parseHistoryBySession(sessions)
    const bySessionArray = sortSessionsByRecent(bySessionGrouped)

    // Stats
    const stats = calculateStats(sessions)

    return NextResponse.json({
      sessions,
      byDate,
      byProject,
      byAgent,
      bySession: bySessionGrouped,
      bySessionArray,
      stats,
    } as any)
  } catch (error) {
    console.error('History API error:', error)

    return NextResponse.json(
      {
        sessions: [],
        byDate: {},
        byProject: {},
        byAgent: {},
        stats: {
          total: 0,
          dateRange: [null, null],
          projects: [],
          agents: [],
          dayWithMostSessions: null,
        },
        error: error instanceof Error ? error.message : 'Failed to load history',
      } as HistoryApiResponse,
      { status: 500 }
    )
  }
}
