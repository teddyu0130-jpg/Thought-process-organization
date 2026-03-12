import { useState } from 'react'
import { X } from 'lucide-react'
import { useAI } from '@/hooks/useAI'
import { useThemeStore } from '@/hooks/useThemeStore'
import StatusBadge from '@/components/common/StatusBadge'
import type { NodeSuggestion } from '@/types'

interface Props {
  parentNodeId: string
  onClose: () => void
}

export default function AIAssistPanel({ parentNodeId, onClose }: Props) {
  const { structurize, isLoading, error } = useAI()
  const { addNodes } = useThemeStore()

  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState<NodeSuggestion[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())

  async function handleRun() {
    if (!text.trim()) return
    setSuggestions([])
    setSelected(new Set())
    const results = await structurize(text)
    setSuggestions(results)
    setSelected(new Set(results.map((_, i) => i)))
  }

  function toggleAll() {
    if (selected.size === suggestions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(suggestions.map((_, i) => i)))
    }
  }

  function handleAdd() {
    const chosen = suggestions.filter((_, i) => selected.has(i))
    if (chosen.length === 0) return
    addNodes(chosen, parentNodeId)
    setSuggestions([])
    setText('')
    setSelected(new Set())
  }

  return (
    <div style={{
      background: '#F5F5FA',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-dark)' }}>AI提案</span>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>散文メモからノード候補を生成します</span>
        </div>
        <button onClick={onClose} style={{ color: 'var(--color-muted)', padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      {/* Textarea */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-label)' }}>メモ</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="自由記述テキストを貼り付け"
          disabled={isLoading}
          rows={4}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            fontSize: 13,
            background: 'var(--color-white)',
            resize: 'vertical',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            opacity: isLoading ? 0.6 : 1,
          }}
        />
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={isLoading || !text.trim()}
        style={{
          background: isLoading || !text.trim() ? 'var(--color-border)' : 'var(--color-primary)',
          color: 'var(--color-white)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {isLoading ? (
          <>
            <span style={{
              width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: 'white', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', display: 'inline-block',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            整理中...
          </>
        ) : 'AI整理を実行'}
      </button>

      {/* Error */}
      {error && (
        <p style={{ fontSize: 12, color: '#B3261E', background: '#FFF0F0', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </p>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-label)' }}>
              提案 ({suggestions.length}件)
            </span>
            <button
              onClick={toggleAll}
              style={{ fontSize: 11, color: 'var(--color-primary)' }}
            >
              {selected.size === suggestions.length ? '全解除' : '全選択'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => setSelected((prev) => {
                  const next = new Set(prev)
                  next.has(i) ? next.delete(i) : next.add(i)
                  return next
                })}
                style={{
                  background: selected.has(i) ? 'var(--color-white)' : '#F0F0F0',
                  border: `1px solid ${selected.has(i) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-dark)' }}>{s.label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <StatusBadge status={s.status} small />
                    <span style={{ fontSize: 14, color: selected.has(i) ? 'var(--color-primary)' : 'var(--color-muted)' }}>
                      {selected.has(i) ? '✓' : '×'}
                    </span>
                  </div>
                </div>
                {s.reason && (
                  <span style={{ fontSize: 12, color: '#666' }}>{s.reason}</span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAdd}
            disabled={selected.size === 0}
            style={{
              background: selected.size > 0 ? 'var(--color-primary)' : 'var(--color-border)',
              color: 'var(--color-white)',
              borderRadius: 'var(--radius-full)',
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            選択した {selected.size} 件をキャンバスに追加
          </button>
        </>
      )}
    </div>
  )
}
