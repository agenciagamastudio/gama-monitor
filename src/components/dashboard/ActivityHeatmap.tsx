'use client'

interface HeatmapData {
  date: string
  count: number
  intensity: 0 | 1 | 2 | 3 | 4
}

interface ActivityHeatmapProps {
  data: HeatmapData[]
}

const intensityColors = {
  0: 'bg-gama-surface-accent',
  1: 'bg-green-900',
  2: 'bg-green-700',
  3: 'bg-gama-primary/60',
  4: 'bg-gama-primary',
}

const intensityTitles = {
  0: 'Sem dados',
  1: 'Pouco',
  2: 'Médio',
  3: 'Bastante',
  4: 'Muito',
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Get last 12 weeks of data
  const last12Weeks = data.slice(-84) // 12 weeks * 7 days

  // Group by week for grid display
  const weeks: HeatmapData[][] = []
  for (let i = 0; i < last12Weeks.length; i += 7) {
    weeks.push(last12Weeks.slice(i, i + 7))
  }

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

  return (
    <div className="bg-gama-surface rounded-lg p-6 border border-white/10">
      <h3 className="text-lg font-bold text-gama-primary mb-4">🔥 Atividade — 12 Semanas</h3>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs flex-wrap">
        <span className="text-gama-text-secondary">Intensidade:</span>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <div key={intensity} className="flex items-center gap-1">
            <div
              className={`w-4 h-4 rounded ${intensityColors[intensity as keyof typeof intensityColors]}`}
            ></div>
            <span className="text-gama-text-secondary text-xs">{intensityTitles[intensity as keyof typeof intensityTitles]}</span>
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Day labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            {weeks.map((_, weekIdx) => (
              <div key={weekIdx} className="w-8"></div>
            ))}
          </div>

          {/* Heatmap rows (7 days) */}
          {dayLabels.map((dayLabel, dayIdx) => (
            <div key={dayLabel} className="flex gap-1 mb-1">
              <div className="w-8 text-xs text-gama-text-secondary font-semibold flex items-center justify-center">
                {dayLabel.substring(0, 1)}
              </div>
              {weeks.map((week, weekIdx) => {
                const cell = week[dayIdx]
                const intensity = cell?.intensity || 0
                const colorClass = intensityColors[intensity as keyof typeof intensityColors]

                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`w-8 h-8 rounded border border-white/10 transition-all hover:border-gama-primary cursor-help ${colorClass}`}
                    title={cell ? `${cell.date}: ${cell.count} sessões (${intensityTitles[intensity]})` : 'Sem dados'}
                  ></div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gama-text-secondary text-xs mb-1">Total Últimas 12 Semanas</div>
          <div className="text-2xl font-bold text-gama-primary">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </div>
        </div>
        <div>
          <div className="text-gama-text-secondary text-xs mb-1">Dias Ativos</div>
          <div className="text-2xl font-bold text-gama-primary">{data.filter((d) => d.count > 0).length}</div>
        </div>
        <div>
          <div className="text-gama-text-secondary text-xs mb-1">Melhor Dia</div>
          <div className="text-2xl font-bold text-gama-primary">{Math.max(...data.map((d) => d.count), 0)}</div>
        </div>
      </div>
    </div>
  )
}
