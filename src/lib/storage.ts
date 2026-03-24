import { Project } from '@/types/project'

const PROJECTS_KEY = 'gama-monitor-projects'
const SELECTED_PROJECT_KEY = 'gama-monitor-selected'
const DESIGN_SYSTEM_KEY = 'gama-monitor-ds'

export const defaultProjects: Project[] = [
  { id: '1', name: 'DESIGN SYSTEM', path: 'GAMA_DESIGN_SYSTEM/gama-ds-platform', port: 3000, status: 'offline' },
  { id: '2', name: 'JARVIS', path: 'GAMA_JARVIS', port: 3014, status: 'offline' },
  { id: '3', name: 'NORT', path: 'GAMA_NORT', port: 3016, status: 'offline' },
  { id: '4', name: 'FINANCEIRO', path: 'GAMA_FINANCEIRO/gama-financeiro-prime', port: 3012, status: 'offline' },
  { id: '5', name: 'CALCULADORA', path: 'GAMA_CALCULADORA/gama-calculadora-app', port: 3010, status: 'offline' },
  { id: '6', name: 'EXTENSAO', path: 'GAMA_EXTENSAO', port: 3011, status: 'offline' },
  { id: '7', name: 'VOZ', path: 'GAMA_VOZ', port: 3017, status: 'offline' },
]

export const storage = {
  getProjects: (): Project[] => {
    if (typeof window === 'undefined') return defaultProjects
    const stored = localStorage.getItem(PROJECTS_KEY)
    return stored ? JSON.parse(stored) : defaultProjects
  },

  saveProjects: (projects: Project[]): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  },

  getSelectedProject: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(SELECTED_PROJECT_KEY)
  },

  setSelectedProject: (projectId: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(SELECTED_PROJECT_KEY, projectId)
  },

  getDesignSystem: (): string => {
    if (typeof window === 'undefined') return 'gama'
    return localStorage.getItem(DESIGN_SYSTEM_KEY) || 'gama'
  },

  setDesignSystem: (ds: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(DESIGN_SYSTEM_KEY, ds)
  },

  getOccupiedPorts: (): number[] => {
    const projects = storage.getProjects()
    return projects.map((p) => p.port).sort((a, b) => a - b)
  },

  getNextAvailablePort: (): number => {
    const occupiedPorts = storage.getOccupiedPorts()
    const basePort = 3000
    const maxPort = 65535

    // Find first available port starting from basePort
    for (let port = basePort; port <= maxPort; port++) {
      if (!occupiedPorts.includes(port)) {
        return port
      }
    }

    return basePort
  },
}
