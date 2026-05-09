import { useState, useEffect } from 'react'
import { fetchEvents, fetchEvent } from '../services/events'
import { WEDDING } from '../config/wedding'

// Fallback comes from wedding.js config — edit events there
const FALLBACK_EVENTS = WEDDING.events.map((e, i) => ({ id: String(i + 1), sort_order: i + 1, ...e }))

export function useEvents() {
  const [events, setEvents] = useState(FALLBACK_EVENTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
      .then(data => { if (data?.length) setEvents(data) })
      .catch(() => { /* silently use fallback data */ })
      .finally(() => setLoading(false))
  }, [])

  return { events, loading, error }
}

export function useEvent(slug) {
  const [event, setEvent] = useState(() => FALLBACK_EVENTS.find(e => e.slug === slug) ?? null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent(slug)
      .then(data => { if (data) setEvent(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  return { event, loading }
}
