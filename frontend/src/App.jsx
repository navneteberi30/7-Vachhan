import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SlideInPage, FadePage } from './components/PageTransition'

import AppLayout    from './layouts/AppLayout'
import GuestLogin   from './pages/GuestLogin'
import Home         from './pages/Home'
import Events       from './pages/Events'
import EventDetail  from './pages/EventDetail'
import RSVPForm     from './pages/RSVPForm'
import Gallery      from './pages/Gallery'
import StayInfo     from './pages/StayInfo'

function RequireAuth() {
  const { authUser, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4 text-primary">
          <span className="material-symbols-outlined text-5xl animate-pulse">favorite</span>
          <p className="font-headline italic text-xl">Loading…</p>
        </div>
      </div>
    )
  }
  return authUser ? <Outlet /> : <Navigate to="/login" replace />
}

// AnimatePresence needs the location key to detect route changes
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public — login handles its own redirect when guest is set */}
        <Route path="/login" element={<FadePage><GuestLogin /></FadePage>} />

        {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index             element={<FadePage><Home /></FadePage>} />
            <Route path="events"     element={<FadePage><Events /></FadePage>} />
            <Route path="events/:slug" element={<SlideInPage><EventDetail /></SlideInPage>} />
            <Route path="rsvp"       element={<FadePage><RSVPForm /></FadePage>} />
            <Route path="gallery"    element={<FadePage><Gallery /></FadePage>} />
            <Route path="stay"       element={<FadePage><StayInfo /></FadePage>} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
