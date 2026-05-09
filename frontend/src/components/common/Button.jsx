export default function Button({ children, variant = 'primary', disabled, onClick, type = 'button', style }) {
  const base = { padding: '0.5rem 1.25rem', border: 'none', borderRadius: 6, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }
  const variants = {
    primary: { background: '#7c3aed', color: '#fff' },
    secondary: { background: '#f3f4f6', color: '#374151' },
    danger: { background: '#dc2626', color: '#fff' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}
