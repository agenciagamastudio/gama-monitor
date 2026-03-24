'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ProjectCard } from '@/components/ProjectCard'
import { AddProjectModal } from '@/components/AddProjectModal'
import { DesignSystemSelector } from '@/components/DesignSystemSelector'
import { PortManager } from '@/components/PortManager'
import { storage } from '@/lib/storage'
import { Project } from '@/types/project'

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDS, setCurrentDS] = useState('gama')
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    setProjects(storage.getProjects())
    setSelectedProjectId(storage.getSelectedProject() || '1')
    setCurrentDS(storage.getDesignSystem())
    setMounted(true)
  }, [])

  // Save projects to localStorage
  useEffect(() => {
    if (mounted) {
      storage.saveProjects(projects)
    }
  }, [projects, mounted])

  // Save selected project
  useEffect(() => {
    if (mounted && selectedProjectId) {
      storage.setSelectedProject(selectedProjectId)
    }
  }, [selectedProjectId, mounted])

  // Save design system
  useEffect(() => {
    if (mounted) {
      storage.setDesignSystem(currentDS)
    }
  }, [currentDS, mounted])

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null

  const handleAddProject = (newProject: Omit<Project, 'id' | 'status' | 'lastChecked'>) => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString(),
      status: 'offline',
    }
    setProjects([...projects, project])
  }

  const handleChangeDS = (ds: string) => {
    setCurrentDS(ds)
    // Aqui você poderia enviar a mudança para todos os projetos via WebSocket/API
    console.log(`Design System changed to: ${ds}`)
  }

  const handleUpdateProjectStatus = (projectId: string, status: 'online' | 'offline') => {
    setProjects(
      projects.map((p) =>
        p.id === projectId ? { ...p, status, lastChecked: Date.now() } : p
      )
    )
  }

  if (!mounted) {
    return <div className="bg-gama-dark h-screen" />
  }

  return (
    <div className="flex h-screen bg-gama-dark">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onAddProject={() => setIsModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-gama-surface border-b border-gama-surface-accent px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="text-sm text-gama-text-secondary">Painel de Controle</h2>
          </div>
          <DesignSystemSelector
            currentDS={currentDS}
            onChangeDS={handleChangeDS}
          />
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="space-y-6">
            <ProjectCard
              project={selectedProject}
              onUpdateProjectStatus={handleUpdateProjectStatus}
            />
            <PortManager projects={projects} />
          </div>
        </div>
      </main>

      {/* Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProject}
      />
    </div>
  )
}
