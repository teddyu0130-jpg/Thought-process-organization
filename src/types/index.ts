export type NodeStatus = 'selected' | 'considering' | 'rejected'

export interface Position {
  x: number
  y: number
}

export interface DecisionNodeData extends Record<string, unknown> {
  label: string
  reason?: string
  rejectionReason?: string
  relatedInfo?: string
  status: NodeStatus
  isRoot: boolean
}

export interface DecisionNode {
  id: string
  type: 'decisionNode'
  position: Position
  data: DecisionNodeData
}

export interface FlowEdge {
  id: string
  source: string
  target: string
}

export interface Theme {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  nodes: DecisionNode[]
  edges: FlowEdge[]
}

export interface NodeSuggestion {
  label: string
  reason?: string
  status: NodeStatus
}

export interface StorageUsage {
  used: number
  limit: number
  ratio: number
}

export interface ThemeRepository {
  loadThemes(): Theme[]
  saveThemes(themes: Theme[]): void
  getStorageUsage(): StorageUsage
}
