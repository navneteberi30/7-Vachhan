import { useState } from 'react'
import { useRSVP } from '../hooks/useRSVP'

export default function RSVP() {
  const { submitRSVP, submitting, error, submitted } = useRSVP()
  const [form, setForm] = useState({ guestId: '', attending: true, mealChoice: '', dietaryNotes: '' })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await submitRSVP(form)
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#059669' }}>RSVP Submitted!</h2>
        <p>Thank you for your response. We look forward to celebrating with you.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ marginBottom: '1.5rem' }}>RSVP</h2>
      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Guest ID</span>
          <input name="guestId" value={form.guestId} onChange={handleChange} required style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" name="attending" checked={form.attending} onChange={handleChange} />
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>I will attend</span>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Meal Choice</span>
          <select name="mealChoice" value={form.mealChoice} onChange={handleChange} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <option value="">Select...</option>
            <option value="chicken">Chicken</option>
            <option value="fish">Fish</option>
            <option value="vegetarian">Vegetarian</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Dietary Notes</span>
          <textarea name="dietaryNotes" value={form.dietaryNotes} onChange={handleChange} rows={3} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6, resize: 'vertical' }} />
        </label>
        <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.5rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer' }}>
          {submitting ? 'Submitting…' : 'Submit RSVP'}
        </button>
      </form>
    </div>
  )
}
