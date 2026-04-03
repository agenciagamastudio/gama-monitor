'use client'

import Link from 'next/link'
import { HistoryTabs } from '@/components/HistoryTabs'

export default function HistoricPage() {
  return (
    <div className="flex flex-col h-screen bg-gama-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gama-dark border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gama-text-secondary hover:text-white transition-colors text-sm font-semibold"
          >
            ← Voltar
          </Link>
          <h1 className="text-xl font-black text-gama-primary">📚 Histórico de Conversas</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/historic/dashboard"
            className="px-4 py-2 bg-gama-primary/10 text-gama-primary hover:bg-gama-primary/20 transition-colors text-sm font-semibold rounded-lg border border-gama-primary/30"
          >
            📊 Dashboard
          </Link>
          <div className="text-xs text-gama-text-secondary">
            {new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <HistoryTabs />
      </div>
    </div>
  )
}
