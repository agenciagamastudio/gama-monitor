import { NextRequest, NextResponse } from 'next/server'
import { getLogs, getEntry } from '@/lib/process-registry'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const port = searchParams.get('port')

    if (!port) {
      return NextResponse.json(
        { error: 'Missing port parameter' },
        { status: 400 }
      )
    }

    const portNum = parseInt(port)
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return NextResponse.json(
        { error: 'Invalid port number' },
        { status: 400 }
      )
    }

    const entry = getEntry(portNum)
    const logs = getLogs(portNum)

    return NextResponse.json(
      {
        logs,
        pid: entry?.pid,
        uptime: entry ? Date.now() - entry.startTime : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in logs route:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve logs', details: String(error) },
      { status: 500 }
    )
  }
}
