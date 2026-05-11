import { useEffect, useState } from 'react'
import { fetchRooms, assignGuestToRoom, removeRoomAssignment } from '../../services/rooms'
import { fetchAllGuests } from '../../services/admin'

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyGuestId, setBusyGuestId] = useState(null)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const [r, g] = await Promise.all([fetchRooms(), fetchAllGuests()])
      setRooms(r)
      setGuests(g)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function assignedRoomId(guestId) {
    for (const room of rooms) {
      const a = room.room_assignments?.find(x => x.guest_id === guestId)
      if (a) return room.id
    }
    return ''
  }

  async function onAssign(guestId, roomId) {
    if (!roomId) {
      try {
        setBusyGuestId(guestId)
        await removeRoomAssignment(guestId)
        await load()
      } catch (e) {
        alert(e.message)
      } finally {
        setBusyGuestId(null)
      }
      return
    }
    try {
      setBusyGuestId(guestId)
      await assignGuestToRoom(guestId, roomId)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyGuestId(null)
    }
  }

  return (
    <div>
      <h1 className="font-headline text-3xl text-on-surface mb-2">Room assignments</h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Assign each guest family to a room. Capacity is informational — manage overflow manually.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/5 p-3 text-error text-sm">{error}</div>
      )}

      {/* Room summary */}
      {!loading && rooms.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {rooms.map(room => (
            <div
              key={room.id}
              className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-3 text-sm"
            >
              <p className="font-headline text-primary">Room {room.room_number}</p>
              <p className="text-xs text-on-surface-variant">Cap {room.capacity}</p>
              <p className="text-xs mt-2 font-medium">
                {(room.room_assignments?.length ?? 0)} assigned
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-on-surface-variant">Loading…</p>
      ) : guests.length === 0 ? (
        <p className="text-on-surface-variant text-sm">No guest records yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-left text-xs uppercase tracking-wider text-on-surface-variant">
                <th className="px-4 py-3">Guest / family</th>
                <th className="px-4 py-3">Room</th>
              </tr>
            </thead>
            <tbody>
              {guests.map(g => (
                <tr key={g.id} className="border-t border-outline-variant/10">
                  <td className="px-4 py-3 font-medium">{g.name}</td>
                  <td className="px-4 py-3">
                    <select
                      disabled={busyGuestId === g.id}
                      value={assignedRoomId(g.id)}
                      onChange={e => onAssign(g.id, e.target.value)}
                      className="w-full max-w-xs px-3 py-2 rounded-xl border border-outline-variant/25 bg-surface text-sm"
                    >
                      <option value="">— Unassigned —</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Room {room.room_number} (cap {room.capacity})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
