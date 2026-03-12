import { create } from 'zustand'
import { storageAdapter } from '@/lib/storage'
import type { Theme, DecisionNode, FlowEdge, NodeSuggestion, NodeStatus } from '@/types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

interface ThemeStoreState {
  themes: Theme[]
  currentThemeId: string | null
  storageWarning: boolean
  // Actions
  createTheme: (title: string) => void
  deleteTheme: (themeId: string) => void
  selectTheme: (themeId: string) => void
  addNode: (parentId: string, label?: string) => void
  updateNode: (nodeId: string, data: Partial<DecisionNode['data']>) => void
  deleteNode: (nodeId: string) => void
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void
  addNodes: (suggestions: NodeSuggestion[], parentId: string) => void
  currentTheme: () => Theme | null
}

function getDescendantIds(nodes: DecisionNode[], edges: FlowEdge[], nodeId: string): string[] {
  const children = edges.filter((e) => e.source === nodeId).map((e) => e.target)
  return children.flatMap((cid) => [cid, ...getDescendantIds(nodes, edges, cid)])
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  themes: storageAdapter.loadThemes(),
  currentThemeId: null,
  storageWarning: false,

  currentTheme: () => {
    const { themes, currentThemeId } = get()
    return themes.find((t) => t.id === currentThemeId) ?? null
  },

  createTheme: (title) => {
    const id = generateId()
    const rootNode: DecisionNode = {
      id,
      type: 'decisionNode',
      position: { x: 400, y: 300 },
      data: { label: title, status: 'considering', isRoot: true },
    }
    const theme: Theme = {
      id,
      title,
      createdAt: now(),
      updatedAt: now(),
      nodes: [rootNode],
      edges: [],
    }
    const themes = [...get().themes, theme]
    storageAdapter.saveThemes(themes)
    const usage = storageAdapter.getStorageUsage()
    set({ themes, storageWarning: usage.ratio >= 0.9 })
  },

  deleteTheme: (themeId) => {
    const themes = get().themes.filter((t) => t.id !== themeId)
    storageAdapter.saveThemes(themes)
    set({ themes, currentThemeId: get().currentThemeId === themeId ? null : get().currentThemeId })
  },

  selectTheme: (themeId) => {
    set({ currentThemeId: themeId })
  },

  addNode: (parentId, label = '新しいノード') => {
    const theme = get().currentTheme()
    if (!theme) return
    const parent = theme.nodes.find((n) => n.id === parentId)
    if (!parent) return

    const id = generateId()
    const newNode: DecisionNode = {
      id,
      type: 'decisionNode',
      position: {
        x: parent.position.x + (Math.random() * 160 - 80),
        y: parent.position.y + 140,
      },
      data: { label, status: 'considering', isRoot: false },
    }
    const newEdge: FlowEdge = { id: `e-${parentId}-${id}`, source: parentId, target: id }
    const updatedTheme: Theme = {
      ...theme,
      updatedAt: now(),
      nodes: [...theme.nodes, newNode],
      edges: [...theme.edges, newEdge],
    }
    const themes = get().themes.map((t) => (t.id === theme.id ? updatedTheme : t))
    storageAdapter.saveThemes(themes)
    const usage = storageAdapter.getStorageUsage()
    set({ themes, storageWarning: usage.ratio >= 0.9 })
  },

  updateNode: (nodeId, data) => {
    const theme = get().currentTheme()
    if (!theme) return
    const updatedTheme: Theme = {
      ...theme,
      updatedAt: now(),
      nodes: theme.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }
    const themes = get().themes.map((t) => (t.id === theme.id ? updatedTheme : t))
    storageAdapter.saveThemes(themes)
    set({ themes })
  },

  deleteNode: (nodeId) => {
    const theme = get().currentTheme()
    if (!theme) return
    const node = theme.nodes.find((n) => n.id === nodeId)
    if (!node || node.data.isRoot) return

    const descendants = getDescendantIds(theme.nodes, theme.edges, nodeId)
    const removeIds = new Set([nodeId, ...descendants])
    const updatedTheme: Theme = {
      ...theme,
      updatedAt: now(),
      nodes: theme.nodes.filter((n) => !removeIds.has(n.id)),
      edges: theme.edges.filter((e) => !removeIds.has(e.source) && !removeIds.has(e.target)),
    }
    const themes = get().themes.map((t) => (t.id === theme.id ? updatedTheme : t))
    storageAdapter.saveThemes(themes)
    set({ themes })
  },

  updateNodePosition: (nodeId, position) => {
    const theme = get().currentTheme()
    if (!theme) return
    const updatedTheme: Theme = {
      ...theme,
      updatedAt: now(),
      nodes: theme.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
    }
    const themes = get().themes.map((t) => (t.id === theme.id ? updatedTheme : t))
    storageAdapter.saveThemes(themes)
    set({ themes })
  },

  addNodes: (suggestions, parentId) => {
    const theme = get().currentTheme()
    if (!theme) return
    const parent = theme.nodes.find((n) => n.id === parentId)
    if (!parent) return

    const newNodes: DecisionNode[] = suggestions.map((s, i) => ({
      id: generateId(),
      type: 'decisionNode',
      position: {
        x: parent.position.x + (i - (suggestions.length - 1) / 2) * 220,
        y: parent.position.y + 160,
      },
      data: { label: s.label, reason: s.reason, status: s.status, isRoot: false },
    }))
    const newEdges: FlowEdge[] = newNodes.map((n) => ({
      id: `e-${parentId}-${n.id}`,
      source: parentId,
      target: n.id,
    }))
    const updatedTheme: Theme = {
      ...theme,
      updatedAt: now(),
      nodes: [...theme.nodes, ...newNodes],
      edges: [...theme.edges, ...newEdges],
    }
    const themes = get().themes.map((t) => (t.id === theme.id ? updatedTheme : t))
    storageAdapter.saveThemes(themes)
    const usage = storageAdapter.getStorageUsage()
    set({ themes, storageWarning: usage.ratio >= 0.9 })
  },

}))

export type { NodeStatus }
