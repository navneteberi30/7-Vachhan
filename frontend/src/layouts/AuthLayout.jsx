import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fdf6f0' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <Outlet />
      </div>
    </div>
  )
}
