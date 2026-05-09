import { useState } from 'react'
import { requestPushPermission, showNotification } from '../services/notifications'

export function useNotifications() {
  const [permission, setPermission] = useState(Notification?.permission ?? 'default')

  async function requestPermission() {
    const result = await requestPushPermission()
    setPermission(result)
    return result
  }

  function notify(title, options) {
    showNotification(title, options)
  }

  return { permission, requestPermission, notify }
}
