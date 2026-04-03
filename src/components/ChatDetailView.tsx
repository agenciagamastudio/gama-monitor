'use client'

import { HistorySession } from '@/types/history'
import { ChatBubbles } from './ChatBubbles'
import { useState, useEffect } from 'react'

interface ChatDetailViewProps {
  session: HistorySession | null
  onCopySuccess?: () => void
}

export function ChatDetailView({ session, onCopySuccess }: ChatDetailViewProps) {
  const [copied, setCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  useEffect(() => {
    if (!session) return

    // Load favorites
    const favorites = JSON.parse(localStorage.getItem('history-favorites') || '[]')
    setIsFavorite(favorites.includes(session.id))

    // Load tags
    const allTags = JSON.parse(localStorage.getItem('history-tags') || '{}')
    setTags(allTags[session.id] || [])
  }, [session])

  const handleCopy = async () => {
    if (!session) return
    try {
      await navigator.clipboard.writeText(session.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopySuccess?.()
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const toggleFavorite = () => {
    if (!session) return
    const favorites = JSON.parse(localStorage.getItem('history-favorites') || '[]')
    if (isFavorite) {
      const updated = favorites.filter((id: string) => id !== session.id)
      localStorage.setItem('history-favorites', JSON.stringify(updated))
    } else {
      favorites.push(session.id)
      localStorage.setItem('history-favorites', JSON.stringify(favorites))
    }
    setIsFavorite(!isFavorite)
  }

  const addTag = () => {
    if (!session || !newTag.trim()) return
    if (tags.includes(newTag)) return

    const updated = [...tags, newTag]
    setTags(updated)
    const allTags = JSON.parse(localStorage.getItem('history-tags') || '{}')
    allTags[session.id] = updated
    localStorage.setItem('history-tags', JSON.stringify(allTags))
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    if (!session) return
    const updated = tags.filter((t) => t !== tag)
    setTags(updated)
    const allTags = JSON.parse(localStorage.getItem('history-tags') || '{}')
    allTags[session.id] = updated
    localStorage.setItem('history-tags', JSON.stringify(allTags))
  }

  const exportAsJson = () => {
    if (!session) return
    const dataStr = JSON.stringify(session, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `session-${session.id.substring(0, 8)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsTxt = () => {
    if (!session) return
    const txt = `
═══════════════════════════════════════════════════════
SESSION: ${session.id}
═══════════════════════════════════════════════════════

📅 Data: ${session.timestamp.toLocaleString('pt-BR')}
🤖 Agente: ${session.agent || '(nenhum)'}
📁 Projeto: ${session.project || '(nenhum)'}
📝 Palavras: ${session.wordCount}

───────────────────────────────────────────────────────
CONTEÚDO
───────────────────────────────────────────────────────

${session.content}

═══════════════════════════════════════════════════════
`
    const blob = new Blob([txt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `session-${session.id.substring(0, 8)}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!session) {
    return (
      <div className="flex flex-col h-full bg-gama-dark items-center justify-center">
        <div className="text-center text-gama-text-secondary">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg font-semibold">Selecione uma conversa</p>
          <p className="text-sm mt-2">Clique em qualquer sessão para visualizar o histórico</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gama-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-gama-surface border-b border-white/10 flex-shrink-0">
        <div className="flex-1">
          <time className="text-sm text-gama-text-secondary block">
            {session.timestamp.toLocaleString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
          <div className="flex items-center gap-2 mt-2">
            {session.agent && (
              <span className="text-xs px-2 py-1 bg-gama-primary/20 text-gama-primary rounded-full font-medium">
                🤖 {session.agent}
              </span>
            )}
            {session.project && (
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full font-medium">
                📁 {session.project}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleCopy}
            title="Copiar para clipboard"
            className="p-2 hover:bg-gama-surface-accent rounded-lg transition-colors text-gama-text-secondary hover:text-gama-primary"
          >
            📋
          </button>
          {copied && <span className="text-xs text-gama-success">✓ Copiado</span>}

          <button
            onClick={toggleFavorite}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite ? 'text-gama-primary bg-gama-primary/10' : 'text-gama-text-secondary hover:text-gama-primary'
            }`}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              title="Exportar"
              className="p-2 hover:bg-gama-surface-accent rounded-lg transition-colors text-gama-text-secondary hover:text-gama-primary"
            >
              ⬇️
            </button>
            <div className="absolute right-0 top-full mt-1 bg-gama-surface border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 w-40">
              <button
                onClick={handleCopy}
                className="w-full text-left px-4 py-2 hover:bg-gama-surface-accent text-sm text-gama-text transition-colors rounded-t-lg"
              >
                📋 Copiar
              </button>
              <button
                onClick={exportAsJson}
                className="w-full text-left px-4 py-2 hover:bg-gama-surface-accent text-sm text-gama-text transition-colors"
              >
                📄 JSON
              </button>
              <button
                onClick={exportAsTxt}
                className="w-full text-left px-4 py-2 hover:bg-gama-surface-accent text-sm text-gama-text transition-colors rounded-b-lg"
              >
                📝 TXT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl">
          <ChatBubbles session={session} />
        </div>
      </div>

      {/* Tags Section */}
      <div className="px-4 py-3 bg-gama-surface border-y border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => removeTag(tag)}
              className="text-xs px-2 py-1 bg-gama-primary/10 text-gama-primary border border-gama-primary/30 rounded-full hover:bg-gama-primary/20 transition-colors flex items-center gap-1"
              title="Clique para remover"
            >
              #{tag}
              <span className="text-xs">✕</span>
            </button>
          ))}

          {showTagInput ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag()
                  }
                }}
                placeholder="nova tag..."
                className="text-xs px-2 py-1 bg-gama-surface-accent text-gama-text rounded border border-white/10 focus:outline-none focus:border-gama-primary w-24"
                autoFocus
              />
              <button
                onClick={addTag}
                className="text-xs px-2 py-1 bg-gama-primary text-gama-dark rounded font-semibold hover:brightness-110"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-xs px-2 py-1 bg-gama-surface-accent text-gama-text-secondary rounded hover:text-gama-primary transition-colors"
            >
              + tag
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gama-surface border-t border-white/10 text-xs text-gama-text-secondary flex items-center justify-between flex-shrink-0">
        <div>
          <span>{session.wordCount} palavras</span>
        </div>
        <div className="font-mono text-gama-text-tertiary">ID: {session.id.substring(0, 12)}...</div>
      </div>
    </div>
  )
}
