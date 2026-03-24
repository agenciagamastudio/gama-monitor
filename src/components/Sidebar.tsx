'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react'

interface SidebarProps {
  projects: Project[]
  selectedProjectId: string | null
  focusedProjectId: string | null
  onSelectProject: (projectId: string) => void
  onToggleFocus: (projectId: string) => void
  onAddProject: () => void
}

export function Sidebar({
  projects,
  selectedProjectId,
  focusedProjectId,
  onSelectProject,
  onToggleFocus,
  onAddProject,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const [hovering, setHovering] = useState(false)
  const isOpen = expanded || hovering

  return (
    <aside
      className={`bg-gama-surface border-r border-gama-surface-accent h-screen overflow-y-auto flex flex-col transition-all duration-200 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gama-surface-accent flex items-center justify-between">
        <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
          <div>
            <h1 className="text-2xl font-black text-gama-primary whitespace-nowrap">👑 MONITOR</h1>
            <p className="text-xs text-gama-text-secondary mt-2 whitespace-nowrap">Real-time Hub</p>
          </div>
        </div>
        {!isOpen && (
          <div className="text-gama-primary text-xl font-black">👑</div>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto flex-shrink-0 p-2 hover:bg-gama-surface-accent rounded transition-all"
          title={expanded ? 'Recolher' : 'Expandir'}
        >
          {expanded ? (
            <ChevronLeft size={18} className="text-gama-primary" />
          ) : (
            <ChevronRight size={18} className="text-gama-primary" />
          )}
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {projects.map((project) => {
            const isFocused = focusedProjectId === project.id
            const isSelected = selectedProjectId === project.id
            const hasActiveFocus = focusedProjectId !== null

            return (
              <div
                key={project.id}
                className={`transition-opacity duration-200 ${
                  hasActiveFocus && !isFocused ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <button
                  onClick={() => onSelectProject(project.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gama-primary text-gama-dark font-semibold'
                      : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/10'
                  } ${isFocused ? 'ring-2 ring-gama-primary' : ''}`}
                  title={isOpen ? undefined : `${project.name} (${project.port})`}
                >
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          project.status === 'online' ? 'bg-gama-success' : 'bg-gama-error'
                        }`}
                      />
                      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        <div className="whitespace-nowrap">
                          <span className="text-sm font-medium">{project.name}</span>
                          <p className="text-xs text-gama-text-tertiary">:{project.port}</p>
                        </div>
                      </div>
                    </div>
                    {isFocused && isOpen && (
                      <span className="text-lg flex-shrink-0">🎯</span>
                    )}
                  </div>
                </button>
                {isOpen && (
                  <button
                    onClick={() => onToggleFocus(project.id)}
                    className={`w-full mt-1 px-3 py-1 text-xs rounded transition-all ${
                      isFocused
                        ? 'bg-gama-primary text-gama-dark font-semibold'
                        : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/20'
                    }`}
                  >
                    {isFocused ? '⭐ Sair do foco' : '✨ Focar'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Project Button */}
      <div className="p-4 border-t border-gama-surface-accent">
        <button
          onClick={onAddProject}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gama-primary text-gama-dark font-black rounded-lg hover:bg-gama-primary/90 transition-all"
          title={isOpen ? undefined : 'Novo Projeto'}
        >
          <Plus size={18} className="flex-shrink-0" />
          <span className={`overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Novo Projeto
          </span>
        </button>
      </div>
    </aside>
  )
}
