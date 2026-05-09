import { useState } from 'react'
import { supabase } from '../services/supabase'

export function useRSVP() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  async function submitRSVP({ guestId, attending, mealChoice, dietaryNotes }) {
    try {
      setSubmitting(true)
      setError(null)

      const { error: rsvpError } = await supabase.from('rsvp_responses').upsert(
        { guest_id: guestId, attending, meal_choice: mealChoice, dietary_notes: dietaryNotes },
        { onConflict: 'guest_id' }
      )
      if (rsvpError) throw rsvpError

      await supabase
        .from('guests')
        .update({ rsvp_status: attending ? 'confirmed' : 'declined' })
        .eq('id', guestId)

      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return { submitRSVP, submitting, error, submitted }
}
