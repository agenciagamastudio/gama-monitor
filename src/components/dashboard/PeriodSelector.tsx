'use client'

import { PeriodType } from '@/lib/dashboard-stats'

interface PeriodSelectorProps {
  period: PeriodType
  onPeriodChange: (period: PeriodType) => void
}

export function PeriodSelector({ period, onPeriodChange }: PeriodSelectorProps) {
  const options: Array<{ value: PeriodType; label: string }> = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
    { value: 'all', label: 'Tudo' },
  ]

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gama-text-secondary">Período:</span>
      <select
        value={period}
        onChange={(e) => onPeriodChange(e.target.value as PeriodType)}
        className="px-4 py-2 bg-gama-surface-accent text-gama-text rounded-lg border border-white/10 hover:border-gama-primary/50 focus:border-gama-primary focus:outline-none transition-colors text-sm font-medium"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
