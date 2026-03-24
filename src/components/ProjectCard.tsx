'use client'

import { Project } from '@/types/project'
import { ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface ProjectCardProps {
  project: Project | null
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [copied, setCopied] = useState(false)

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

  const handleCopyPath = () => {
    navigator.clipboard.writeText(project.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
