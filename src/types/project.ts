export interface Project {
  id: string
  name: string
  path: string
  port: number
  status: 'online' | 'offline'
  lastChecked?: number
}

export type DesignSystem = 'gama' | 'gama-dark' | 'gama-client'
