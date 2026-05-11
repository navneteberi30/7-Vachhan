import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { WEDDING } from '../config/wedding'

const NAV = [
  { to: '/',        icon: 'home',           label: 'Home'   },
  { to: '/events',  icon: 'calendar_month', label: 'Events' },
  { to: '/gallery', icon: 'photo_library',  label: 'Gallery'},
  { to: '/rsvp',    icon: 'how_to_reg',     label: 'RSVP'   },
]

function ProfileSheet({ guest, authUser, onClose, onLogout }) {
  const avatar       = authUser?.user_metadata?.avatar_url
  const googleName   = authUser?.user_metadata?.full_name
  const displayName  = guest?.name || googleName || 'Guest'
  const initialsFrom = guest?.name || googleName || ''
  const initials = initialsFrom
    ? initialsFrom.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet — sits above bottom nav (bottom-24 = nav height + gap) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl shadow-2xl p-6 pb-28 max-w-lg mx-auto overflow-y-auto max-h-[85vh]">
        {/* Handle */}
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-6" />

        {/* Profile */}
        <div className="flex items-center gap-4 mb-6">
          {avatar ? (
            <img src={avatar} alt="" className="w-16 h-16 rounded-full border-2 border-primary/20" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xl">
              {initials}
            </div>
          )}
          <div>
            <p className="font-headline text-xl text-on-surface">{displayName}</p>
            <p className="text-sm text-on-surface-variant">{authUser?.email}</p>
            {guest?.invite_code && (
              <p className="font-mono text-xs text-outline mt-1 tracking-widest">{guest.invite_code}</p>
            )}
          </div>
        </div>

        <div className="h-px bg-outline-variant/20 mb-6" />

        {/* Actions */}
        <div className="space-y-3">
          <NavLink
            to="/rsvp"
            onClick={onClose}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined text-tertiary">how_to_reg</span>
            <span className="font-body text-sm font-medium">
              {guest ? 'My RSVP' : 'RSVP — enter invite code'}
            </span>
          </NavLink>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-error/5 transition-colors text-error"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body text-sm font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default function AppLayout() {
  const { guest, authUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)

  async function handleLogout() {
    setShowProfile(false)
    await logout()
    navigate('/login')
  }

  const avatar       = authUser?.user_metadata?.avatar_url
  const initialsFrom = guest?.name || authUser?.user_metadata?.full_name || ''
  const initials = initialsFrom
    ? initialsFrom.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="bg-background min-h-screen text-on-surface">
      {/* Fixed glassmorphism top bar */}
      <header className="fixed top-0 w-full z-40 bg-[#fefcf4]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <span className="material-symbols-outlined text-primary cursor-pointer">menu</span>
          <h1 className="text-2xl font-headline italic tracking-wide text-primary">
            {WEDDING.headerTitle}
          </h1>
          <div className="flex items-center gap-2">
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary hover:bg-primary/10'
                }`
              }
              title="Admin"
              aria-label="Admin dashboard"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </NavLink>
          )}
          <button
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden text-on-secondary-container font-bold text-sm hover:opacity-80 transition-opacity"
            title="Profile"
          >
            {avatar
              ? <img src={avatar} alt="" className="w-full h-full object-cover" />
              : initials
            }
          </button>
          </div>
        </div>
      </header>

      {/* Profile sheet */}
      {showProfile && (
        <ProfileSheet
          guest={guest}
          authUser={authUser}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}


      {/* Page content */}
      <main className="pt-16 pb-28">
        <Outlet />
      </main>

      {/* Floating island bottom nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#fefcf4]/80 backdrop-blur-xl rounded-full border border-[#bab9b2]/15 shadow-[0_8px_32px_0_rgba(56,56,51,0.1)] z-50">
        <div className="flex justify-around items-center h-16 px-4">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-bold scale-110'
                    : 'text-on-surface/50 hover:text-primary'
                }`
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-sans text-[10px] uppercase tracking-widest font-medium mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
