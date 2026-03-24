'use client'

import { Project } from '@/types/project'
import { Play, Power, ExternalLink } from 'lucide-react'

interface ProjectCardActionsProps {
  project: Project
  status: 'online' | 'offline'
  onStart: () => Promise<void>
  onStop: () => Promise<void>
  isLoading: boolean
  loadingMessage: string
}

export function ProjectCardActions({
  project,
  status,
  onStart,
  onStop,
  isLoading,
  loadingMessage,
}: ProjectCardActionsProps) {
  const projectUrl = `http://localhost:${project.port}`

  return (
    <div className="flex flex-col gap-3">
      {isLoading && (
        <div className="bg-gama-surface border border-gama-primary rounded-lg p-4 text-center">
          <p className="text-gama-primary font-semibold animate-pulse">{loadingMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        {status === 'offline' ? (
          <button
            onClick={onStart}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gama-success text-gama-dark font-semibold rounded-lg hover:bg-gama-success/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoading && <Play size={18} />}
            {isLoading ? 'Iniciando...' : 'Iniciar Projeto'}
          </button>
        ) : (
          <button
            onClick={onStop}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gama-error text-white font-semibold rounded-lg hover:bg-gama-error/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoading && <Power size={18} />}
            {isLoading ? 'Parando...' : 'Parar Projeto'}
          </button>
        )}
      </div>

      <a
        href={projectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gama-primary text-gama-dark font-semibold rounded-lg hover:bg-gama-primary/90 transition-all"
      >
        <ExternalLink size={18} />
        Abrir Projeto
      </a>
    </div>
  )
}
