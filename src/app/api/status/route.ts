import { NextRequest, NextResponse } from 'next/server'
import { getAllPorts, getEntry } from '@/lib/process-registry'

/**
 * GET /api/status — Endpoint público para JARVIS
 * Verifica status de todas as portas conhecidas
 * Retorna JSON compatível com JARVIS
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const portsParam = searchParams.get('ports')

    // Parse ports from query param or use default ports
    let portsToCheck = getAllPorts()

    if (portsParam) {
      try {
        portsToCheck = JSON.parse(portsParam)
      } catch {
        return NextResponse.json(
          { error: 'Invalid ports parameter (must be JSON array)' },
          { status: 400 }
        )
      }
    }

    // If no ports found in registry, check default ports (3000-3019)
    if (portsToCheck.length === 0) {
      portsToCheck = Array.from({ length: 20 }, (_, i) => 3000 + i)
    }

    // Check all ports in parallel with timeout
    const statusPromises = portsToCheck.map(async (port) => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 500)

        await fetch(`http://localhost:${port}`, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const entry = getEntry(port)
        return {
          port,
          status: 'online' as const,
          pid: entry?.pid,
          url: `http://localhost:${port}`,
        }
      } catch {
        return {
          port,
          status: 'offline' as const,
          pid: undefined,
          url: `http://localhost:${port}`,
        }
      }
    })

    const statuses = await Promise.all(statusPromises)

    return NextResponse.json(
      {
        timestamp: Date.now(),
        projects: statuses,
        total: statuses.length,
        online: statuses.filter((s) => s.status === 'online').length,
        offline: statuses.filter((s) => s.status === 'offline').length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=5',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error in status route:', error)
    return NextResponse.json(
      { error: 'Failed to check status', details: String(error) },
      { status: 500 }
    )
  }
}
