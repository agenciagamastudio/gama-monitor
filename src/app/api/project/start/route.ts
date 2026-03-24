import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'
import { readdirSync, statSync } from 'fs'

// Store running processes in memory
const processes = new Map<number, any>()

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

    if (processes.has(port)) {
      return NextResponse.json(
        { error: 'Project already running on this port', success: false },
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

    // Spawn npm run dev with port argument
    const child = spawn('npm', ['run', 'dev', '--', '-p', port.toString()], {
      cwd: projectPath,
      shell: true,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    // Capture stderr for debugging
    let errorOutput = ''
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
    }

    // Store process reference
    processes.set(port, child)

    // Remove from map if process exits
    child.on('exit', (code) => {
      console.log(`Process on port ${port} exited with code ${code}`)
      if (errorOutput && code !== 0) {
        console.error(`Errors from process: ${errorOutput}`)
      }
      processes.delete(port)
    })

    // Handle errors
    child.on('error', (err) => {
      console.error(`Error starting project on port ${port}:`, err)
      processes.delete(port)
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
