import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { getGuestByUserId, claimInviteCode, signInWithGoogle, signOut } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)  // Supabase Auth user (Google identity)
  const [guest, setGuest]       = useState(null)  // Row from our guests table
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let active = true
    let guestRequestId = 0

    function applySession(session) {
      const user = session?.user ?? null
      const requestId = ++guestRequestId

      setAuthUser(user)
      setGuest(null)
      setLoading(false)

      if (!user) return

      // Supabase can deadlock if another Supabase call is awaited directly
      // inside onAuthStateChange, so defer the guest lookup out of the callback.
      setTimeout(async () => {
        try {
          const g = await getGuestByUserId(user.id)
          if (active && requestId === guestRequestId) setGuest(g)
        } catch (err) {
          console.warn('Guest lookup error:', err.message)
          if (active && requestId === guestRequestId) setGuest(null)
        }
      }, 0)
    }

    // Restore session on mount and keep in sync with Supabase Auth changes.
    // INITIAL_SESSION handles browser refreshes and OAuth redirects.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => applySession(session)
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!loading) return undefined

    // Safety net: if INITIAL_SESSION is delayed or missed, do not leave the
    // protected routes in a permanent loading state.
    const timer = setTimeout(() => {
      console.warn('Auth initialization timed out.')
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [loading])

  /**
   * Link the signed-in Google account to an invite code.
   * Called from the login page after Google OAuth completes.
   */
  async function linkCode(inviteCode) {
    if (!authUser) throw new Error('You must sign in with Google first.')
    const updated = await claimInviteCode(inviteCode)
    setGuest(updated)
    return updated
  }

  async function logout() {
    // Clear state immediately so the login page doesn't bounce back to home
    setAuthUser(null)
    setGuest(null)
    await signOut()
  }

  return (
    <AuthContext.Provider value={{
      authUser,           // Google/Supabase auth identity
      guest,              // Linked guest record (null if code not yet linked)
      loading,
      signInWithGoogle,   // () => void — triggers Google OAuth redirect
      linkCode,           // (code) => Promise — links invite code to Google account
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
