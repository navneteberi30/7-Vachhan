import { useState, useEffect } from 'react'
import { fetchGuests } from '../services/guests'
import { subscribeToGuestChanges } from '../services/notifications'

export function useGuests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await fetchGuests()
      setGuests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const unsubscribe = subscribeToGuestChanges(() => load())
    return unsubscribe
  }, [])

  return { guests, loading, error, reload: load }
}
