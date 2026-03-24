'use client'

import { Project } from '@/types/project'
import { ExternalLink, Copy, CheckCircle, AlertCircle, Play, Power } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ProjectCardProps {
  project: Project | null
  onUpdateProjectStatus?: (projectId: string, status: 'online' | 'offline') => void
}

export function ProjectCard({ project, onUpdateProjectStatus }: ProjectCardProps) {
  const [copied, setCopied] = useState(false)
  const [showCommand, setShowCommand] = useState(false)
  const [status, setStatus] = useState<'online' | 'offline'>(project?.status || 'offline')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  // Health check every 10 seconds
  useEffect(() => {
    if (!project) return

    const checkHealth = async () => {
      try {
        const response = await fetch(`http://localhost:${project.port}`, {
          method: 'HEAD',
          mode: 'no-cors',
        })
        setStatus('online')
        onUpdateProjectStatus?.(project.id, 'online')
      } catch {
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

  const projectUrl = `http://localhost:${project.port}`
  const startCommand = `cd "C:\\Users\\Usuario\\Desktop\\O_GRANDE_PROJETO\\${project.name.replace(/ /g, '_')}" && npm run dev`

  const handleCopyPath = () => {
    navigator.clipboard.writeText(project.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(startCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartProject = async () => {
    if (!project) return

    setIsLoading(true)
    setLoadingMessage('Iniciando projeto...')
    setShowCommand(false)

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
        // Wait 5 seconds for server to start, then health check will detect it
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
    if (!project) return

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
      {/* Header */}
      <div className="border-b border-gama-surface-accent pb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black text-gama-primary">{project.name}</h1>
          <div className="flex items-center gap-2">
            {project.status === 'online' ? (
              <>
                <CheckCircle className="text-gama-success" size={24} />
                <span className="text-gama-success font-semibold">Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="text-gama-error" size={24} />
                <span className="text-gama-error font-semibold">Offline</span>
              </>
            )}
          </div>
        </div>
        <p className="text-gama-text-secondary">Health Score: <span className="text-gama-primary font-bold">92/100</span></p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-4">
          <p className="text-sm text-gama-text-secondary mb-2">Pasta do Projeto</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-gama-primary font-mono bg-gama-dark px-2 py-1 rounded flex-1 truncate">
              {project.path}
            </code>
            <button
              onClick={handleCopyPath}
              className="text-gama-text-secondary hover:text-gama-primary transition-all"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied && <p className="text-xs text-gama-success mt-2">✓ Copiado!</p>}
        </div>

        <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-4">
          <p className="text-sm text-gama-text-secondary mb-2">Porta (localhost)</p>
          <p className="text-2xl font-black text-gama-primary">{project.port}</p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-4">
        <p className="text-sm text-gama-text-secondary mb-4">Preview</p>
        {project.status === 'online' ? (
          <div className="bg-gama-dark rounded-lg overflow-hidden">
            <iframe
              src={projectUrl}
              className="w-full h-96 border-0"
              title={`Preview of ${project.name}`}
            />
          </div>
        ) : (
          <div className="bg-gama-dark rounded-lg h-96 flex items-center justify-center border border-dashed border-gama-surface-accent">
            <div className="text-center">
              <p className="text-gama-text-secondary mb-4">Projeto offline</p>
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gama-primary text-gama-dark font-semibold rounded-lg hover:bg-gama-primary/90 transition-all"
              >
                Acessar {project.port}
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Start/Stop Button */}
      <div className="flex flex-col gap-3">
        {isLoading && (
          <div className="bg-gama-surface border border-gama-primary rounded-lg p-4 text-center">
            <p className="text-gama-primary font-semibold animate-pulse">{loadingMessage}</p>
          </div>
        )}
        <div className="flex gap-3">
          {status === 'offline' ? (
            <button
              onClick={handleStartProject}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gama-success text-gama-dark font-semibold rounded-lg hover:bg-gama-success/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isLoading && <Play size={18} />}
              {isLoading ? 'Iniciando...' : 'Iniciar Projeto'}
            </button>
          ) : (
            <button
              onClick={handleStopProject}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gama-error text-white font-semibold rounded-lg hover:bg-gama-error/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isLoading && <Power size={18} />}
              {isLoading ? 'Parando...' : 'Parar Projeto'}
            </button>
          )}
        </div>
      </div>

      {/* Command Display */}
      {showCommand && status === 'offline' && (
        <div className="bg-gama-dark border border-gama-primary rounded-lg p-4">
          <p className="text-sm text-gama-text-secondary mb-3">Execute este comando no terminal:</p>
          <div className="flex items-center gap-2 bg-gama-surface rounded p-3">
            <code className="text-xs font-mono text-gama-primary flex-1 break-all">
              {startCommand}
            </code>
            <button
              onClick={handleCopyCommand}
              className="text-gama-text-secondary hover:text-gama-primary transition-all flex-shrink-0"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied && <p className="text-xs text-gama-success mt-2">✓ Comando copiado!</p>}
          <button
            onClick={() => setShowCommand(false)}
            className="w-full mt-3 px-4 py-2 bg-gama-surface-accent text-gama-text rounded-lg hover:bg-gama-surface-accent/80 transition-all text-sm"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <a
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gama-primary text-gama-dark font-semibold rounded-lg hover:bg-gama-primary/90 transition-all"
        >
          <ExternalLink size={18} />
          Abrir Projeto
        </a>
      </div>
    </div>
  )
}
