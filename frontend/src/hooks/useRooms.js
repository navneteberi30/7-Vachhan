import { useState, useEffect } from 'react'
import { fetchRooms, assignGuestToRoom, removeRoomAssignment } from '../services/rooms'

export function useRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await fetchRooms()
      setRooms(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function assign(guestId, roomId) {
    await assignGuestToRoom(guestId, roomId)
    await load()
  }

  async function unassign(guestId) {
    await removeRoomAssignment(guestId)
    await load()
  }

  useEffect(() => { load() }, [])

  return { rooms, loading, error, assign, unassign, reload: load }
}
