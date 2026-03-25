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
    const { projectName, port, path } = await request.json()

    if (!projectName || !port || !path) {
      return NextResponse.json(
        { error: 'Missing projectName, port, or path' },
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

    // Validate path (prevent path traversal)
    if (typeof path !== 'string' || path.includes('..') || path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      )
    }

    // Check if already running
    const portInUse = await isPortInUse(port)
    if (portInUse) {
      return NextResponse.json(
        { error: `Port ${port} is already in use`, success: false },
        { status: 400 }
      )
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

    console.log(`\n[DEBUG] Starting project at: ${projectPath}`)
    console.log(`[DEBUG] Port: ${port}`)

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

    return NextResponse.json(
      {
        success: true,
        message: `Project starting on port ${port}...`,
        pid: child.pid,
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
