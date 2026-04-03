'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ChartData {
  name: string
  count: number
  pct: number
}

interface AgentProjectChartsProps {
  agents: ChartData[]
  projects: ChartData[]
}

export function AgentProjectCharts({ agents, projects }: AgentProjectChartsProps) {
  const colors = ['#88CE11', '#10B981', '#3B82F6', '#F59E0B', '#E11D48']

  const getColor = (index: number) => colors[index % colors.length]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agents */}
      <div className="bg-gama-surface rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-bold text-gama-primary mb-4">🤖 Top Agentes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={agents}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.4)" />
            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#272727',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'rgba(136, 206, 17, 0.1)' }}
            />
            <Bar dataKey="count" fill="#88CE11" radius={[0, 8, 8, 0]}>
              {agents.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={getColor(idx)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-1 text-xs">
          {agents.map((agent) => (
            <div key={agent.name} className="flex justify-between text-gama-text-secondary">
              <span>{agent.name}</span>
              <span className="text-gama-primary font-semibold">{agent.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-gama-surface rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-bold text-gama-primary mb-4">📁 Top Projetos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={projects}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.4)" />
            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#272727',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'rgba(136, 206, 17, 0.1)' }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[0, 8, 8, 0]}>
              {projects.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={getColor(idx)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-1 text-xs">
          {projects.map((project) => (
            <div key={project.name} className="flex justify-between text-gama-text-secondary">
              <span>{project.name}</span>
              <span className="text-gama-primary font-semibold">{project.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
