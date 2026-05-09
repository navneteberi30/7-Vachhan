import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { WEDDING } from '../config/wedding'

// ── Decorative background images (reused from original login) ─────────────────
const BG_IMG    = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9V1gwBJo6-kU0RLwC6I9GL10UngWF9PnJ2F9Qon2ZWg17mMx4lGy4qqZn0q-t1Ckfl1_1dnf4tjMBwqIze0UPIqrwLRNHdZ9jBws0iBm6zq2CjG0tMkiCdiL9Vk3J8bgD-RNRTZ-a9-cIgiZ1W_6omwDTpH-lTAF2Lr1qrTVDoFWKz4XuZYGd79Qp0qboodH5tIS90hEsx3twGI5iTd560pMxA6Cuz2Ig2ZCGmYumX5kpZ7ykm9J84pJuULrXU9JsGLKD2GCv58s'
const MANDALA_L = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKxx7B0Fft-Qu3iFBE1UyqHc-pFuw7LOcnXJN8CjCSldgsSix27646DSwVV6SJv8bhli_NL9bD9bYipuTKLxAghxUUI5s51zSuV-bBk_lS9ETeaE3pGDUV9dIshS4F2L4zUewLca-yZ1_ga6US_MJG5vMk72uC1uBOxbgzOwfBnf6lpIqWX-2Z-oXbibL33LeRpxkoG68RbK_SygYPQ-dNC7kob_iofypROtqVNOKQ9HSMrdXSA437rDBUQRo7PngJ1oOCzQvTH2c'
const MANDALA_R = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCliyWEJvG07bgd7yo0dTj7ggJFXmu4adk9XTus1foyUFnj-o9u7v4oY3XgZY2JvtOHEdKUBN10Y2pM3Y0atb5Ms0RuUkFLoiRhnJIHgX0kaXMnH4mJt549liDi0StFPks5lMFLoxZQxwZtdKQOIYOg2CQ0MLFd_knL9tK4zzMLmcJmcJb99TFHreNKkWUqBkQgr820u9irGD64r0lkMFcMWZMxTk7T3d1W6mOflPuk2gKhQBBDAH0f5DCLN-AiEnHKPihaCUPC2J8'

export default function GuestLogin() {
  const { authUser, loading: authLoading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Once Google sign-in completes, send everyone into the app.
  // Invite-code entry now happens behind the RSVP screen, not here.
  useEffect(() => {
    if (!authLoading && authUser) navigate('/', { replace: true })
  }, [authUser, authLoading, navigate])

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      // Google OAuth causes a full page redirect — code below won't run
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover opacity-10" src={BG_IMG} alt="" />
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 opacity-[0.04] pointer-events-none">
        <img className="w-full h-full object-contain" src={MANDALA_L} alt="" />
      </div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 opacity-[0.04] rotate-180 pointer-events-none">
        <img className="w-full h-full object-contain" src={MANDALA_R} alt="" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6">
        {/* Branding */}
        <div className="flex flex-col items-center mb-12 text-center">
          <span className="font-headline italic text-primary text-3xl md:text-4xl mb-2 tracking-tight">
            {WEDDING.tagline}
          </span>
          <p className="font-label text-secondary uppercase tracking-[0.2em] text-[10px] font-semibold">
            {WEDDING.subTagline}
          </p>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-2xl shadow-[0_32px_64px_-12px_rgba(56,56,51,0.08)] border border-white/40">
          <div className="mb-8">
            <h1 className="font-headline text-2xl text-on-surface mb-2">Welcome, Guest</h1>
            <p className="text-on-surface-variant font-body text-sm">
              Sign in with Google to explore the celebration. You can RSVP with your invite code anytime from inside the app.
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-outline-variant/40 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-wait"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700">
                {loading ? 'Redirecting to Google…' : 'Continue with Google'}
              </span>
            </button>

            {error && (
              <p className="text-error text-sm font-medium text-center">{error}</p>
            )}
          </div>

          <p className="mt-8 text-center text-on-surface-variant font-body text-xs">
            Invited by {WEDDING.groomName} &amp; {WEDDING.brideName}? Bring your invite code with you — you'll be asked for it once when you RSVP.
          </p>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.3em] opacity-60">
            Crafted with love &amp; tradition
          </p>
        </footer>
      </main>
    </div>
  )
}
