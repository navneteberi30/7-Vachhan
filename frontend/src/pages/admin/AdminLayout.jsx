import { NavLink, Outlet, Link } from 'react-router-dom'

const NAV = [
  { to: '/admin', end: true, label: 'Overview', icon: 'dashboard' },
  { to: '/admin/gallery', label: 'Photos', icon: 'photo_library' },
  { to: '/admin/guests', label: 'Guests & codes', icon: 'vpn_key' },
  { to: '/admin/rsvp', label: 'RSVP', icon: 'how_to_reg' },
  { to: '/admin/rooms', label: 'Rooms', icon: 'hotel' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <aside className="border-b border-outline-variant/15 bg-surface-container-lowest md:border-b-0 md:border-r md:w-56 md:min-h-screen md:sticky md:top-0 md:self-start shrink-0">
        <div className="p-4 md:p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-4 hover:underline"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to app
          </Link>
          <p className="font-headline text-lg text-on-surface mb-1">Admin</p>
          <p className="text-xs text-on-surface-variant mb-4">Moderation & logistics</p>
          <nav className="hidden md:flex flex-col gap-1">
            {NAV.map(({ to, end, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        {/* Horizontal scroll nav — mobile */}
        <div className="flex md:hidden overflow-x-auto gap-2 px-4 pb-3 no-scrollbar">
          {NAV.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold shrink-0 ${
                  isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-24">
        <Outlet />
      </main>
    </div>
  )
}
