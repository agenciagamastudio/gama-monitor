'use client'

import { Project } from '@/types/project'
import { Plus, Zap } from 'lucide-react'

interface SidebarProps {
  projects: Project[]
  selectedProjectId: string | null
  onSelectProject: (projectId: string) => void
  onAddProject: () => void
}

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-gama-surface border-r border-gama-surface-accent h-screen overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gama-surface-accent">
        <h1 className="text-2xl font-black text-gama-primary">👑 MONITOR</h1>
        <p className="text-xs text-gama-text-secondary mt-2">Real-time Hub</p>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedProjectId === project.id
                  ? 'bg-gama-primary text-gama-dark font-semibold'
                  : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    project.status === 'online' ? 'bg-gama-success' : 'bg-gama-error'
                  }`}
                />
                <span className="text-sm font-medium">{project.name}</span>
              </div>
              <p className="text-xs text-gama-text-tertiary mt-1">:{project.port}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Add Project Button */}
      <div className="p-4 border-t border-gama-surface-accent">
        <button
          onClick={onAddProject}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gama-primary text-gama-dark font-black rounded-lg hover:bg-gama-primary/90 transition-all"
        >
          <Plus size={18} />
          Novo Projeto
        </button>
      </div>
    </aside>
  )
}
