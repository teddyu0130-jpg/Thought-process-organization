import { useCallback, useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import { useThemeStore } from '@/hooks/useThemeStore'
import DecisionNodeComponent, { type DecisionFlowNode } from './DecisionNode'
import NodeDetailPanel from '@/components/node/NodeDetailPanel'
import AIAssistPanel from '@/components/ai/AIAssistPanel'

const NODE_TYPES = { decisionNode: DecisionNodeComponent }

export default function MindMapCanvas() {
  const { themeId } = useParams<{ themeId: string }>()
  const navigate = useNavigate()
  const { themes, selectTheme, addNode, deleteNode, updateNodePosition, storageWarning } = useThemeStore()

  const theme = themes.find((t) => t.id === themeId)

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showAI, setShowAI] = useState(false)

  useEffect(() => {
    if (themeId) selectTheme(themeId)
  }, [themeId, selectTheme])

  const rfNodes = useMemo((): DecisionFlowNode[] => {
    if (!theme) return []
    return theme.nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onAddChild: (nid: string) => addNode(nid),
        onDelete: (nid: string) => deleteNode(nid),
        onSelect: (nid: string) => setSelectedNodeId(nid),
        selected: n.id === selectedNodeId,
      },
    }))
  }, [theme, selectedNodeId, addNode, deleteNode])

  const rfEdges = useMemo((): Edge[] => {
    if (!theme) return []
    return theme.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      style: { stroke: 'var(--color-node-edge)', strokeWidth: 1.5 },
    }))
  }, [theme])

  const [nodes, setNodes, onNodesChange] = useNodesState<DecisionFlowNode>(rfNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges)

  useEffect(() => { setNodes(rfNodes) }, [rfNodes, setNodes])
  useEffect(() => { setEdges(rfEdges) }, [rfEdges, setEdges])

  const handleNodesChange = useCallback(
    (changes: NodeChange<DecisionFlowNode>[]) => {
      onNodesChange(changes)
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          updateNodePosition(change.id, change.position)
        }
      })
    },
    [onNodesChange, updateNodePosition]
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => { onEdgesChange(changes) },
    [onEdgesChange]
  )

  if (!theme) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--color-muted)' }}>テーマが見つかりません。</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg)' }}>
      {storageWarning && (
        <div className="storage-warning">
          ストレージ容量が不足しています。
        </div>
      )}

      {/* Header */}
      <header style={{
        height: 64,
        background: 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ fontSize: 13, color: 'var(--color-primary)' }}>
            ← テーマ一覧に戻る
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-dark)' }}>
            {theme.title}
          </span>
        </div>
        <button
          onClick={() => setShowAI((v) => !v)}
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
            borderRadius: 'var(--radius-full)',
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          AI思考整理
        </button>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            style={{ background: 'var(--color-canvas-bg)' }}
            onPaneClick={() => setSelectedNodeId(null)}
          >
            <Background color="var(--color-node-edge)" gap={24} size={1} />
            <Controls />
            <MiniMap nodeColor={() => 'var(--color-node-edge)'} />
          </ReactFlow>

          {showAI && (
            <div style={{ position: 'absolute', bottom: 24, left: 24, width: 320, zIndex: 10 }}>
              <AIAssistPanel
                parentNodeId={selectedNodeId ?? theme.nodes[0]?.id ?? ''}
                onClose={() => setShowAI(false)}
              />
            </div>
          )}
        </div>

        <aside style={{
          width: 360,
          background: 'var(--color-white)',
          borderLeft: '1px solid var(--color-border)',
          overflow: 'auto',
          flexShrink: 0,
        }}>
          <NodeDetailPanel selectedNodeId={selectedNodeId} />
        </aside>
      </div>
    </div>
  )
}
