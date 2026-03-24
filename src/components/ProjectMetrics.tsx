'use client'

import { useEffect, useState } from 'react'
import { Project } from '@/types/project'

interface ProjectMetricsProps {
  project: Project
}

export function ProjectMetrics({ project }: ProjectMetricsProps) {
  const [uptime, setUptime] = useState<string>('--:--:--')
  const [lastRestart, setLastRestart] = useState<string>('-')

  // Update uptime every second
  useEffect(() => {
    if (!project.lastOnlineAt) {
      setUptime('--:--:--')
      return
    }

    const updateUptime = () => {
      const uptimeMs = Date.now() - project.lastOnlineAt!
      const seconds = Math.floor((uptimeMs / 1000) % 60)
      const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60)
      const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24)
      const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24))

      if (days > 0) {
        setUptime(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setUptime(`${hours}h ${minutes}m`)
      } else {
        setUptime(`${minutes}m ${seconds}s`)
      }
    }

    updateUptime()
    const interval = setInterval(updateUptime, 1000)
    return () => clearInterval(interval)
  }, [project.lastOnlineAt])

  // Format last restart time
  useEffect(() => {
    if (!project.lastOnlineAt) {
      setLastRestart('-')
      return
    }

    const updateLastRestart = () => {
      const diffMs = Date.now() - project.lastOnlineAt!
      const diffSeconds = Math.floor(diffMs / 1000)
      const diffMinutes = Math.floor(diffSeconds / 60)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffDays > 0) {
        setLastRestart(`há ${diffDays} dia${diffDays > 1 ? 's' : ''}`)
      } else if (diffHours > 0) {
        setLastRestart(`há ${diffHours}h`)
      } else if (diffMinutes > 0) {
        setLastRestart(`há ${diffMinutes}min`)
      } else {
        setLastRestart('agora')
      }
    }

    updateLastRestart()
    const interval = setInterval(updateLastRestart, 5000)
    return () => clearInterval(interval)
  }, [project.lastOnlineAt])

  return (
    <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gama-text mb-3">Métricas</h3>
      <div className="grid grid-cols-3 gap-3">
        {/* Uptime */}
        <div className="bg-gama-dark rounded-lg p-3 border border-gama-surface-accent/50">
          <p className="text-xs text-gama-text-secondary mb-1">Uptime</p>
          <p className="text-lg font-bold text-gama-primary font-mono">{uptime}</p>
        </div>

        {/* Restart Count */}
        <div className="bg-gama-dark rounded-lg p-3 border border-gama-surface-accent/50">
          <p className="text-xs text-gama-text-secondary mb-1">Restarts</p>
          <p className="text-lg font-bold text-gama-primary font-mono">
            {project.restartCount ?? 0}
          </p>
        </div>

        {/* Last Restart */}
        <div className="bg-gama-dark rounded-lg p-3 border border-gama-surface-accent/50">
          <p className="text-xs text-gama-text-secondary mb-1">Último</p>
          <p className="text-sm font-semibold text-gama-text">{lastRestart}</p>
        </div>
      </div>
    </div>
  )
}
