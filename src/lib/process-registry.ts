import { ChildProcess } from 'child_process'

export interface ProcessEntry {
  process: ChildProcess
  logs: string[]
  pid?: number
  startTime: number
}

// Store running processes and their logs in memory
const registry = new Map<number, ProcessEntry>()

/**
 * Register a new process with the registry
 */
export function register(port: number, child: ChildProcess): void {
  const entry: ProcessEntry = {
    process: child,
    logs: [],
    pid: child.pid,
    startTime: Date.now(),
  }
  registry.set(port, entry)
}

/**
 * Get a process entry by port
 */
export function getEntry(port: number): ProcessEntry | undefined {
  return registry.get(port)
}

/**
 * Append a log line to a process
 */
export function appendLog(port: number, line: string): void {
  const entry = registry.get(port)
  if (entry) {
    entry.logs.push(line)
    // Keep only last 200 lines
    if (entry.logs.length > 200) {
      entry.logs = entry.logs.slice(-200)
    }
  }
}

/**
 * Get all logs for a process
 */
export function getLogs(port: number): string[] {
  const entry = registry.get(port)
  return entry ? [...entry.logs] : []
}

/**
 * Clear logs for a process
 */
export function clearLogs(port: number): void {
  const entry = registry.get(port)
  if (entry) {
    entry.logs = []
  }
}

/**
 * Remove a process from the registry
 */
export function removeEntry(port: number): void {
  registry.delete(port)
}

/**
 * Get all registered ports
 */
export function getAllPorts(): number[] {
  return Array.from(registry.keys())
}

/**
 * Get process uptime in milliseconds
 */
export function getUptime(port: number): number | null {
  const entry = registry.get(port)
  return entry ? Date.now() - entry.startTime : null
}
