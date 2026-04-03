'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendData {
  week: string
  count: number
  avgWords: number
}

interface TrendsChartProps {
  data: TrendData[]
}

export function TrendsChart({ data }: TrendsChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gama-surface rounded-lg p-6 border border-white/10 h-80 flex items-center justify-center text-gama-text-secondary">
        Sem dados para visualizar tendências
      </div>
    )
  }

  return (
    <div className="bg-gama-surface rounded-lg p-6 border border-white/10">
      <h3 className="text-lg font-bold text-gama-primary mb-4">📈 Tendências — Sessões por Semana</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="week"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
            interval={Math.max(0, Math.floor(data.length / 5))}
          />
          <YAxis stroke="rgba(255,255,255,0.4)" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#272727',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            formatter={(value) => [value, 'Sessões']}
            labelFormatter={(label) => `Semana: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#88CE11"
            strokeWidth={2}
            dot={{ fill: '#88CE11', r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Weekly stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gama-surface-accent rounded p-3 text-center">
          <div className="text-gama-text-secondary text-xs mb-1">Média/Semana</div>
          <div className="text-2xl font-bold text-gama-primary">
            {Math.round(data.reduce((sum, w) => sum + w.count, 0) / data.length)}
          </div>
        </div>
        <div className="bg-gama-surface-accent rounded p-3 text-center">
          <div className="text-gama-text-secondary text-xs mb-1">Pico</div>
          <div className="text-2xl font-bold text-gama-primary">{Math.max(...data.map((w) => w.count))}</div>
        </div>
        <div className="bg-gama-surface-accent rounded p-3 text-center">
          <div className="text-gama-text-secondary text-xs mb-1">Semanas Ativas</div>
          <div className="text-2xl font-bold text-gama-primary">{data.length}</div>
        </div>
      </div>
    </div>
  )
}
