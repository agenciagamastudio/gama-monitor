import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'
import { readdirSync, statSync, existsSync } from 'fs'
import { register, appendLog, removeEntry } from '@/lib/process-registry'

// Detect project type by checking root folder only
function detectProjectType(basePath: string): 'python' | 'nodejs' | 'unknown' {
  try {
    // Priority 1: Check for main.py in root (Python projects)
    if (existsSync(join(basePath, 'main.py'))) {
      return 'python'
    }

    // Priority 2: Check for package.json in root (Node.js projects)
    if (existsSync(join(basePath, 'package.json'))) {
      return 'nodejs'
    }

    return 'unknown'
  } catch {
    return 'unknown'
  }
}

// Check if port is already in use
async function isPortInUse(port: number): Promise<boolean> {
  try {
    await fetch(`http://localhost:${port}`, {
      method: 'HEAD',
      mode: 'no-cors',
    })
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectName, port, path, frontendPath, frontendPort } = await request.json()

    if (!projectName || !port || !path) {
      return NextResponse.json(
        { error: 'Missing projectName, port, or path' },
        { status: 400 }
      )
    }

    // If frontend is specified, validate it
    if (frontendPath && !frontendPort) {
      return NextResponse.json(
        { error: 'frontendPort must be provided when frontendPath is specified' },
        { status: 400 }
      )
    }

    if (frontendPort && !frontendPath) {
      return NextResponse.json(
        { error: 'frontendPath must be provided when frontendPort is specified' },
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

    // Validate frontend port is different from backend port
    if (frontendPort && frontendPort === port) {
      return NextResponse.json(
        { error: 'Frontend port must be different from backend port' },
        { status: 400 }
      )
    }

    // Validate path (prevent path traversal)
    if (typeof path !== 'string' || path.includes('..') || path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      )
    }

    // Validate frontend path if specified
    if (frontendPath) {
      if (typeof frontendPath !== 'string' || frontendPath.includes('..') || frontendPath.startsWith('/')) {
        return NextResponse.json(
          { error: 'Invalid frontend path' },
          { status: 400 }
        )
      }
    }

    // Check if already running
    const portInUse = await isPortInUse(port)
    if (portInUse) {
      return NextResponse.json(
        { error: `Port ${port} is already in use`, success: false },
        { status: 400 }
      )
    }

    // Check frontend port if specified
    if (frontendPort) {
      const frontendPortInUse = await isPortInUse(frontendPort)
      if (frontendPortInUse) {
        return NextResponse.json(
          { error: `Frontend port ${frontendPort} is already in use`, success: false },
          { status: 400 }
        )
      }
    }

    // Build project path
    const projectPath = join(
      'C:',
      'Users',
      'Usuario',
      'Desktop',
      'O_GRANDE_PROJETO',
      path
    )

    // Build frontend path if specified
    let frontendProjectPath: string | null = null
    if (frontendPath) {
      frontendProjectPath = join(
        'C:',
        'Users',
        'Usuario',
        'Desktop',
        'O_GRANDE_PROJETO',
        frontendPath
      )

      // Verify frontend path exists
      if (!existsSync(frontendProjectPath)) {
        return NextResponse.json(
          { error: `Frontend path does not exist: ${frontendPath}` },
          { status: 400 }
        )
      }
    }

    console.log(`\n[DEBUG] Starting project at: ${projectPath}`)
    console.log(`[DEBUG] Port: ${port}`)
    if (frontendProjectPath) {
      console.log(`[DEBUG] Frontend path: ${frontendProjectPath}`)
      console.log(`[DEBUG] Frontend port: ${frontendPort}`)
    }

    // Auto-detect project type (root folder only)
    const projectType = detectProjectType(projectPath)
    console.log(`[DEBUG] Detected project type: ${projectType}`)
    console.log(`[DEBUG] main.py exists: ${existsSync(join(projectPath, 'main.py'))}`)
    console.log(`[DEBUG] package.json exists: ${existsSync(join(projectPath, 'package.json'))}`)

    let command: string
    let args: string[]

    if (projectType === 'python') {
      // Python project (Priority 1)
      command = 'python'
      args = [join(projectPath, 'main.py'), '--mode', 'listen']
      console.log(`[DEBUG] ✅ Using Python: ${command} main.py --mode listen`)
    } else if (projectType === 'nodejs') {
      // Node.js project (Priority 2)
      command = 'npm'
      args = ['run', 'dev', '--', '-p', port.toString()]
      console.log(`[DEBUG] ✅ Using Node.js: ${command} run dev -p ${port}`)
    } else {
      console.log(`[DEBUG] ❌ Project type unknown`)
      return NextResponse.json(
        { error: 'Project type not detected (no main.py or package.json found in project root)' },
        { status: 400 }
      )
    }

    // Spawn process with detected command
    const child = spawn(command, args, {
      cwd: projectPath,
      shell: true,
      detached: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    // Register process in registry
    register(port, child)

    // Capture stdout for logs
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        const line = data.toString().trim()
        if (line) {
          appendLog(port, line)
          console.log(`[${port}] ${line}`)
        }
      })
    }

    // Capture stderr for logs and debugging
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        const line = data.toString().trim()
        if (line) {
          appendLog(port, `[ERROR] ${line}`)
          console.error(`[${port}] ${line}`)
        }
      })
    }

    // Remove from registry if process exits
    child.on('exit', (code) => {
      console.log(`Process on port ${port} exited with code ${code}`)
      removeEntry(port)
    })

    // Handle errors
    child.on('error', (err) => {
      console.error(`Error starting project on port ${port}:`, err)
      appendLog(port, `[FATAL] ${err.message}`)
      removeEntry(port)
    })

    // Spawn frontend process if specified
    let frontendPid: number | null = null
    if (frontendProjectPath && frontendPort) {
      console.log(`\n[DEBUG] Starting frontend at: ${frontendProjectPath}`)

      const frontendChild = spawn('npm', ['run', 'dev', '--', '-p', frontendPort.toString()], {
        cwd: frontendProjectPath,
        shell: true,
        detached: false,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      // Register frontend process in registry (use frontend port as key)
      register(frontendPort, frontendChild)
      frontendPid = frontendChild.pid || null

      console.log(`[DEBUG] ✅ Frontend process spawned with PID: ${frontendPid}`)

      // Capture stdout for logs
      if (frontendChild.stdout) {
        frontendChild.stdout.on('data', (data) => {
          const line = data.toString().trim()
          if (line) {
            appendLog(frontendPort, line)
            console.log(`[${frontendPort}] ${line}`)
          }
        })
      }

      // Capture stderr for logs and debugging
      if (frontendChild.stderr) {
        frontendChild.stderr.on('data', (data) => {
          const line = data.toString().trim()
          if (line) {
            appendLog(frontendPort, `[ERROR] ${line}`)
            console.error(`[${frontendPort}] ${line}`)
          }
        })
      }

      // Remove from registry if process exits
      frontendChild.on('exit', (code) => {
        console.log(`Frontend process on port ${frontendPort} exited with code ${code}`)
        removeEntry(frontendPort)
      })

      // Handle errors
      frontendChild.on('error', (err) => {
        console.error(`Error starting frontend on port ${frontendPort}:`, err)
        appendLog(frontendPort, `[FATAL] ${err.message}`)
        removeEntry(frontendPort)
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: frontendPort
          ? `Project starting on port ${port}, frontend on port ${frontendPort}...`
          : `Project starting on port ${port}...`,
        pid: child.pid,
        frontendPid: frontendPid,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in start route:', error)
    return NextResponse.json(
      { error: 'Failed to start project', details: String(error) },
      { status: 500 }
    )
  }
}
