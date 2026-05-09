import { supabase } from './supabase'

/**
 * Subscribe to real-time changes on the guests table.
 * Returns an unsubscribe function.
 */
export function subscribeToGuestChanges(callback) {
  const channel = supabase
    .channel('guests-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, callback)
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Request browser push notification permission.
 * Returns the permission state: 'granted' | 'denied' | 'default'
 */
export async function requestPushPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.requestPermission()
}

/**
 * Show a local browser notification (requires permission to be granted).
 */
export function showNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    new Notification(title, options)
  }
}
