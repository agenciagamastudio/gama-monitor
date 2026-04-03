import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { existsSync, copyFileSync } from 'fs'
import { execSync } from 'child_process'
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

// Setup Node.js project (dependencies, env, build)
async function setupNodeProject(
  projectPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1a. Check if monorepo and install root first
    const parentDir = dirname(projectPath)
    const isMonorepo = existsSync(join(parentDir, 'package.json'))

    if (isMonorepo) {
      console.log(`[SETUP] Monorepo detectado. Instalando dependências na raiz...`)
      try {
        execSync('npm install', {
          cwd: parentDir,
          stdio: 'pipe',
          timeout: 120000,
        })
        console.log(`[SETUP] ✓ Root dependencies instaladas`)
      } catch (e) {
        console.error(`[SETUP] ⚠ npm install na raiz falhou (continuando):`, String(e).slice(0, 100))
      }
    }

    // 1b. Install dependencies in project folder
    console.log(`[SETUP] Instalando dependências em ${projectPath.split('/').pop()}...`)
    try {
      execSync('npm install', {
        cwd: projectPath,
        stdio: 'pipe',
        timeout: 120000,
      })
      console.log(`[SETUP] ✓ Dependências instaladas`)
    } catch (e) {
      return {
        success: false,
        error: `npm install falhou: ${String(e).slice(0, 150)}`,
      }
    }

    // 2. Auto-copy .env.example → .env if not exists
    const envPath = join(projectPath, '.env')
    const envExamplePath = join(projectPath, '.env.example')

    if (existsSync(envExamplePath) && !existsSync(envPath)) {
      console.log(`[SETUP] Copiando .env.example → .env...`)
      try {
        copyFileSync(envExamplePath, envPath)
        console.log(`[SETUP] ✓ .env criado`)
      } catch (e) {
        console.error(`[SETUP] ⚠ Erro ao copiar .env:`, String(e).slice(0, 100))
      }
    }

    // 3. Run npm build if Next.js detected
    const hasNextConfig =
      existsSync(join(projectPath, 'next.config.js')) ||
      existsSync(join(projectPath, 'next.config.ts'))

    if (hasNextConfig) {
      console.log(`[SETUP] Next.js detectado. Compilando build...`)
      try {
        execSync('npm run build', {
          cwd: projectPath,
          stdio: 'pipe',
          timeout: 300000, // 5 min
        })
        console.log(`[SETUP] ✓ Build concluído`)
      } catch (e) {
        console.warn(
          `[SETUP] ⚠ npm build falhou (dev mode pode funcionar):`,
          String(e).slice(0, 100)
        )
        // Build failure is NOT fatal for dev mode
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Setup falhou: ${String(error).slice(0, 150)}`,
    }
  }
}

// Setup Python project (dependencies, env)
async function setupPythonProject(projectPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. pip install if requirements.txt exists
    const reqPath = join(projectPath, 'requirements.txt')

    if (existsSync(reqPath)) {
      console.log(`[SETUP] Instalando dependências Python...`)
      try {
        execSync('pip install -r requirements.txt', {
          cwd: projectPath,
          stdio: 'pipe',
          timeout: 120000,
        })
        console.log(`[SETUP] ✓ Dependências Python instaladas`)
      } catch (e) {
        return {
          success: false,
          error: `pip install falhou: ${String(e).slice(0, 150)}`,
        }
      }
    }

    // 2. Auto-copy .env.example → .env if not exists
    const envPath = join(projectPath, '.env')
    const envExamplePath = join(projectPath, '.env.example')

    if (existsSync(envExamplePath) && !existsSync(envPath)) {
      console.log(`[SETUP] Copiando .env.example → .env...`)
      try {
        copyFileSync(envExamplePath, envPath)
        console.log(`[SETUP] ✓ .env criado`)
      } catch (e) {
        console.error(`[SETUP] ⚠ Erro ao copiar .env:`, String(e).slice(0, 100))
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Setup Python falhou: ${String(error).slice(0, 150)}`,
    }
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

    console.log(`\n[DEBUG] === PROJECT START REQUEST ===`)
    console.log(`[DEBUG] Project: ${projectName}`)
    console.log(`[DEBUG] Port: ${port}`)
    console.log(`[DEBUG] Path: ${projectPath}`)

    // Auto-detect project type (root folder only)
    const projectType = detectProjectType(projectPath)
    console.log(`[DEBUG] Detected project type: ${projectType}`)

    if (projectType === 'unknown') {
      return NextResponse.json(
        { error: 'Project type not detected (no main.py or package.json found in project root)' },
        { status: 400 }
      )
    }

    // ===== PRÉ-FLIGHT SETUP (NEW) =====
    console.log(`\n[DEBUG] === PRÉ-FLIGHT SETUP ===`)

    let setupResult
    if (projectType === 'nodejs') {
      setupResult = await setupNodeProject(projectPath)
      if (!setupResult.success) {
        return NextResponse.json(
          { error: `Pré-flight setup falhou: ${setupResult.error}`, success: false },
          { status: 400 }
        )
      }
    } else if (projectType === 'python') {
      setupResult = await setupPythonProject(projectPath)
      if (!setupResult.success) {
        return NextResponse.json(
          { error: `Pré-flight setup falhou: ${setupResult.error}`, success: false },
          { status: 400 }
        )
      }
    }

    console.log(`[DEBUG] === PRÉ-FLIGHT COMPLETE ===\n`)

    let command: string
    let args: string[]

    if (projectType === 'python') {
      command = 'python'
      args = [join(projectPath, 'main.py'), '--mode', 'listen']
      console.log(`[DEBUG] Rodando: ${command} main.py --mode listen`)
    } else if (projectType === 'nodejs') {
      command = 'npm'
      args = ['run', 'dev', '--', '-p', port.toString()]
      console.log(`[DEBUG] Rodando: ${command} run dev -p ${port}`)
    } else {
      return NextResponse.json(
        { error: `Unknown project type: ${projectType}`, success: false },
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
      console.log(`\n[DEBUG] === FRONTEND PRÉ-FLIGHT SETUP ===`)

      // Setup frontend
      const frontendSetupResult = await setupNodeProject(frontendProjectPath)
      if (!frontendSetupResult.success) {
        return NextResponse.json(
          { error: `Frontend setup falhou: ${frontendSetupResult.error}`, success: false },
          { status: 400 }
        )
      }

      console.log(`[DEBUG] === FRONTEND SETUP COMPLETE ===\n`)

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

      console.log(`[DEBUG] Frontend process spawned with PID: ${frontendPid}`)

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
