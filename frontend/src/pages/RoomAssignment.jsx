import { useRooms } from '../hooks/useRooms'

export default function RoomAssignment() {
  const { rooms, loading, error, unassign } = useRooms()

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Room Assignments</h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Room assignments are managed via the Python backend scripts. Use <code>backend/scripts/assign_rooms.py</code> to run the assignment logic and push results here.
      </p>
      {loading ? (
        <p>Loading rooms...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {rooms.map(room => (
            <div key={room.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Room {room.room_number}</p>
              <p style={{ margin: '0.25rem 0 0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>Capacity: {room.capacity}</p>
              {room.room_assignments?.length > 0 ? (
                <ul style={{ margin: 0, padding: '0 0 0 1rem' }}>
                  {room.room_assignments.map(a => (
                    <li key={a.guest_id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {a.guests?.name}
                      <button onClick={() => unassign(a.guest_id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>Unassigned</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
