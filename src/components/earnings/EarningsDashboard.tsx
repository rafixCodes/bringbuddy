import { useState } from 'react'
import {
  TrendingUp, Wallet, CheckCircle2, Clock, ArrowRight, ChevronLeft, X,
  DollarSign, Package, Filter,
} from 'lucide-react'
import { Button } from '../ui'
import { AuthNavbar } from '../AuthNavbar'
import { useRouter, type EarningRecord } from '../../lib/router'

type EarningsFilter = 'all' | 'completed' | 'pending'

function EarningDetailModal({ record, onClose, onViewOrder }: {
  record: EarningRecord
  onClose: () => void
  onViewOrder: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[bb-fade_0.2s_ease_both]">
      <div className="w-full max-w-[420px] rounded-[20px] bg-white shadow-[var(--shadow-e3)] overflow-hidden animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-0.5">Order #{record.orderId}</p>
            <h3 className="text-[17px] font-bold text-ink">{record.route}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-divider text-ink-muted">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          <div className="flex flex-col gap-3 mb-5">
            {[
              { label: 'Carrying Fee', value: `+৳${record.carryingFee.toLocaleString()}`, cls: 'text-ink' },
              { label: 'Platform Fee', value: `-৳${record.platformFee.toLocaleString()}`, cls: 'text-danger' },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-[14px]">
                <span className="text-ink-muted">{r.label}</span>
                <span className={`font-semibold ${r.cls}`}>{r.value}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex justify-between text-[16px] font-bold">
              <span className="text-ink">Net Earnings</span>
              <span className="text-success">+৳{record.net.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-[12px] bg-divider px-4 py-3 mb-5 flex flex-col gap-2 text-[12px]">
            {[
              { label: 'Delivery date', value: record.date },
              { label: 'Payment', value: record.status === 'completed' ? 'Released' : 'Pending' },
              { label: 'Status', value: record.status === 'completed' ? '✓ Completed' : '⏳ Pending' },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-ink-muted">{r.label}</span>
                <span className="font-semibold text-ink">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>Close</Button>
            <Button variant="primary" size="md" className="flex-1" trailingIcon={<ArrowRight size={14} />} onClick={onViewOrder}>
              View Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EarningsDashboard() {
  const { navigate, earnings, activeOrder } = useRouter()
  const [filter, setFilter] = useState<EarningsFilter>('all')
  const [selected, setSelected] = useState<EarningRecord | null>(null)

  // If active order just completed, add it temporarily
  const allEarnings = activeOrder?.status === 'completed'
    ? [
        {
          id: 'e-active',
          orderId: activeOrder.id,
          route: `${activeOrder.from} → ${activeOrder.to}`,
          date: activeOrder.travelDate,
          status: 'completed' as const,
          carryingFee: activeOrder.carryingFee,
          platformFee: activeOrder.serviceFee,
          net: activeOrder.carryingFee - activeOrder.serviceFee,
        },
        ...earnings,
      ]
    : earnings

  const filtered = filter === 'all' ? allEarnings : allEarnings.filter(e => e.status === filter)

  const totalEarned = allEarnings.filter(e => e.status === 'completed').reduce((s, e) => s + e.net, 0)
  const pending = allEarnings.filter(e => e.status === 'pending').reduce((s, e) => s + e.net, 0)
  const available = totalEarned - 4000 // simulate partially withdrawn
  const completed = allEarnings.filter(e => e.status === 'completed').length

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      {selected && (
        <EarningDetailModal
          record={selected}
          onClose={() => setSelected(null)}
          onViewOrder={() => { setSelected(null); navigate('order-hub') }}
        />
      )}

      <main className="max-w-[900px] mx-auto px-6 pt-28 pb-20">

        <button
          onClick={() => navigate('traveler-dashboard')}
          className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Traveler Dashboard
        </button>

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div>
            <p className="text-[13px] text-ink-muted mb-1">Traveler Mode</p>
            <h1 className="text-[30px] font-bold text-ink tracking-tight">Earnings</h1>
          </div>
          <Button variant="secondary" size="md">Withdraw</Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          {[
            { icon: <Wallet size={18} className="text-primary" />, label: 'Total Earned', value: `৳${totalEarned.toLocaleString()}`, bg: 'bg-primary-light' },
            { icon: <CheckCircle2 size={18} className="text-success" />, label: 'Available', value: `৳${available.toLocaleString()}`, bg: 'bg-success-light' },
            { icon: <Clock size={18} className="text-warning" />, label: 'Pending', value: `৳${pending.toLocaleString()}`, bg: 'bg-warning-light' },
            { icon: <Package size={18} className="text-coral" />, label: 'Completed', value: `${completed} deliveries`, bg: 'bg-coral-light' },
          ].map(s => (
            <div key={s.label} className="rounded-[14px] border border-border bg-white p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[10px] ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[18px] font-bold text-ink leading-tight">{s.value}</p>
                <p className="text-[11px] text-ink-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly summary */}
        <div className="rounded-[18px] bg-white border border-border p-5 mb-6 animate-[bb-rise_0.48s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-bold text-ink">This Month</p>
            <div className="flex items-center gap-1.5 text-[12px] text-success font-medium">
              <TrendingUp size={13} /> +22% vs last month
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Deliveries', value: '4' },
              { label: 'Total fees', value: `৳${(totalEarned).toLocaleString()}` },
              { label: 'Avg. per delivery', value: `৳${Math.round(totalEarned / Math.max(completed, 1)).toLocaleString()}` },
            ].map(s => (
              <div key={s.label} className="rounded-[10px] bg-divider px-3 py-2.5 text-center">
                <p className="text-[16px] font-bold text-ink">{s.value}</p>
                <p className="text-[10px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="animate-[bb-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-ink">Transaction History</h2>
            <div className="flex gap-1 rounded-[10px] bg-divider p-1">
              {(['all', 'completed', 'pending'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-[8px] px-3 py-1.5 text-[12px] font-medium capitalize transition-all ${
                    filter === f ? 'bg-white shadow-[var(--shadow-e1)] text-ink' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-border bg-white p-10 text-center">
              <Wallet size={24} className="text-ink-muted mx-auto mb-2" />
              <p className="text-[14px] text-ink-secondary">No earnings in this category yet.</p>
            </div>
          ) : (
            <div className="rounded-[18px] border border-border bg-white overflow-hidden">
              <div className="divide-y divide-border">
                {filtered.map((record, i) => (
                  <button
                    key={record.id}
                    onClick={() => setSelected(record)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-divider transition-colors text-left"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0 ${
                      record.status === 'completed' ? 'bg-success-light' : 'bg-warning-light'
                    }`}>
                      {record.status === 'completed'
                        ? <CheckCircle2 size={16} className="text-success" />
                        : <Clock size={16} className="text-warning" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-ink">{record.route}</p>
                      <p className="text-[12px] text-ink-muted">{record.orderId} · {record.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[15px] font-bold ${record.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                        +৳{record.net.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-ink-muted capitalize">{record.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
