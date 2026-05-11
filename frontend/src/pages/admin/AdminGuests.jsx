import { useEffect, useState } from 'react'
import {
  fetchAllGuests,
  createGuest,
  updateGuest,
  generateInviteCode,
} from '../../services/admin'
import { buildInviteMessage } from '../../utils/inviteMessage'

export default function AdminGuests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAllGuests()
      setGuests(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      setCreating(true)
      await createGuest({
        name: newName.trim(),
        invite_code: newCode.trim() || undefined,
      })
      setNewName('')
      setNewCode('')
      await load()
    } catch (err) {
      alert(err.message || 'Could not create guest')
    } finally {
      setCreating(false)
    }
  }

  async function rotateCode(guest) {
    const next = generateInviteCode()
    if (!window.confirm(`Set new code ${next} for ${guest.name}? They must use the new code.`)) return
    try {
      setBusyId(guest.id)
      await updateGuest(guest.id, { invite_code: next })
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function saveName(guest, name) {
    if (!name.trim() || name === guest.name) return
    try {
      setBusyId(guest.id)
      await updateGuest(guest.id, { name: name.trim() })
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function copyInviteMessage(guest) {
    try {
      const text = buildInviteMessage({
        guestName: guest.name,
        inviteCode: guest.invite_code,
      })
      await navigator.clipboard.writeText(text)
      setCopiedId(guest.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      alert('Could not copy — try a secure (https) page or copy manually.')
    }
  }

  return (
    <div>
      <h1 className="font-headline text-3xl text-on-surface mb-2">Guests & invite codes</h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Create families and share their invite code. Use <strong>Copy invite</strong> for a ready-to-send message (set{' '}
        <code className="text-xs bg-surface-container-high px-1 rounded">VITE_APP_URL</code> in{' '}
        <code className="text-xs bg-surface-container-high px-1 rounded">.env</code> for production links). Sync from Google
        Sheets with <code className="text-xs bg-surface-container-high px-1 rounded">backend/sync_guests.py</code>.
      </p>

      <form
        onSubmit={handleCreate}
        className="mb-8 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-4 space-y-3"
      >
        <p className="font-headline text-sm text-on-surface">Add guest / family</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Family name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-outline-variant/25 bg-surface text-sm"
          />
          <input
            type="text"
            placeholder="Invite code (optional — auto if empty)"
            value={newCode}
            onChange={e => setNewCode(e.target.value.toUpperCase())}
            className="sm:w-56 px-4 py-2 rounded-xl border border-outline-variant/25 bg-surface font-mono text-sm"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold disabled:opacity-50"
          >
            {creating ? 'Saving…' : 'Create'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/5 p-3 text-error text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-on-surface-variant">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-left text-xs uppercase tracking-wider text-on-surface-variant">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Invite code</th>
                <th className="px-4 py-3">Linked</th>
                <th className="px-4 py-3">Invite message</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map(g => (
                <tr key={g.id} className="border-t border-outline-variant/10">
                  <td className="px-4 py-3">
                    <InlineNameEditor guest={g} disabled={busyId === g.id} onSave={saveName} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tracking-wide">{g.invite_code}</td>
                  <td className="px-4 py-3 text-xs">
                    {g.supabase_user_id ? (
                      <span className="text-tertiary font-medium">Yes</span>
                    ) : (
                      <span className="text-on-surface-variant">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => copyInviteMessage(g)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-container/40 text-xs font-semibold text-primary hover:bg-secondary-container/60"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      {copiedId === g.id ? 'Copied!' : 'Copy invite'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === g.id}
                      onClick={() => rotateCode(g)}
                      className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      New code
                    </button>
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

function InlineNameEditor({ guest, disabled, onSave }) {
  const [val, setVal] = useState(guest.name)
  useEffect(() => { setVal(guest.name) }, [guest.name])

  return (
    <input
      type="text"
      value={val}
      disabled={disabled}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onSave(guest, val)}
      className="w-full max-w-[200px] px-2 py-1 rounded-lg border border-transparent hover:border-outline-variant/25 focus:border-primary bg-transparent text-sm"
    />
  )
}
