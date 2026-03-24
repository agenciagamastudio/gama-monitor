'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { Copy } from 'lucide-react'

interface ProjectCardInfoProps {
  project: Project
}

export function ProjectCardInfo({ project }: ProjectCardInfoProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPath = () => {
    navigator.clipboard.writeText(project.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
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
  )
}
