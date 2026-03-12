import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Sparkles, FileText } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import StatusBadge from '@/components/common/StatusBadge'
import type { Theme } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ThemeCard({ theme, onSelect, onDelete }: { theme: Theme; onSelect: () => void; onDelete: () => void }) {
  const nodeCount = theme.nodes.length
  const status = theme.nodes[0]?.data.status ?? 'considering'

  return (
    <div
      onClick={onSelect}
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-dark)' }}>{theme.title}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          style={{ color: 'var(--color-border)', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
          aria-label="テーマを削除"
        >
          ×
        </button>
      </div>
      {/* Meta */}
      <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
        最終更新 {formatDate(theme.updatedAt)}
      </span>
      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <StatusBadge status={status} small />
        <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{nodeCount} ノード</span>
      </div>
    </div>
  )
}

export default function ThemeListPage() {
  const navigate = useNavigate()
  const { themes, createTheme, deleteTheme, selectTheme, storageWarning } = useThemeStore()
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  function handleCreate() {
    if (!newTitle.trim()) return
    createTheme(newTitle.trim())
    setNewTitle('')
    setShowNewDialog(false)
  }

  function handleSelect(themeId: string) {
    selectTheme(themeId)
    navigate(`/canvas/${themeId}`)
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteTheme(deleteTarget)
      setDeleteTarget(null)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg)' }}>
      {storageWarning && (
        <div className="storage-warning">
          ストレージ容量が不足しています。不要なテーマを削除してください。
        </div>
      )}

      {/* Sidebar */}
      <aside style={{
        width: 320,
        background: 'var(--color-white)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: 24,
        flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 700, fontSize: 24, letterSpacing: -1 }}>
            DX 思考マップ
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>DX施策の検討過程を構造化</span>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* New theme button */}
        <div>
          <button
            onClick={() => setShowNewDialog(true)}
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-white)',
              borderRadius: 'var(--radius-full)',
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
              width: '100%',
            }}
          >
            + 新規テーマ
          </button>
        </div>

        {/* Theme card list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
          {themes.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-muted)', textAlign: 'center', marginTop: 24 }}>
              テーマがありません
            </p>
          )}
          {themes.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              onSelect={() => handleSelect(t.id)}
              onDelete={() => setDeleteTarget(t.id)}
            />
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 56,
        padding: '72px 80px',
        overflowY: 'auto',
      }}>
        {/* Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 40,
            fontWeight: 400,
            letterSpacing: -2,
            textAlign: 'center',
          }}>
            思考を構造化する
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--color-subtle)',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: 480,
          }}>
            DX施策の検討過程・意思決定の経緯を<br />
            マインドマップで可視化・共有する
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowNewDialog(true)}
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-white)',
                borderRadius: 'var(--radius-full)',
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              + 新規テーマを作成
            </button>
            {themes.length > 0 && (
              <button
                onClick={() => handleSelect(themes[0].id)}
                style={{
                  background: 'var(--color-white)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                続きを見る
              </button>
            )}
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'flex', gap: 24, width: '100%', maxWidth: 900 }}>
          {[
            { icon: <Brain size={24} />, title: '思考の構造化', desc: 'マインドマップで施策検討をツリー構造で可視化' },
            { icon: <Sparkles size={24} />, title: 'AI思考整理', desc: 'Claudeが散文メモを構造化ノードに変換・提案' },
            { icon: <FileText size={24} />, title: '意思決定記録', desc: '各ノードに判断理由・却下理由を記録し追跡可能' },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                flex: 1,
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {f.icon}
              <span style={{ fontSize: 14, fontWeight: 600 }}>{f.title}</span>
              <span style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5 }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </main>

      {/* New theme dialog */}
      {showNewDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--color-white)', borderRadius: 'var(--radius-md)',
            padding: 24, width: 360, display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>新規テーマを作成</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-label)' }}>テーマ名</label>
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="例）トレーサビリティ導入"
                style={{
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px', fontSize: 12, height: 40, outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowNewDialog(false); setNewTitle('') }}
                style={{
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)',
                  padding: '8px 16px', fontSize: 13, color: 'var(--color-muted)',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                style={{
                  background: newTitle.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                  color: 'var(--color-white)', borderRadius: 'var(--radius-full)',
                  padding: '8px 16px', fontSize: 13, fontWeight: 500,
                }}
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--color-white)', borderRadius: 'var(--radius-md)',
            padding: 24, width: 340, display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>テーマを削除しますか？</h2>
            <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              このテーマと全ノードが削除されます。この操作は取り消せません。
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)',
                  padding: '8px 16px', fontSize: 13, color: 'var(--color-muted)',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  background: '#B3261E', color: 'var(--color-white)',
                  borderRadius: 'var(--radius-full)', padding: '8px 16px', fontSize: 13, fontWeight: 500,
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
