'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { ExternalLink, RotateCw } from 'lucide-react'

interface ProjectCardPreviewProps {
  project: Project
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop'

export function ProjectCardPreview({ project }: ProjectCardPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [refreshKey, setRefreshKey] = useState(0)
  const projectUrl = `http://localhost:${project.port}`

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return '375px'
      case 'tablet':
        return '768px'
      case 'desktop':
        return '100%'
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleExpandClick = () => {
    window.open(projectUrl, '_blank')
  }

  return (
    <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gama-text">Preview</h3>
        <div className="flex items-center gap-2">
          {/* Viewport selector */}
          <div className="flex gap-1">
            {(['mobile', 'tablet', 'desktop'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className={`px-2 py-1 text-xs rounded transition-all ${
                  viewport === v
                    ? 'bg-gama-primary text-gama-dark font-semibold'
                    : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/20'
                }`}
                title={v === 'mobile' ? '375px' : v === 'tablet' ? '768px' : 'Full width'}
              >
                {v === 'mobile' ? '📱' : v === 'tablet' ? '📲' : '🖥️'}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          {project.status === 'online' && (
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gama-surface-accent rounded transition-all"
              title="Recarregar preview"
            >
              <RotateCw size={16} className="text-gama-primary" />
            </button>
          )}

          {/* Expand button */}
          <button
            onClick={handleExpandClick}
            className="p-2 hover:bg-gama-surface-accent rounded transition-all"
            title="Abrir em nova aba"
          >
            <ExternalLink size={16} className="text-gama-primary" />
          </button>
        </div>
      </div>

      {project.status === 'online' ? (
        <div className="bg-gama-dark rounded-lg overflow-hidden flex justify-center">
          <div style={{ width: getViewportWidth() }} className="max-w-full overflow-hidden">
            <iframe
              key={refreshKey}
              src={projectUrl}
              className="w-full h-96 border-0"
              title={`Preview of ${project.name}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
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
