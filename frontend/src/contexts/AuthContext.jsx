import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { getGuestByUserId, claimInviteCode, signInWithGoogle, signOut } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)  // Supabase Auth user (Google identity)
  const [guest, setGuest]       = useState(null)  // Row from our guests table
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Restore session on mount (handles the redirect back from Google OAuth)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user)
        const g = await getGuestByUserId(session.user.id)
        setGuest(g)
      }
      setLoading(false)
    })

    // Keep in sync with Supabase Auth state changes:
    // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthUser(session.user)
          const g = await getGuestByUserId(session.user.id)
          setGuest(g)
        } else {
          setAuthUser(null)
          setGuest(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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
