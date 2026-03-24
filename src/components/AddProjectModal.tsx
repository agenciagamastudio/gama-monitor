'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Project } from '@/types/project'
import { storage } from '@/lib/storage'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: Omit<Project, 'id' | 'status' | 'lastChecked'>) => void
}

export function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [port, setPort] = useState('')
  const [occupiedPorts, setOccupiedPorts] = useState<number[]>([])

  // Load occupied ports and auto-populate next port when modal opens
  useEffect(() => {
    if (isOpen) {
      const occupied = storage.getOccupiedPorts()
      setOccupiedPorts(occupied)
      const nextPort = storage.getNextAvailablePort()
      setPort(nextPort.toString())
    } else {
      // Reset form when modal closes
      setName('')
      setPath('')
      setPort('')
    }
  }, [isOpen])

  const handleAutoPort = () => {
    const nextPort = storage.getNextAvailablePort()
    setPort(nextPort.toString())
  }

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
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="Ex: 3018"
                  className="w-full px-4 py-2 bg-gama-dark border border-gama-surface-accent rounded-lg text-gama-text placeholder-gama-text-tertiary focus:outline-none focus:border-gama-primary"
                />
                {port && occupiedPorts.includes(parseInt(port)) && (
                  <p className="text-xs text-gama-error mt-1">⚠️ Porta já está em uso</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleAutoPort}
                className="px-4 py-2 bg-gama-surface-accent text-gama-text rounded-lg hover:bg-gama-surface-accent/80 transition-all text-sm font-medium whitespace-nowrap"
              >
                Auto
              </button>
            </div>
            {occupiedPorts.length > 0 && (
              <div className="mt-2 p-2 bg-gama-dark rounded text-xs text-gama-text-secondary">
                <p className="mb-1">Portas ocupadas:</p>
                <div className="flex flex-wrap gap-1">
                  {occupiedPorts.map((p) => (
                    <span key={p} className="px-2 py-1 bg-gama-surface rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
