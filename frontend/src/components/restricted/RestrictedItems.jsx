import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Ban, ChevronLeft, Loader2, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { AuthNavbar } from '../AuthNavbar'
import { Button } from '../ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../lib/toast'
import {
  addRestrictedItem,
  deleteRestrictedItem,
  getRestrictedItems,
} from '../../services/restrictedItemService'

const emptyForm = {
  name: '',
  keywords: '',
  category: 'other',
  restrictionLevel: 'prohibited',
  reason: '',
}

export function RestrictedItems() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)

  const isAdmin = user?.accountType === 'admin'

  const loadItems = useCallback(async () => {
    try {
      setError('')
      const data = await getRestrictedItems()
      setItems(data.items || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load restricted items.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleAdd(event) {
    event.preventDefault()
    setIsSaving(true)
    try {
      await addRestrictedItem({
        ...form,
        keywords: form.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean),
      })
      setForm(emptyForm)
      await loadItems()
      toast({ tone: 'success', title: 'Rule added', message: 'The new validation rule is active.' })
    } catch (requestError) {
      toast({
        tone: 'error',
        title: 'Could not add rule',
        message: requestError.response?.data?.message || 'Please check the entered information.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete the custom rule "${item.name}"?`)) return
    try {
      await deleteRestrictedItem(item.id)
      setItems((current) => current.filter((entry) => entry.id !== item.id))
      toast({ tone: 'success', title: 'Rule deleted', message: 'The custom rule was removed.' })
    } catch (requestError) {
      toast({
        tone: 'error',
        title: 'Could not delete rule',
        message: requestError.response?.data?.message || 'Please try again.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-28">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeft size={15} /> Back
        </button>

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-danger-light text-danger">
            <ShieldAlert size={24} />
          </div>
          <h1 className="text-[30px] font-bold tracking-tight text-ink">Restricted item policy</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-secondary">
            Prohibited items are blocked. Restricted items display a warning because airline and customs approval may be required.
          </p>
        </div>

        {isAdmin && (
          <form onSubmit={handleAdd} className="mb-8 rounded-[16px] border border-border bg-white p-6 shadow-[var(--shadow-e1)]">
            <div className="mb-5 flex items-center gap-2">
              <Plus size={18} className="text-primary" />
              <h2 className="text-[18px] font-bold text-ink">Add custom validation rule</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-[13px] font-semibold text-ink">
                Rule name
                <input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="mt-1.5 h-11 w-full rounded-[8px] border border-border px-3 font-normal outline-none focus:border-primary" placeholder="e.g. Aerosol cans" />
              </label>
              <label className="text-[13px] font-semibold text-ink">
                Keywords (comma separated)
                <input required value={form.keywords} onChange={(event) => updateForm('keywords', event.target.value)} className="mt-1.5 h-11 w-full rounded-[8px] border border-border px-3 font-normal outline-none focus:border-primary" placeholder="aerosol, spray can" />
              </label>
              <label className="text-[13px] font-semibold text-ink">
                Category
                <select value={form.category} onChange={(event) => updateForm('category', event.target.value)} className="mt-1.5 h-11 w-full rounded-[8px] border border-border bg-white px-3 font-normal outline-none focus:border-primary">
                  <option value="dangerous_goods">Dangerous goods</option>
                  <option value="controlled_substances">Controlled substances</option>
                  <option value="money">Money</option>
                  <option value="alcohol">Alcohol</option>
                  <option value="medication">Medication</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="text-[13px] font-semibold text-ink">
                Action
                <select value={form.restrictionLevel} onChange={(event) => updateForm('restrictionLevel', event.target.value)} className="mt-1.5 h-11 w-full rounded-[8px] border border-border bg-white px-3 font-normal outline-none focus:border-primary">
                  <option value="prohibited">Block (prohibited)</option>
                  <option value="restricted">Warn (restricted)</option>
                </select>
              </label>
            </div>
            <label className="mt-4 block text-[13px] font-semibold text-ink">
              Reason shown to users
              <textarea required value={form.reason} onChange={(event) => updateForm('reason', event.target.value)} className="mt-1.5 min-h-24 w-full resize-y rounded-[8px] border border-border px-3 py-2.5 font-normal outline-none focus:border-primary" placeholder="Explain why this item is blocked or needs review." />
            </label>
            <Button type="submit" className="mt-4" disabled={isSaving} leadingIcon={isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}>
              {isSaving ? 'Adding rule...' : 'Add rule'}
            </Button>
          </form>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-ink-muted"><Loader2 className="animate-spin" /></div>
        ) : error ? (
          <div className="rounded-[12px] border border-danger/20 bg-danger-light p-4 text-[14px] text-danger">{error}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => {
              const prohibited = item.restrictionLevel === 'prohibited'
              return (
                <article key={item.id} className="rounded-[14px] border border-border bg-white p-5 shadow-[var(--shadow-e1)]">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] ${prohibited ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'}`}>
                      {prohibited ? <Ban size={17} /> : <AlertTriangle size={17} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-[15px] font-bold text-ink">{item.name}</h2>
                          <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${prohibited ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'}`}>
                            {prohibited ? 'Blocked' : 'Warning required'}
                          </span>
                        </div>
                        {isAdmin && !item.isSystemRule && (
                          <button onClick={() => handleDelete(item)} className="rounded-[7px] p-2 text-ink-muted transition-colors hover:bg-danger-light hover:text-danger" title="Delete custom rule">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{item.reason}</p>
                      <p className="mt-3 text-[11px] text-ink-muted">
                        Keywords: {item.keywords.join(', ')} {item.isSystemRule ? '• System rule' : '• Custom rule'}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <p className="mt-8 rounded-[12px] border border-primary/15 bg-primary-light p-4 text-[12px] leading-relaxed text-ink-secondary">
          This list is a platform screening guide. Travelers and senders must still follow airline, customs, and destination-country laws.
        </p>
      </main>
    </div>
  )
}
