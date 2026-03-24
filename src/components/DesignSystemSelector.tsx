'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface DesignSystemSelectorProps {
  currentDS: string
  onChangeDS: (ds: string) => void
}

const designSystems = [
  { id: 'gama', name: 'Gama • Verde', color: '#88CE11' },
  { id: 'gama-dark', name: 'Gama • Dark', color: '#1a1a1a' },
  { id: 'gama-client', name: 'Gama • Cliente', color: '#4F46E5' },
]

export function DesignSystemSelector({
  currentDS,
  onChangeDS,
}: DesignSystemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const current = designSystems.find((ds) => ds.id === currentDS)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gama-surface border border-gama-surface-accent rounded-lg hover:bg-gama-surface-accent transition-all"
      >
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: current?.color }} />
        <span className="text-sm font-medium">{current?.name}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gama-surface border border-gama-surface-accent rounded-lg shadow-lg overflow-hidden z-50">
          {designSystems.map((ds) => (
            <button
              key={ds.id}
              onClick={() => {
                onChangeDS(ds.id)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gama-surface-accent transition-all ${
                currentDS === ds.id ? 'bg-gama-primary/10 border-l-2 border-gama-primary' : ''
              }`}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ds.color }} />
              <span className="text-sm font-medium">{ds.name}</span>
              {currentDS === ds.id && <span className="ml-auto text-gama-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
