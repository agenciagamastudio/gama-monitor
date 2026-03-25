import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'
import { readdirSync, statSync, existsSync } from 'fs'
import { register, appendLog, removeEntry } from '@/lib/process-registry'

// Find package.json recursively in project folder
function findProjectRoot(basePath: string): string | null {
  try {
    const items = readdirSync(basePath)

    // Check if package.json exists in current folder
    if (items.includes('package.json')) {
      return basePath
    }

    // Search one level deeper for common patterns
    for (const item of items) {
      const itemPath = join(basePath, item)
      try {
        if (statSync(itemPath).isDirectory()) {
          const subItems = readdirSync(itemPath)
          if (subItems.includes('package.json')) {
            return itemPath
          }
        }
      } catch {
        // Skip if can't read directory
      }
    }

    return basePath // Return base path if no package.json found
  } catch {
    return basePath
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
    let projectPath = join(
      'C:',
      'Users',
      'Usuario',
      'Desktop',
      'O_GRANDE_PROJETO',
      path
    )

    // Find the correct folder with package.json
    const actualProjectRoot = findProjectRoot(projectPath)
    if (actualProjectRoot) {
      projectPath = actualProjectRoot
    }

    console.log(`Starting project at: ${projectPath} on port ${port}`)

    // Auto-detect project type
    const mainPyExists = existsSync(join(projectPath, 'main.py'))
    const packageJsonExists = existsSync(join(projectPath, 'package.json'))

    let command: string
    let args: string[]

    if (mainPyExists) {
      // Python project
      command = 'python'
      args = [join(projectPath, 'main.py'), '--mode', 'listen']
      console.log(`Detected Python project, using: ${command} ${args.join(' ')}`)
    } else if (packageJsonExists) {
      // Node.js project
      command = 'npm'
      args = ['run', 'dev', '--', '-p', port.toString()]
      console.log(`Detected Node.js project, using: ${command} ${args.join(' ')}`)
    } else {
      return NextResponse.json(
        { error: 'Project type not detected (no main.py or package.json found)' },
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
