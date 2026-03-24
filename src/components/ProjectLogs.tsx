'use client'

import { useEffect, useRef, useState } from 'react'

interface ProjectLogsProps {
  port: number
  isOnline: boolean
}

type FilterType = 'ALL' | 'ERROR' | 'INFO'

export function ProjectLogs({ port, isOnline }: ProjectLogsProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [autoScroll, setAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Polling logs every 2 seconds
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/project/logs?port=${port}`)
        const data = await response.json()
        if (data.logs) {
          setLogs(data.logs)
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [port])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  // Filter logs based on filter type
  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true
    if (filter === 'ERROR') return log.includes('[ERROR]') || log.includes('[FATAL]')
    if (filter === 'INFO') return !log.includes('[ERROR]') && !log.includes('[FATAL]')
    return true
  })

  const handleClear = () => {
    setLogs([])
  }

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      setAutoScroll(isAtBottom)
    }
  }

  return (
    <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-4 flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gama-text">Logs do Projeto</h3>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-gama-success animate-pulse' : 'bg-gama-error'}`} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="px-2 py-1 text-xs bg-gama-surface-accent text-gama-text hover:bg-gama-primary/20 rounded transition-all"
            title="Limpar logs"
          >
            Limpar
          </button>
          <label className="flex items-center gap-1 text-xs text-gama-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3"
            />
            Auto-scroll
          </label>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-3">
        {(['ALL', 'ERROR', 'INFO'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded transition-all ${
              filter === f
                ? 'bg-gama-primary text-gama-dark font-semibold'
                : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Logs container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-gama-dark rounded border border-gama-surface-accent p-3 font-mono text-xs text-gama-text-secondary"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gama-text-secondary">
            {logs.length === 0 && isOnline ? (
              <div className="text-center space-y-2">
                <p className="text-gama-warning">⚠️ Projeto iniciado externamente</p>
                <p className="text-xs">Logs não disponíveis quando iniciado fora do Monitor.</p>
                <p className="text-xs mt-3">Para ver logs em tempo real:</p>
                <p className="text-xs font-semibold text-gama-primary">Pare o projeto e inicie pelo Monitor</p>
              </div>
            ) : logs.length === 0 ? (
              'Nenhum log ainda...'
            ) : (
              'Nenhum log com esse filtro'
            )}
          </div>
        ) : (
          <>
            {filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes('[ERROR]') || log.includes('[FATAL]') ? 'text-gama-error' : ''
                }
              >
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>

      {/* Info footer */}
      <div className="text-xs text-gama-text-tertiary mt-2">
        {filteredLogs.length} de {logs.length} linhas • Max 200 linhas
      </div>
    </div>
  )
}
