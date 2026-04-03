'use client'

import { GroupedSession, formatDuration } from '@/lib/history-parser'
import { HistorySession } from '@/types/history'
import { ChatBubbles } from './ChatBubbles'
import { useState } from 'react'

interface TerminalCardProps {
  terminal: GroupedSession
  terminalId: string
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

export function TerminalCard({
  terminal,
  terminalId,
  isFavorite,
  onToggleFavorite,
}: TerminalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const lastTimeString = new Date(terminal.lastTime).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  // Combine all display messages for ChatBubbles
  const combinedDisplay = terminal.events.map((e) => e.display).join('\n')

  // Create a pseudo-HistorySession for ChatBubbles
  const pseudoSession: HistorySession = {
    id: terminalId,
    timestamp: new Date(terminal.lastTime),
    content: combinedDisplay,
    preview: combinedDisplay.substring(0, 100),
    agent: terminal.project,
    project: terminal.project,
    wordCount: combinedDisplay.split(/\s+/).length,
    tags: [],
  }

  return (
    <div className="bg-gama-surface border border-white/10 rounded-lg p-4 transition-all hover:border-gama-primary/30">
      {/* Header: Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left focus:outline-none"
      >
        <div className="flex items-center gap-3 cursor-pointer">
          {/* Icon */}
          <span className="text-2xl flex-shrink-0">📱</span>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-gama-primary text-sm">
                {terminal.count} mensagem{terminal.count !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gama-text-secondary">
                {formatDuration(terminal.duration)}
              </span>
            </div>
            <div className="text-sm text-gama-text-secondary truncate mt-1">
              Last: {terminal.lastDisplay.substring(0, 60)}
              {terminal.lastDisplay.length > 60 ? '...' : ''}
            </div>
            <div className="text-xs text-gama-text-secondary mt-0.5">
              {terminal.project} • {lastTimeString}
            </div>
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(terminalId)
            }}
            className="text-xl flex-shrink-0 hover:scale-110 transition-transform"
          >
            {isFavorite ? '⭐' : '☆'}
          </button>

          {/* Expand arrow */}
          <span className="text-gama-text-secondary flex-shrink-0">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {/* Expanded content: Messages */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <ChatBubbles session={pseudoSession} />
        </div>
      )}
    </div>
  )
}
