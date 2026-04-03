'use client'

import { Insight } from '@/lib/dashboard-stats'

interface SmartInsightsProps {
  insights: Insight[]
}

export function SmartInsights({ insights }: SmartInsightsProps) {
  return (
    <div className="bg-gama-surface rounded-lg p-6 border border-white/10">
      <h3 className="text-lg font-bold text-gama-primary mb-4">💡 Insights</h3>

      {insights.length === 0 ? (
        <p className="text-gama-text-secondary text-sm">Sem insights disponíveis para este período</p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gama-surface-accent rounded-lg border border-white/5 hover:border-gama-primary/30 transition-colors">
              <span className="text-xl flex-shrink-0">{insight.emoji}</span>
              <p className="text-sm text-gama-text leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
