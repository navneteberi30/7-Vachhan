import { useState, useEffect } from 'react'
import { fetchEvents, fetchEvent } from '../services/events'
import { WEDDING } from '../config/wedding'

// Fallback comes from wedding.js config — edit events there
const FALLBACK_EVENTS = WEDDING.events.map((e, i) => ({ id: String(i + 1), sort_order: i + 1, ...e }))

export function useEvents() {
  const [events, setEvents] = useState(FALLBACK_EVENTS)
  // Fallback data is available synchronously, so no loading flash on mount
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
      .then(data => { if (data?.length) setEvents(data) })
      .catch(() => { /* silently use fallback data */ })
  }, [])

  return { events, loading, error }
}

export function useEvent(slug) {
  const [event, setEvent] = useState(() => FALLBACK_EVENTS.find(e => e.slug === slug) ?? null)
  // Fallback data is available synchronously, so no loading flash on mount
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEvent(slug)
      .then(data => { if (data) setEvent(data) })
      .catch(() => {})
  }, [slug])

  return { event, loading }
}
