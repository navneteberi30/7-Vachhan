const COLORS = {
  green: { background: '#d1fae5', color: '#065f46' },
  red: { background: '#fee2e2', color: '#991b1b' },
  yellow: { background: '#fef3c7', color: '#92400e' },
  gray: { background: '#f3f4f6', color: '#374151' },
  purple: { background: '#ede9fe', color: '#5b21b6' },
}

export default function Badge({ label, color = 'gray' }) {
  return (
    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, ...COLORS[color] }}>
      {label}
    </span>
  )
}
