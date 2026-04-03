'use client'

import { useState } from 'react'
import { HistoryApiResponse, HistorySession } from '@/types/history'

interface HistorySearchBarProps {
  data: HistoryApiResponse
  onFilter: (filtered: HistorySession[]) => void
}

export function HistorySearchBar({ data, onFilter }: HistorySearchBarProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Apply filters whenever something changes
  const applyFilters = () => {
    let filtered = data.sessions

    // Text search
    if (searchText.trim()) {
      const query = searchText.toLowerCase()
      filtered = filtered.filter((s) => s.content.toLowerCase().includes(query))
    }

    // Agent filter
    if (selectedAgents.size > 0) {
      filtered = filtered.filter((s) => s.agent && selectedAgents.has(s.agent))
    }

    // Project filter
    if (selectedProjects.size > 0) {
      filtered = filtered.filter((s) => s.project && selectedProjects.has(s.project))
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate)
      filtered = filtered.filter((s) => s.timestamp >= start)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // Include entire day
      filtered = filtered.filter((s) => s.timestamp <= end)
    }

    onFilter(filtered)
  }

  // Re-apply filters whenever state changes
  const handleSearchChange = (text: string) => {
    setSearchText(text)
  }

  const toggleAgent = (agent: string) => {
    const updated = new Set(selectedAgents)
    if (updated.has(agent)) {
      updated.delete(agent)
    } else {
      updated.add(agent)
    }
    setSelectedAgents(updated)
  }

  const toggleProject = (project: string) => {
    const updated = new Set(selectedProjects)
    if (updated.has(project)) {
      updated.delete(project)
    } else {
      updated.add(project)
    }
    setSelectedProjects(updated)
  }

  // Trigger filter application on every change
  const shouldApply = () => {
    setTimeout(() => {
      applyFilters()
    }, 0)
  }

  return (
    <div className="space-y-3 p-3 bg-gama-surface border-b border-gama-surface-accent">
      {/* Search Input */}
      <input
        type="text"
        placeholder="🔍 Buscar por texto..."
        value={searchText}
        onChange={(e) => {
          handleSearchChange(e.target.value)
          shouldApply()
        }}
        className="w-full px-3 py-2 text-sm bg-gama-surface-accent text-gama-text rounded border border-white/10 hover:border-gama-primary/50 focus:border-gama-primary focus:outline-none transition-colors"
      />

      {/* Show/Hide Filters Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="text-xs px-3 py-1 bg-gama-surface-accent hover:bg-gama-primary/20 text-gama-text rounded transition-colors"
      >
        {showFilters ? '▼ Filtros' : '▶ Filtros Avançados'}
      </button>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="space-y-3 pt-2 border-t border-gama-surface-accent">
          {/* Agent Filter */}
          {data.stats.agents.length > 0 && (
            <div>
              <label className="text-xs text-gama-text-secondary block mb-2">Agentes:</label>
              <div className="flex flex-wrap gap-2">
                {data.stats.agents.map((agent) => (
                  <button
                    key={agent}
                    onClick={() => {
                      toggleAgent(agent)
                      shouldApply()
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      selectedAgents.has(agent)
                        ? 'bg-gama-primary text-gama-dark'
                        : 'bg-gama-surface-accent text-gama-text hover:bg-gama-primary/20'
                    }`}
                  >
                    {agent}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Project Filter */}
          {data.stats.projects.length > 0 && (
            <div>
              <label className="text-xs text-gama-text-secondary block mb-2">Projetos:</label>
              <div className="flex flex-wrap gap-2">
                {data.stats.projects.map((project) => (
                  <button
                    key={project}
                    onClick={() => {
                      toggleProject(project)
                      shouldApply()
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      selectedProjects.has(project)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gama-surface-accent text-gama-text hover:bg-blue-500/20'
                    }`}
                  >
                    {project}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="text-xs text-gama-text-secondary block mb-2">Período:</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  shouldApply()
                }}
                className="flex-1 text-xs px-2 py-1 bg-gama-surface-accent text-gama-text rounded border border-white/10 focus:border-gama-primary focus:outline-none"
              />
              <span className="text-gama-text-secondary text-xs py-1">até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  shouldApply()
                }}
                className="flex-1 text-xs px-2 py-1 bg-gama-surface-accent text-gama-text rounded border border-white/10 focus:border-gama-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedAgents.size > 0 || selectedProjects.size > 0 || startDate || endDate || searchText) && (
            <button
              onClick={() => {
                setSearchText('')
                setSelectedAgents(new Set())
                setSelectedProjects(new Set())
                setStartDate('')
                setEndDate('')
                onFilter(data.sessions)
              }}
              className="text-xs px-3 py-1 bg-gama-error/20 text-gama-error rounded hover:bg-gama-error/30 transition-colors"
            >
              ✕ Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
