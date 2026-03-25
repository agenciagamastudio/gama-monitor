import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { removeEntry } from '@/lib/process-registry'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { port, frontendPort } = await request.json()

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

    // Validate frontend port if specified
    if (frontendPort && (!Number.isInteger(frontendPort) || frontendPort < 1 || frontendPort > 65535)) {
      return NextResponse.json(
        { error: 'Invalid frontend port number (must be 1-65535)' },
        { status: 400 }
      )
    }

    // Helper function to kill process on a port
    const killProcessOnPort = async (portToKill: number): Promise<string | null> => {
      try {
        const { stdout } = await execAsync(`netstat -ano | findstr :${portToKill}`)
        const lines = stdout.split('\n')

        if (lines.length > 0) {
          const parts = lines[0].trim().split(/\s+/)
          const pid = parts[parts.length - 1]

          if (pid && pid !== 'PID') {
            await execAsync(`taskkill /PID ${pid} /F`)
            console.log(`[DEBUG] Killed process ${pid} on port ${portToKill}`)
            return pid
          }
        }
        return null
      } catch (execError) {
        // If netstat fails, try alternative method
        try {
          await execAsync(`netstat -ano | findstr :${portToKill} | for /f "tokens=5" %a in ('more') do taskkill /PID %a /F`, {
            shell: 'cmd.exe',
          })
          console.log(`[DEBUG] Attempted to kill process on port ${portToKill}`)
          return 'unknown'
        } catch {
          // Process might not exist
          return null
        }
      }
    }

    try {
      // Kill backend process
      const backendPid = await killProcessOnPort(port)
      removeEntry(port)

      let stopMessage = `Stopped process on port ${port}`
      if (backendPid) {
        stopMessage = `Stopped process ${backendPid} on port ${port}`
      }

      // Kill frontend process if specified
      if (frontendPort) {
        const frontendPid = await killProcessOnPort(frontendPort)
        removeEntry(frontendPort)

        if (frontendPid) {
          stopMessage += `, frontend ${frontendPid} on port ${frontendPort}`
        } else {
          stopMessage += `, no frontend process found on port ${frontendPort}`
        }
      }

      return NextResponse.json(
        { success: true, message: stopMessage },
        { status: 200 }
      )
    } catch (execError) {
      console.error(`Error killing process on port ${port}:`, execError)
      removeEntry(port)
      if (frontendPort) {
        removeEntry(frontendPort)
      }

      return NextResponse.json(
        { success: true, message: `Attempted to stop process on port ${port}${frontendPort ? ` and frontend on port ${frontendPort}` : ''}` },
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
