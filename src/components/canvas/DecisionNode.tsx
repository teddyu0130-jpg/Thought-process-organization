import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Plus, Trash2, Target } from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import type { DecisionNodeData } from '@/types'

export type DecisionFlowNode = Node<
  DecisionNodeData & {
    onAddChild: (nodeId: string) => void
    onDelete: (nodeId: string) => void
    onSelect: (nodeId: string) => void
    selected: boolean
  },
  'decisionNode'
>

type Props = NodeProps<DecisionFlowNode>

export default memo(function DecisionNodeComponent({ id, data }: Props) {
  const { label, reason, status, isRoot, onAddChild, onDelete, onSelect, selected } = data

  if (isRoot) {
    return (
      <>
        <div
          onClick={() => onSelect(id)}
          style={{
            background: 'var(--color-black)',
            color: 'var(--color-white)',
            borderRadius: 'var(--radius-full)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: 220,
            cursor: 'pointer',
            outline: selected ? '2px solid var(--color-primary)' : 'none',
            outlineOffset: 2,
          }}
        >
          <Target size={18} color="white" strokeWidth={2} />
          <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{label}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(id) }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            title="子ノードを追加"
          >
            <Plus size={13} color="white" />
          </button>
        </div>
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      </>
    )
  }

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        onClick={() => onSelect(id)}
        style={{
          background: 'var(--color-white)',
          border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: 200,
          cursor: 'pointer',
          boxShadow: selected ? '0 0 0 3px rgba(0,97,255,0.12)' : 'none',
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: 'var(--color-dark)' }}>
            {label}
          </span>
          <StatusBadge status={status} small />
        </div>
        {/* Reason preview */}
        {reason && (
          <span style={{
            fontSize: 11,
            color: 'var(--color-muted)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {reason}
          </span>
        )}
        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 2 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(id) }}
            style={{ padding: 3, borderRadius: 4, color: 'var(--color-muted)' }}
            title="子ノードを追加"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id) }}
            style={{ padding: 3, borderRadius: 4, color: 'var(--color-muted)' }}
            title="ノードを削除"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  )
})
