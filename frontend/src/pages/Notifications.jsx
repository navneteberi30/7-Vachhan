import { useNotifications } from '../hooks/useNotifications'

export default function Notifications() {
  const { permission, requestPermission, notify } = useNotifications()

  async function handleEnable() {
    const result = await requestPermission()
    if (result === 'granted') {
      notify('Notifications enabled', { body: 'You will now receive wedding app updates.' })
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: '1rem' }}>Notifications</h2>
      <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Browser Push Notifications</p>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Current permission: <strong>{permission}</strong>
        </p>
        {permission !== 'granted' && (
          <button onClick={handleEnable} style={{ padding: '0.5rem 1.25rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Enable Notifications
          </button>
        )}
        {permission === 'granted' && <p style={{ color: '#059669', fontWeight: 500 }}>Notifications are enabled.</p>}
        {permission === 'denied' && <p style={{ color: '#dc2626' }}>Notifications are blocked. Update your browser settings to enable them.</p>}
      </div>
      <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb' }}>
        <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Bulk Notifications (Python)</p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          To send push notifications to all guests, run:<br />
          <code style={{ display: 'block', marginTop: '0.5rem', background: '#e5e7eb', padding: '0.4rem 0.6rem', borderRadius: 4 }}>
            python backend/notifications/push_notifications.py
          </code>
        </p>
      </div>
    </div>
  )
}
