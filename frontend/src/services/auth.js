import { supabase, isConfigured } from './supabase'

/**
 * Kick off Google OAuth sign-in.
 * Supabase redirects to Google, then back to the app with a session.
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',   // always show account picker — good for shared devices
      },
    },
  })
  if (error) throw new Error(error.message)
}

/**
 * Look up the guest record for the currently signed-in user.
 * Uses a SECURITY DEFINER RPC so it works regardless of RLS policies.
 * Calls getSession() first to ensure the JWT is attached to the client
 * before the RPC call — needed right after OAuth redirect.
 */
export async function getGuestByUserId(_userId) {
  if (!isConfigured) return null

  // Ensure the session JWT is fully attached to the client before calling RPC
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data, error } = await supabase.rpc('get_my_guest_record')
  if (error) {
    console.warn('get_my_guest_record error:', error.message)
    return null
  }
  return data
}

/**
 * Claim an invite code and link it to the currently signed-in Google account.
 * Calls a SECURITY DEFINER RPC function on Supabase so the user can't spoof
 * their identity — the function reads auth.uid() server-side.
 *
 * Returns the updated guest record, or throws with a user-friendly message.
 */
export async function claimInviteCode(inviteCode) {
  if (!isConfigured) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.rpc('claim_invite_code', {
    p_invite_code: inviteCode.trim().toUpperCase(),
  })

  if (error) throw new Error(error.message)

  // The RPC returns JSON — check for application-level errors
  if (data?.error) throw new Error(data.error)

  return data
}

/**
 * Sign out of both Supabase Auth and the local session.
 */
export async function signOut() {
  await supabase.auth.signOut()
}
