'use client'

import { Project } from '@/types/project'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ProjectCardHeaderProps {
  project: Project
}

export function ProjectCardHeader({ project }: ProjectCardHeaderProps) {
  return (
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
      <p className="text-gama-text-secondary">
        Health Score: <span className="text-gama-primary font-bold">92/100</span>
      </p>
    </div>
  )
}
