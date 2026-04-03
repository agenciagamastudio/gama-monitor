'use client'

import { useState, useMemo } from 'react'
import { HistorySession, ExplorerNode, ExplorerFilterMode } from '@/types/history'
import { buildExplorerTree } from '@/lib/history-parser'
import { HistoryFilterSelector } from './HistoryFilterSelector'

interface HistoryExplorerProps {
  sessions: HistorySession[]
  selectedSession: HistorySession | null
  onSelectSession: (session: HistorySession) => void
}

export function HistoryExplorer({ sessions, selectedSession, onSelectSession }: HistoryExplorerProps) {
  const [mode, setMode] = useState<ExplorerFilterMode>('date')
  const [search, setSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const tree = useMemo(() => {
    if (mode === 'hybrid') {
      // Combine all three views
      return [
        {
          id: 'date-root',
          name: '📅 Por Data',
          type: 'folder' as const,
          children: buildExplorerTree(sessions, 'date'),
        },
        {
          id: 'project-root',
          name: '📁 Por Projeto',
          type: 'folder' as const,
          children: buildExplorerTree(sessions, 'project'),
        },
        {
          id: 'agent-root',
          name: '🤖 Por Agente',
          type: 'folder' as const,
          children: buildExplorerTree(sessions, 'agent'),
        },
      ]
    }
    return buildExplorerTree(sessions, mode)
  }, [sessions, mode])

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFolders(newExpanded)
  }

  const filterNode = (node: ExplorerNode): ExplorerNode | null => {
    if (search === '') return node

    if (node.type === 'session') {
      const matches =
        node.name.toLowerCase().includes(search.toLowerCase()) ||
        node.session?.content.toLowerCase().includes(search.toLowerCase())

      return matches ? node : null
    }

    // For folders, recursively filter children
    const filteredChildren = node.children
      ?.map((child) => filterNode(child))
      .filter(Boolean) as ExplorerNode[] | undefined

    return filteredChildren && filteredChildren.length > 0
      ? { ...node, children: filteredChildren }
      : null
  }

  const filteredTree = tree.map((node) => filterNode(node)).filter(Boolean) as ExplorerNode[]

  const ExplorerItem = ({ node, level = 0 }: { node: ExplorerNode; level?: number }) => {
    const isExpanded = expandedFolders.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    if (node.type === 'session') {
      return (
        <button
          onClick={() => {
            if (node.session) onSelectSession(node.session)
          }}
          className={`w-full text-left px-3 py-2 hover:bg-gama-surface-accent rounded transition-colors text-sm truncate ${
            selectedSession?.id === node.id ? 'bg-gama-primary/10' : ''
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <span className="mr-2">💬</span>
          {node.name}
        </button>
      )
    }

    return (
      <div key={node.id}>
        <button
          onClick={() => toggleFolder(node.id)}
          className="w-full text-left px-3 py-2 hover:bg-gama-surface-accent rounded transition-colors text-sm font-medium"
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <span className="inline-block w-4 text-center mr-2">
            {hasChildren ? (isExpanded ? '▼' : '▶') : '·'}
          </span>
          <span>{node.name}</span>
          {node.type === 'folder' && hasChildren && (
            <span className="ml-2 text-xs text-gama-text-secondary">
              ({node.children!.length})
            </span>
          )}
        </button>
        {isExpanded && hasChildren && (
          <div>
            {node.children!.map((child) => (
              <ExplorerItem key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Filter */}
      <div className="p-4 bg-gama-surface border-b border-gama-surface-accent space-y-3">
        <HistoryFilterSelector mode={mode} onModeChange={setMode} />
        <input
          type="text"
          placeholder="🔍 Buscar no explorador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-gama-surface-accent text-gama-text rounded-lg border border-white/10 hover:border-gama-primary/50 focus:border-gama-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Explorer Tree */}
      <div className="flex-1 overflow-y-auto">
        {filteredTree.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gama-text-secondary">
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <p>Nada encontrado</p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {filteredTree.map((node) => (
              <ExplorerItem key={node.id} node={node} level={0} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
