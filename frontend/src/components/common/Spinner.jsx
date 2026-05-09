export default function Spinner({ size = 32, color = '#7c3aed' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid #e5e7eb`,
          borderTop: `3px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
