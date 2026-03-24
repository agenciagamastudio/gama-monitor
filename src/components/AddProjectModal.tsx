'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Project } from '@/types/project'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: Omit<Project, 'id' | 'status' | 'lastChecked'>) => void
}

export function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [port, setPort] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && path && port) {
      onAdd({
        name,
        path,
        port: parseInt(port),
      })
      setName('')
      setPath('')
      setPort('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gama-surface border border-gama-surface-accent rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-gama-primary">Novo Projeto</h2>
          <button
            onClick={onClose}
            className="text-gama-text-secondary hover:text-gama-text transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome do Projeto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: NOVO_PROJETO"
              className="w-full px-4 py-2 bg-gama-dark border border-gama-surface-accent rounded-lg text-gama-text placeholder-gama-text-tertiary focus:outline-none focus:border-gama-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Caminho da Pasta</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="Ex: GAMA_NOVO/project-app"
              className="w-full px-4 py-2 bg-gama-dark border border-gama-surface-accent rounded-lg text-gama-text placeholder-gama-text-tertiary focus:outline-none focus:border-gama-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Porta (localhost)</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="Ex: 3018"
              className="w-full px-4 py-2 bg-gama-dark border border-gama-surface-accent rounded-lg text-gama-text placeholder-gama-text-tertiary focus:outline-none focus:border-gama-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gama-surface-accent text-gama-text rounded-lg hover:bg-gama-surface-accent/80 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gama-primary text-gama-dark font-semibold rounded-lg hover:bg-gama-primary/90 transition-all"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
