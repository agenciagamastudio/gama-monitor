'use client'

import { Project } from '@/types/project'
import { ExternalLink } from 'lucide-react'

interface ProjectCardPreviewProps {
  project: Project
}

export function ProjectCardPreview({ project }: ProjectCardPreviewProps) {
  const projectUrl = `http://localhost:${project.port}`

  return (
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
  )
}
