'use client'

import { Project } from '@/types/project'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ProjectCardHeaderProps {
  project: Project
  isFocused?: boolean
  onToggleFocus?: () => void
}

export function ProjectCardHeader({
  project,
  isFocused = false,
  onToggleFocus,
}: ProjectCardHeaderProps) {
  return (
    <div className="border-b border-gama-surface-accent pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-gama-primary">{project.name}</h1>
          {isFocused && (
            <span className="px-2 py-1 bg-gama-primary text-gama-dark text-xs font-black rounded">
              🎯 EM FOCO
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
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
          {onToggleFocus && (
            <button
              onClick={onToggleFocus}
              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                isFocused
                  ? 'bg-gama-primary text-gama-dark hover:bg-gama-primary/90'
                  : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/20'
              }`}
            >
              {isFocused ? '⭐ Sair' : '✨ Focar'}
            </button>
          )}
        </div>
      </div>
      <p className="text-gama-text-secondary">
        Health Score: <span className="text-gama-primary font-bold">92/100</span>
      </p>
    </div>
  )
}
