import { useState, useEffect } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'
import StatusBadge from '@/components/common/StatusBadge'
import type { NodeStatus, DecisionNodeData } from '@/types'

interface Props {
  selectedNodeId: string | null
}

const STATUS_OPTIONS: NodeStatus[] = ['selected', 'considering', 'rejected']

export default function NodeDetailPanel({ selectedNodeId }: Props) {
  const { currentTheme, updateNode } = useThemeStore()
  const theme = currentTheme()
  const node = theme?.nodes.find((n) => n.id === selectedNodeId)

  const [form, setForm] = useState<DecisionNodeData>({
    label: '',
    reason: '',
    rejectionReason: '',
    relatedInfo: '',
    status: 'considering',
    isRoot: false,
  })
  const [labelError, setLabelError] = useState(false)

  useEffect(() => {
    if (node) {
      setForm({ ...node.data })
      setLabelError(false)
    }
  }, [node])

  function handleSave() {
    if (!form.label.trim()) {
      setLabelError(true)
      return
    }
    if (!selectedNodeId) return
    updateNode(selectedNodeId, form)
  }

  if (!selectedNodeId || !node) {
    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-dark)' }}>ノード詳細</span>
        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>ノードを選択してください</span>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-dark)' }}>ノード詳細</span>
        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>選択中のノードのメタデータを編集</span>
      </div>

      {/* Label */}
      <Field label="ラベル" required error={labelError ? 'ラベルは必須です' : undefined}>
        <input
          value={form.label}
          onChange={(e) => { setForm((f) => ({ ...f, label: e.target.value })); setLabelError(false) }}
          placeholder="例）ライン1の現状"
          style={inputStyle(labelError)}
        />
      </Field>

      {/* Reason */}
      <Field label="判断理由">
        <textarea
          value={form.reason ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          placeholder="なぜこの選択に至ったかを記録"
          rows={3}
          style={textareaStyle}
        />
      </Field>

      {/* Rejection reason */}
      <Field label="却下理由">
        <textarea
          value={form.rejectionReason ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, rejectionReason: e.target.value }))}
          placeholder="却下した場合の理由を記録"
          rows={3}
          style={textareaStyle}
        />
      </Field>

      {/* Related info */}
      <Field label="関連情報">
        <textarea
          value={form.relatedInfo ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, relatedInfo: e.target.value }))}
          placeholder="関連資料・リンクなど"
          rows={3}
          style={textareaStyle}
        />
      </Field>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-label)' }}>ステータス</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {STATUS_OPTIONS.map((s) => (
            <StatusBadge
              key={s}
              status={s}
              onClick={() => setForm((f) => ({ ...f, status: s }))}
              small={form.status !== s}
            />
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!form.label.trim()}
        style={{
          background: form.label.trim() ? 'var(--color-primary)' : 'var(--color-border)',
          color: 'var(--color-white)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 500,
          marginTop: 4,
        }}
      >
        保存
      </button>
    </div>
  )
}

function Field({
  label, required, error, children
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-label)' }}>
        {label}{required && <span style={{ color: '#B3261E' }}> *</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: '#B3261E' }}>{error}</span>}
    </div>
  )
}

function inputStyle(error?: boolean): React.CSSProperties {
  return {
    border: `1px solid ${error ? '#B3261E' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    fontSize: 12,
    height: 40,
    outline: 'none',
    width: '100%',
  }
}

const textareaStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 12px',
  fontSize: 13,
  outline: 'none',
  resize: 'vertical',
  width: '100%',
  fontFamily: 'var(--font-sans)',
  lineHeight: 1.5,
}
