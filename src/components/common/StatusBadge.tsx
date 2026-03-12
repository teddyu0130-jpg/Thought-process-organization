import type { NodeStatus } from '@/types'

const LABELS: Record<NodeStatus, string> = {
  selected: '選定済み',
  considering: '検討中',
  rejected: '却下',
}

interface Props {
  status: NodeStatus
  small?: boolean
  onClick?: () => void
}

export default function StatusBadge({ status, small, onClick }: Props) {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: small ? '2px 8px' : '2px 12px',
        height: small ? 20 : 28,
        borderRadius: 999,
        fontSize: small ? 9 : 10,
        fontWeight: 500,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        background:
          status === 'selected'
            ? 'var(--status-selected-bg)'
            : status === 'considering'
            ? 'var(--status-considering-bg)'
            : 'var(--status-rejected-bg)',
        color:
          status === 'selected'
            ? 'var(--status-selected-fg)'
            : status === 'considering'
            ? 'var(--status-considering-fg)'
            : 'var(--status-rejected-fg)',
        border:
          status === 'selected'
            ? 'none'
            : status === 'considering'
            ? '1px solid var(--status-considering-border)'
            : '1px solid var(--status-rejected-border)',
      }}
    >
      {LABELS[status]}
    </span>
  )
}
