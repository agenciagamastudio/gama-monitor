export interface Project {
  id: string
  name: string
  path: string
  port: number
  status: 'online' | 'offline'
  // Multi-process support
  frontendPath?: string // ex: "GAMA_JARVIS/ui"
  frontendPort?: number // ex: 3014
  lastChecked?: number
  // Metrics
  lastOnlineAt?: number // timestamp quando ficou online
  restartCount?: number // quantas vezes ficou online após ter ficado offline nesta sessão
  totalRestarts?: number // total histórico de restarts
  // Notes
  notes?: string // observações sobre o projeto
}

export type DesignSystem = 'gama' | 'gama-dark' | 'gama-client'
