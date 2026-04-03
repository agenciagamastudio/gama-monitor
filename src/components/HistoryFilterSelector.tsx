'use client'

import { ExplorerFilterMode } from '@/types/history'

interface HistoryFilterSelectorProps {
  mode: ExplorerFilterMode
  onModeChange: (mode: ExplorerFilterMode) => void
}

export function HistoryFilterSelector({ mode, onModeChange }: HistoryFilterSelectorProps) {
  const options: { value: ExplorerFilterMode; label: string; emoji: string }[] = [
    { value: 'date', label: 'Por Data', emoji: '📅' },
    { value: 'project', label: 'Por Projeto', emoji: '📁' },
    { value: 'agent', label: 'Por Agente', emoji: '🤖' },
    { value: 'hybrid', label: 'Híbrido', emoji: '🔀' },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gama-text-secondary">Organizar:</span>
      <select
        value={mode}
        onChange={(e) => onModeChange(e.target.value as ExplorerFilterMode)}
        className="px-3 py-2 bg-gama-surface-accent text-gama-text rounded-lg border border-white/10 hover:border-gama-primary/50 focus:border-gama-primary focus:outline-none transition-colors text-sm font-medium"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.emoji} {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
