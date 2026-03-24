'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/project'
import { ProjectCardHeader } from './ProjectCardHeader'
import { ProjectCardInfo } from './ProjectCardInfo'
import { ProjectCardPreview } from './ProjectCardPreview'
import { ProjectCardActions } from './ProjectCardActions'
import { ProjectLogs } from './ProjectLogs'
import { ProjectMetrics } from './ProjectMetrics'
import { ProjectNotes } from './ProjectNotes'

interface ProjectCardProps {
  project: Project | null
  isFocused?: boolean
  onToggleFocus?: () => void
  onUpdateProjectStatus?: (projectId: string, status: 'online' | 'offline', updatedFields?: Partial<Project>) => void
}

export function ProjectCard({
  project,
  isFocused,
  onToggleFocus,
  onUpdateProjectStatus,
}: ProjectCardProps) {
  const [status, setStatus] = useState<'online' | 'offline'>(project?.status || 'offline')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  // Health check every 10 seconds
  useEffect(() => {
    if (!project) return

    let previousStatus = status

    const checkHealth = async () => {
      try {
        await fetch(`http://localhost:${project.port}`, {
          method: 'HEAD',
          mode: 'no-cors',
        })
        const newStatus: 'online' | 'offline' = 'online'

        // Detect offline → online transition (restart)
        if (previousStatus === 'offline' && newStatus === 'online') {
          const updatedProject: Partial<Project> = {
            status: newStatus,
            lastOnlineAt: Date.now(),
            restartCount: (project.restartCount ?? 0) + 1,
            totalRestarts: (project.totalRestarts ?? 0) + 1,
          }
          onUpdateProjectStatus?.(project.id, 'online', updatedProject)
        } else {
          onUpdateProjectStatus?.(project.id, 'online')
        }

        previousStatus = newStatus
        setStatus(newStatus)
      } catch {
        previousStatus = 'offline'
        setStatus('offline')
        onUpdateProjectStatus?.(project.id, 'offline')
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [project, onUpdateProjectStatus])

  useEffect(() => {
    setStatus(project?.status || 'offline')
  }, [project?.status])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gama-text-secondary text-lg">Selecione um projeto para começar</p>
        </div>
      </div>
    )
  }

  const handleStartProject = async () => {
    setIsLoading(true)
    setLoadingMessage('Iniciando projeto...')

    try {
      const response = await fetch('/api/project/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          port: project.port,
          path: project.path,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setLoadingMessage('Aguardando servidor... 5s')
        setTimeout(() => {
          setIsLoading(false)
          setLoadingMessage('')
        }, 5000)
      } else {
        setLoadingMessage(`Erro: ${data.error}`)
        setTimeout(() => {
          setIsLoading(false)
          setLoadingMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Error starting project:', error)
      setLoadingMessage('Erro ao iniciar projeto')
      setTimeout(() => {
        setIsLoading(false)
        setLoadingMessage('')
      }, 3000)
    }
  }

  const handleStopProject = async () => {
    setIsLoading(true)
    setLoadingMessage('Parando projeto...')

    try {
      const response = await fetch('/api/project/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: project.port }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('offline')
        onUpdateProjectStatus?.(project.id, 'offline')
        setLoadingMessage('Projeto parado')
        setTimeout(() => {
          setIsLoading(false)
          setLoadingMessage('')
        }, 2000)
      } else {
        setLoadingMessage(`Erro: ${data.error}`)
        setTimeout(() => {
          setIsLoading(false)
          setLoadingMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Error stopping project:', error)
      setLoadingMessage('Erro ao parar projeto')
      setTimeout(() => {
        setIsLoading(false)
        setLoadingMessage('')
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      <ProjectCardHeader
        project={project}
        isFocused={isFocused}
        onToggleFocus={onToggleFocus}
      />
      <ProjectCardInfo project={project} />
      <ProjectCardPreview project={project} />
      <ProjectCardActions
        project={project}
        status={status}
        onStart={handleStartProject}
        onStop={handleStopProject}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
      <ProjectMetrics project={project} />
      <ProjectLogs port={project.port} isOnline={status === 'online'} />
      <ProjectNotes
        project={project}
        onSave={(notes) => onUpdateProjectStatus?.(project.id, status, { ...project, notes })}
      />
    </div>
  )
}
