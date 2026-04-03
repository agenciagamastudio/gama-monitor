'use client'

import { useState } from 'react'
import { HistorySession } from '@/types/history'

interface HistoryCalendarProps {
  byDate: Record<string, HistorySession[]>
  onSelectSession: (session: HistorySession) => void
}

export function HistoryCalendar({ byDate, onSelectSession }: HistoryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day and number of days in month
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const maxSessions = Math.max(...Object.values(byDate).map((s) => s.length), 1)

  const getIntensity = (count: number): string => {
    const intensity = count / maxSessions
    if (intensity === 0) return 'bg-gama-surface-accent'
    if (intensity < 0.25) return 'bg-green-900'
    if (intensity < 0.5) return 'bg-green-700'
    if (intensity < 0.75) return 'bg-gama-primary/50'
    return 'bg-gama-primary'
  }

  const getDayKey = (day: number): string => {
    const d = new Date(year, month, day).toISOString().split('T')[0]
    return d
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
    setSelectedDay(null)
  }

  const selectedSessions = selectedDay ? byDate[selectedDay] : []

  return (
    <div className="flex gap-6 h-full">
      {/* Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gama-surface border-b border-gama-surface-accent">
          <button
            onClick={prevMonth}
            className="px-3 py-2 bg-gama-surface-accent hover:bg-gama-primary/20 rounded transition-all"
          >
            ← Anterior
          </button>
          <h3 className="text-lg font-bold text-gama-primary">
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            className="px-3 py-2 bg-gama-surface-accent hover:bg-gama-primary/20 rounded transition-all"
          >
            Próximo →
          </button>
        </div>

        {/* Legend */}
        <div className="px-4 pb-4 flex items-center gap-4 text-xs">
          <span className="text-gama-text-secondary">Intensidade:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gama-surface-accent rounded"></div>
            <span className="text-gama-text-secondary">0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-900 rounded"></div>
            <span className="text-gama-text-secondary">Pouco</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-700 rounded"></div>
            <span className="text-gama-text-secondary">Médio</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gama-primary/50 rounded"></div>
            <span className="text-gama-text-secondary">Bastante</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gama-primary rounded"></div>
            <span className="text-gama-text-secondary">Muito</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 px-4 pb-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
              <div key={day} className="text-center text-xs text-gama-text-secondary font-bold">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square"></div>
              }

              const dayKey = getDayKey(day)
              const count = byDate[dayKey]?.length || 0
              const isSelected = selectedDay === dayKey

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(dayKey)}
                  className={`aspect-square rounded flex flex-col items-center justify-center text-sm font-bold transition-all cursor-pointer border-2 ${
                    isSelected ? 'border-gama-primary' : 'border-transparent'
                  } ${getIntensity(count)} hover:border-gama-primary`}
                  title={`${day} - ${count} conversas`}
                >
                  <span className="text-gama-text">{day}</span>
                  {count > 0 && <span className="text-xs text-gama-text-secondary">{count}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Sessions */}
      {selectedDay && (
        <div className="w-80 bg-gama-surface border-l border-gama-surface-accent p-4 overflow-y-auto">
          <h4 className="font-bold text-gama-primary mb-4">
            📅 {new Date(selectedDay).toLocaleDateString('pt-BR')}
          </h4>
          <div className="space-y-3">
            {selectedSessions.length === 0 ? (
              <p className="text-gama-text-secondary text-sm">Nenhuma conversa neste dia</p>
            ) : (
              selectedSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className="w-full text-left p-3 bg-gama-surface-accent rounded border border-white/10 hover:border-gama-primary/50 hover:bg-gama-surface-accent/80 transition-all"
                >
                  <time className="text-xs text-gama-text-secondary">
                    {session.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  {session.agent && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-gama-primary/20 text-gama-primary rounded">
                      {session.agent}
                    </span>
                  )}
                  <p className="text-xs text-gama-text mt-2 line-clamp-2">{session.preview}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  )
}
