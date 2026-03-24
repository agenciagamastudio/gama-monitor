import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { port } = await request.json()

    if (!port) {
      return NextResponse.json(
        { error: 'Missing port' },
        { status: 400 }
      )
    }

    // Validate port number
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return NextResponse.json(
        { error: 'Invalid port number (must be 1-65535)' },
        { status: 400 }
      )
    }

    try {
      // Kill process on Windows using netstat and taskkill
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
      const lines = stdout.split('\n')

      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/)
        const pid = parts[parts.length - 1]

        if (pid && pid !== 'PID') {
          await execAsync(`taskkill /PID ${pid} /F`)
          return NextResponse.json(
            { success: true, message: `Stopped process ${pid} on port ${port}` },
            { status: 200 }
          )
        }
      }

      return NextResponse.json(
        { success: true, message: `No process found on port ${port}` },
        { status: 200 }
      )
    } catch (execError) {
      // If netstat fails, try killing by port directly (Windows)
      try {
        await execAsync(`netstat -ano | findstr :${port} | for /f "tokens=5" %a in ('more') do taskkill /PID %a /F`, {
          shell: 'cmd.exe',
        })
      } catch {
        // Process might not exist
      }

      return NextResponse.json(
        { success: true, message: `Attempted to stop process on port ${port}` },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error in stop route:', error)
    return NextResponse.json(
      { error: 'Failed to stop project', details: String(error) },
      { status: 500 }
    )
  }
}
