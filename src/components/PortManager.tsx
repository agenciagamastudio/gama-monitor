'use client'

import { Project } from '@/types/project'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface PortManagerProps {
  projects: Project[]
}

export function PortManager({ projects }: PortManagerProps) {
  const occupiedPorts = projects.map((p) => p.port).sort((a, b) => a - b)
  const portRange = Array.from({ length: 20 }, (_, i) => 3000 + i)

  return (
    <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gama-primary mb-3">Gerenciador de Portas</h3>

      <div className="grid grid-cols-5 gap-2">
        {portRange.map((port) => {
          const isOccupied = occupiedPorts.includes(port)
          const project = projects.find((p) => p.port === port)

          return (
            <div
              key={port}
              className={`p-2 rounded text-center text-xs font-mono transition-all ${
                isOccupied
                  ? 'bg-gama-error/20 border border-gama-error/50'
                  : 'bg-gama-surface-accent border border-gama-surface-accent'
              }`}
              title={project ? `${project.name}` : undefined}
            >
              <div className="flex items-center justify-center gap-1">
                {isOccupied ? (
                  <AlertCircle size={12} className="text-gama-error" />
                ) : (
                  <CheckCircle size={12} className="text-gama-success" />
                )}
              </div>
              <p className={isOccupied ? 'text-gama-error' : 'text-gama-success'}>
                {port}
              </p>
              {project && (
                <p className="text-xs text-gama-text-tertiary mt-1 truncate">{project.name}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gama-success" />
          <span className="text-gama-text-secondary">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gama-error" />
          <span className="text-gama-text-secondary">Ocupada</span>
        </div>
      </div>
    </div>
  )
}
