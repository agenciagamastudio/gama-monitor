'use client'

import { useEffect, useRef, useState } from 'react'
import { Project } from '@/types/project'
import { Check } from 'lucide-react'

interface ProjectNotesProps {
  project: Project
  onSave: (notes: string) => void
}

export function ProjectNotes({ project, onSave }: ProjectNotesProps) {
  const [notes, setNotes] = useState(project.notes ?? '')
  const [saved, setSaved] = useState(true)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save with 500ms debounce
  useEffect(() => {
    if (notes === project.notes) {
      setSaved(true)
      return
    }

    setSaved(false)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      onSave(notes)
      setSaved(true)
      setLastSavedTime(new Date())
    }, 500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [notes, project.notes, onSave])

  const getLastSavedText = () => {
    if (!lastSavedTime) return ''
    const now = new Date()
    const diffMs = now.getTime() - lastSavedTime.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)

    if (diffSeconds < 60) {
      return 'salvo agora'
    }
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) {
      return `salvo há ${diffMinutes}min`
    }
    const diffHours = Math.floor(diffMinutes / 60)
    return `salvo há ${diffHours}h`
  }

  return (
    <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gama-text">Anotações do Projeto</h3>
        {saved && lastSavedTime && (
          <div className="flex items-center gap-1 text-xs text-gama-success">
            <Check size={14} />
            {getLastSavedText()}
          </div>
        )}
        {!saved && (
          <div className="text-xs text-gama-text-secondary animate-pulse">Salvando...</div>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anote algo sobre este projeto..."
        className="w-full h-32 bg-gama-dark border border-gama-surface-accent rounded-lg p-3 text-gama-text placeholder-gama-text-tertiary focus:border-gama-primary focus:outline-none resize-none"
      />

      <p className="text-xs text-gama-text-tertiary mt-2">
        As anotações são salvas automaticamente a cada mudança
      </p>
    </div>
  )
}
