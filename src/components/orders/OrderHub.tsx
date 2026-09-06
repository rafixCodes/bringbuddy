import { useState, useRef, useEffect, type ReactNode } from 'react'
import {
  CheckCircle2, Clock, Package, User, Send, Lock,
  Paperclip, ChevronDown, ChevronUp, Shield, Wallet,
  MessageSquare, ArrowRight, FileText, Plus, Plane, MapPin,
  KeyRound, Star, X, MoreHorizontal, AlertTriangle, Loader2,
  ShoppingBag, XCircle, ShieldAlert, Truck,
} from 'lucide-react'
import { AuthNavbar } from '../AuthNavbar'
import { Button } from '../ui'
import { useRouter, type OrderStatus, type ActiveOrder } from '../../lib/router'
import { useToast } from '../../lib/toast'
import { getTravelerById } from '../../data/prototype'

const DEMO_OTP = '482916'

/* ---- lifecycle helpers ---- */
const TIMELINE_LABELS = [
  'Request Sent',
  'Traveler Accepted',
  'Payment Secured',
  'Pickup Arranged',
  'Picked Up',
  'In Transit',
  'Delivery Confirmation',
  'Completed',
]

// number of fully-completed timeline steps for each status
const DONE_COUNT: Record<OrderStatus, number> = {
  pending: 1,
  accepted: 2,
  paid: 3,
  arranged: 4,
  'picked-up': 5,
  transit: 5,
  ready: 6,
  completed: 8,
  cancelled: 0,
}

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Awaiting Traveler', className: 'bg-warning-light text-warning' },
  accepted: { label: 'Accepted', className: 'bg-info-light text-info' },
  paid: { label: 'Payment Secured', className: 'bg-primary-light text-primary' },
  arranged: { label: 'Pickup Arranged', className: 'bg-primary-light text-primary' },
  'picked-up': { label: 'Picked Up', className: 'bg-primary-light text-primary' },
  transit: { label: 'In Transit', className: 'bg-coral-light text-coral' },
  ready: { label: 'Delivery Ready', className: 'bg-coral-light text-coral' },
  completed: { label: 'Completed', className: 'bg-success-light text-success' },
  cancelled: { label: 'Cancelled', className: 'bg-danger-light text-danger' },
}

function nowStamp() {
  return 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface TimelineStep { label: string; done: boolean; active: boolean; locked: boolean; timestamp?: string }

function buildTimeline(order: ActiveOrder): TimelineStep[] {
  const done = DONE_COUNT[order.status]
  const ts = order.timestamps ?? {}
  const stamps: (string | undefined)[] = [
    'Today, 2:05 PM',
    ts.accepted ?? (done > 1 ? 'Today, 2:31 PM' : undefined),
    ts.paid,
    ts.arranged,
    ts['picked-up'],
    ts.transit,
    ts.completed ? ts.completed : undefined,
    ts.completed,
  ]
  return TIMELINE_LABELS.map((label, i) => ({
    label,
    done: i < done,
    active: i === done && order.status !== 'completed' && order.status !== 'cancelled',
    locked: order.status === 'cancelled' && i >= done,
    timestamp: i < done ? stamps[i] : undefined,
  }))
}

/* ---- Timeline component ---- */
function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
              step.done ? 'bg-success text-white'
                : step.active ? 'bg-primary text-white shadow-[0_0_0_4px_rgba(49,87,213,0.15)] animate-[bb-fade_0.4s_ease]'
                : 'bg-border text-ink-muted'
            }`}>
              {step.done ? <CheckCircle2 size={14} /> : step.locked ? <Lock size={12} /> : step.active ? <Clock size={13} /> : <Clock size={13} className="opacity-50" />}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-0.5 h-8 mt-1 transition-colors duration-500 ${step.done ? 'bg-success' : 'bg-border'}`} />
            )}
          </div>
          <div className="pt-1 pb-6">
            <p className={`text-[13px] font-semibold transition-colors ${step.done || step.active ? 'text-ink' : 'text-ink-muted'}`}>
              {step.label}
            </p>
            {step.timestamp && <p className="text-[11px] text-ink-muted mt-0.5">{step.timestamp}</p>}
            {step.active && <p className="text-[11px] text-primary font-medium mt-0.5">Current stage</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---- Chat ---- */
interface ChatMessage { id: string; sender: 'traveler' | 'user'; name: string; text: string; time: string }
const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'traveler', name: 'Aisha', text: "Hi! I can meet at the pickup point around 6 PM on the 26th.", time: '2:14 PM' },
  { id: '2', sender: 'user', name: 'Alex', text: "Perfect. I'll bring the package before then. Do you need anything else from me?", time: '2:18 PM' },
  { id: '3', sender: 'traveler', name: 'Aisha', text: "That's great! Just make sure it's properly sealed. I'll send you my contact number closer to the date.", time: '2:21 PM' },
]

function ChatPanel({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function sendMessage() {
    if (!input.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now().toString(), sender: 'user', name: userName.split(' ')[0], text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-[bb-rise_0.25s_cubic-bezier(0.22,1,0.36,1)_both]`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-coral-light text-coral'}`}>
              {msg.name[0]}
            </div>
            <div className={`max-w-[72%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <p className={`text-[11px] text-ink-muted mb-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>{msg.name} · {msg.time}</p>
              <div className={`rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-[4px]' : 'bg-divider text-ink rounded-tl-[4px]'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-[10px] border border-border bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Write a message…" className="flex-1 h-10 text-[13px] text-ink placeholder:text-ink-muted bg-transparent outline-none" />
          <button onClick={sendMessage} disabled={!input.trim()} aria-label="Send message"
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors">
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---- Files ---- */
function SharedFiles() {
  const files = [{ name: 'package-details.pdf', size: '124 KB', time: 'Today' }]
  return (
    <div className="flex flex-col gap-2">
      {files.map(f => (
        <div key={f.name} className="flex items-center gap-3 rounded-[10px] border border-border bg-white px-3.5 py-2.5 hover:border-primary/30 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-[8px] bg-primary-light flex items-center justify-center shrink-0"><FileText size={15} className="text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-ink truncate">{f.name}</p>
            <p className="text-[11px] text-ink-muted">{f.size} · {f.time}</p>
          </div>
          <Paperclip size={13} className="text-ink-muted group-hover:text-primary transition-colors" />
        </div>
      ))}
      <button className="flex items-center gap-2 text-[12px] text-primary font-medium hover:gap-3 transition-all mt-1"><Plus size={13} /> Add File</button>
    </div>
  )
}

/* ---- Modal shell ---- */
function Modal({ children, onClose, wide = false }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-[bb-fade_0.2s_ease]" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'sm:max-w-[560px]' : 'sm:max-w-[440px]'} bg-white rounded-t-[20px] sm:rounded-[16px] shadow-[var(--shadow-e3)] max-h-[92vh] overflow-y-auto animate-[bb-rise_0.3s_cubic-bezier(0.22,1,0.36,1)_both]`}>
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-divider transition-colors">
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  )
}

/* ---- Tracking card ---- */
function TrackingCard({ order }: { order: ActiveOrder }) {
  const picked = ['picked-up', 'transit', 'ready', 'completed'].includes(order.status)
  const arrived = order.status === 'completed'
  return (
    <div className="rounded-[16px] border border-border bg-white overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border flex items-center gap-2">
        <Truck size={14} className="text-ink-muted" />
        <p className="text-[12px] font-bold text-ink uppercase tracking-widest">Delivery Status</p>
      </div>
      <div className="px-4 py-5">
        {/* route visual */}
        <div className="relative flex items-center justify-between mb-5">
          <div className="flex flex-col items-center gap-1 z-10">
            <div className={`w-3 h-3 rounded-full ${picked ? 'bg-success' : 'bg-primary'}`} />
            <span className="text-[12px] font-semibold text-ink">{order.from}</span>
          </div>
          <div className="absolute left-3 right-3 top-1.5 h-0.5 -translate-y-1/2 bg-border overflow-hidden rounded-full">
            <div className="h-full bg-gradient-to-r from-success to-coral transition-all duration-700"
              style={{ width: arrived ? '100%' : picked ? '55%' : '8%' }} />
          </div>
          {!arrived && picked && (
            <div className="absolute top-1.5 -translate-y-1/2 z-10 transition-all duration-700" style={{ left: '52%' }}>
              <div className="w-6 h-6 rounded-full bg-coral text-white flex items-center justify-center shadow-[var(--shadow-e2)]">
                <Plane size={12} className="rotate-45" />
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className={`w-3 h-3 rounded-full ${arrived ? 'bg-success' : 'bg-border'}`} />
            <span className="text-[12px] font-semibold text-ink">{order.to}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[12px]">
            <CheckCircle2 size={14} className={picked ? 'text-success' : 'text-ink-muted'} />
            <span className={picked ? 'text-ink font-medium' : 'text-ink-muted'}>{order.from} · {picked ? 'Picked up' : 'Awaiting pickup'}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Plane size={14} className={order.status === 'transit' || order.status === 'ready' ? 'text-coral' : arrived ? 'text-success' : 'text-ink-muted'} />
            <span className={order.status === 'transit' || order.status === 'ready' ? 'text-ink font-medium' : 'text-ink-muted'}>
              {arrived ? 'Flight completed' : order.status === 'transit' || order.status === 'ready' ? 'In transit' : 'Awaiting departure'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <MapPin size={14} className={arrived ? 'text-success' : 'text-ink-muted'} />
            <span className={arrived ? 'text-ink font-medium' : 'text-ink-muted'}>{order.to} · {arrived ? 'Delivered' : 'Awaiting arrival'}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex justify-between text-[11px] text-ink-muted">
          <span>Travel date · <strong className="text-ink font-medium">{order.travelDate}</strong></span>
          <span>Updated · {nowStamp().replace('Today, ', '')}</span>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Order Hub
   ============================================================ */
export function OrderHub() {
  const { navigate, activeOrder, setActiveOrder, user } = useRouter()
  const { toast } = useToast()
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'files'>('chat')
  const [modal, setModal] = useState<null | 'payment' | 'otp' | 'review' | 'cancel' | 'dispute'>(null)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!activeOrder) { navigate('sender-dashboard'); return null }
  const order = activeOrder

  const traveler = getTravelerById(order.travelerId || 't1')
  const isTraveler = user?.mode === 'traveler'
  const senderName = order.senderName ?? 'Alex Johnson'
  const meta = STATUS_META[order.status]
  const steps = buildTimeline(order)
  const isShopping = order.type === 'shopping-request'

  const senderTotal = order.carryingFee + order.serviceFee
  const travelerPayout = order.carryingFee - order.serviceFee
  const paid = ['paid', 'arranged', 'picked-up', 'transit', 'ready', 'completed'].includes(order.status)
  const released = order.status === 'completed'

  /* ---- transitions ---- */
  function advance(status: OrderStatus, extra: Partial<ActiveOrder> = {}) {
    setActiveOrder(prev => prev && ({
      ...prev, status,
      timestamps: { ...(prev.timestamps ?? {}), [status]: nowStamp() },
      ...extra,
    }))
  }

  async function withBusy(fn: () => void) {
    setBusy(true)
    await new Promise(r => setTimeout(r, 900))
    setBusy(false)
    fn()
  }

  function arrangePickup() {
    advance('arranged')
    toast({ tone: 'success', title: '✓ Pickup arranged', message: 'The traveler can now confirm pickup.' })
  }
  function confirmPickup() {
    withBusy(() => {
      advance('picked-up')
      toast({ tone: 'success', title: '✓ Pickup confirmed', message: `Your parcel is now with ${traveler.name.split(' ')[0]}.` })
    })
  }
  function startTransit() {
    withBusy(() => {
      advance('transit')
      toast({ tone: 'info', title: '✓ Order is in transit', message: `${order.from} → ${order.to} is on its way.` })
    })
  }
  function readyForDelivery() {
    advance('ready')
    toast({ tone: 'info', title: 'Ready for delivery', message: 'Ask the receiver to confirm with the delivery code.' })
    setModal('otp')
  }

  const canCancel = ['pending', 'accepted', 'paid', 'arranged'].includes(order.status)
  const cancelWarn = ['picked-up', 'transit', 'ready'].includes(order.status)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthNavbar />

      {/* Header */}
      <div className="mt-16 border-b border-border bg-white">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <p className="text-[12px] font-bold text-ink-muted uppercase tracking-widest">Order Hub · #{order.id}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${meta.className}`}>{meta.label}</span>
                {order.disputeStatus === 'under-review' && (
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-danger-light text-danger flex items-center gap-1">
                    <ShieldAlert size={11} /> Dispute under review
                  </span>
                )}
              </div>
              <h1 className="text-[22px] font-bold text-ink tracking-tight">{order.from} → {order.to}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[13px] text-ink-muted">
                <span className="flex items-center gap-1.5"><User size={12} /> Sender: <strong className="text-ink">{senderName}</strong></span>
                <span className="flex items-center gap-1.5"><User size={12} /> Traveler: <strong className="text-ink">{traveler.name}</strong></span>
                <span className="flex items-center gap-1.5">
                  {isShopping ? <ShoppingBag size={12} /> : <Package size={12} />}
                  {isShopping ? 'Shopping Request' : 'Carry Only'} · {order.weightKg} kg
                </span>
                <span className="flex items-center gap-1.5"><Clock size={12} /> {order.travelDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Order actions menu */}
              {order.status !== 'cancelled' && (
                <div className="relative">
                  <button onClick={() => setActionsOpen(s => !s)} aria-label="Order actions"
                    className="w-10 h-10 rounded-[10px] border border-border bg-white flex items-center justify-center text-ink-muted hover:text-ink hover:border-primary/30 transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                  {actionsOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActionsOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-[12px] bg-white shadow-[var(--shadow-e3)] border border-border overflow-hidden z-20 py-1.5 animate-[bb-rise_0.2s_cubic-bezier(0.22,1,0.36,1)_both]">
                        <button onClick={() => { setActionsOpen(false); setModal('dispute') }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-ink-secondary hover:bg-divider hover:text-ink transition-colors">
                          <ShieldAlert size={14} /> Report a problem
                        </button>
                        {order.status !== 'completed' ? (
                          <button onClick={() => { setActionsOpen(false); setModal('cancel') }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-danger hover:bg-danger-light transition-colors">
                            <XCircle size={14} /> Cancel order
                          </button>
                        ) : (
                          <div className="px-4 py-2.5 text-[12px] text-ink-muted">Order complete — cancellation unavailable</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              <Button variant="ghost" size="md" onClick={() => navigate(isTraveler ? 'traveler-dashboard' : 'sender-dashboard')}>← Dashboard</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_340px] gap-5 h-full">

          {/* Left — Timeline (desktop) */}
          <div className="lg:block hidden">
            <div className="sticky top-24 rounded-[16px] border border-border bg-white overflow-hidden">
              <div className="px-4 py-3.5 border-b border-border">
                <p className="text-[12px] font-bold text-ink uppercase tracking-widest">Timeline</p>
              </div>
              <div className="px-4 py-4"><OrderTimeline steps={steps} /></div>
            </div>
          </div>

          {/* Center — chat / files */}
          <div className="flex flex-col min-h-0">
            {/* Mobile timeline (collapsible) */}
            <div className="lg:hidden rounded-[16px] border border-border bg-white overflow-hidden mb-4">
              <button onClick={() => setTimelineOpen(s => !s)} className="flex items-center justify-between w-full px-4 py-3.5">
                <p className="text-[12px] font-bold text-ink uppercase tracking-widest">Order Timeline</p>
                {timelineOpen ? <ChevronUp size={14} className="text-ink-muted" /> : <ChevronDown size={14} className="text-ink-muted" />}
              </button>
              {timelineOpen && <div className="px-4 pb-4"><OrderTimeline steps={steps} /></div>}
            </div>

            <div className="flex border border-border rounded-[12px] bg-white overflow-hidden mb-4">
              {([{ key: 'chat', icon: <MessageSquare size={14} />, label: 'Chat' }, { key: 'files', icon: <Paperclip size={14} />, label: 'Shared Files' }] as const).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium transition-colors ${activeTab === tab.key ? 'bg-primary-light text-primary' : 'text-ink-secondary hover:text-ink'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 rounded-[16px] border border-border bg-white overflow-hidden flex flex-col" style={{ minHeight: '420px' }}>
              {activeTab === 'chat' && <ChatPanel userName={user?.name ?? senderName} />}
              {activeTab === 'files' && (
                <div className="p-5">
                  <p className="text-[13px] font-semibold text-ink mb-3">Shared Files</p>
                  <SharedFiles />
                </div>
              )}
            </div>
          </div>

          {/* Right — action panel + details + payment */}
          <div className="flex flex-col gap-4">

            <ActionPanel
              order={order} isTraveler={isTraveler} busy={busy} travelerName={traveler.name} senderName={senderName}
              onSecurePayment={() => setModal('payment')}
              onArrangePickup={arrangePickup}
              onConfirmPickup={confirmPickup}
              onStartTransit={startTransit}
              onReadyForDelivery={readyForDelivery}
              onReview={() => setModal('review')}
              onDiscuss={() => setActiveTab('chat')}
            />

            {/* Tracking (once picked up) */}
            {['picked-up', 'transit', 'ready', 'completed'].includes(order.status) && <TrackingCard order={order} />}

            {/* Order details */}
            <div className="rounded-[16px] border border-border bg-white overflow-hidden">
              <button className="flex items-center justify-between w-full px-4 py-3.5 border-b border-border" onClick={() => setDetailsOpen(s => !s)}>
                <p className="text-[12px] font-bold text-ink uppercase tracking-widest">Order Details</p>
                {detailsOpen ? <ChevronUp size={14} className="text-ink-muted" /> : <ChevronDown size={14} className="text-ink-muted" />}
              </button>
              {detailsOpen && (
                <div className="divide-y divide-border">
                  {(isShopping ? [
                    { label: 'Type', value: 'Shopping Request' },
                    { label: 'Product', value: order.productUrl ?? order.itemDescription },
                    { label: 'Quantity', value: String(order.quantity ?? 1) },
                    { label: 'Budget', value: order.budget ? `৳${order.budget.toLocaleString()}` : '—' },
                    { label: 'Instructions', value: order.specialInstructions ?? 'Please purchase as described.' },
                    { label: 'Receiver', value: order.receiverName },
                    { label: 'Destination', value: order.to },
                    { label: 'Traveler', value: traveler.name },
                  ] : [
                    { label: 'Type', value: 'Carry Only' },
                    { label: 'Weight', value: `${order.weightKg} kg` },
                    { label: 'Item', value: order.itemDescription },
                    { label: 'Pickup', value: order.pickupAddress },
                    { label: 'Receiver', value: order.receiverName },
                    { label: 'Instructions', value: order.specialInstructions ?? 'Handle with care' },
                    { label: 'Sender', value: senderName },
                    { label: 'Traveler', value: traveler.name },
                  ]).map(item => (
                    <div key={item.label} className="flex justify-between px-4 py-2.5 text-[12px]">
                      <span className="text-ink-muted">{item.label}</span>
                      <span className="font-medium text-ink text-right max-w-[55%]">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment / escrow */}
            <PaymentCard order={order} isTraveler={isTraveler} paid={paid} released={released}
              senderTotal={senderTotal} travelerPayout={travelerPayout} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'payment' && (
        <PaymentModal order={order} senderTotal={senderTotal} onClose={() => setModal(null)}
          onSecured={() => {
            advance('paid')
            toast({ tone: 'success', title: '✓ Payment secured', message: 'Your funds will be released after delivery confirmation.' })
            setModal(null)
          }} />
      )}
      {modal === 'otp' && (
        <OTPModal isTraveler={isTraveler} travelerName={traveler.name} payout={travelerPayout} onClose={() => setModal(null)}
          onConfirmed={() => {
            advance('completed')
            toast({ tone: 'success', title: '✓ Delivery confirmed', message: `৳${travelerPayout.toLocaleString()} released to ${traveler.name.split(' ')[0]}.` })
            setModal(null)
            setTimeout(() => setModal('review'), 700)
          }} />
      )}
      {modal === 'review' && (
        <ReviewModal isTraveler={isTraveler} counterpart={isTraveler ? senderName : traveler.name} onClose={() => setModal(null)}
          onSubmitted={() => {
            setActiveOrder(prev => prev && ({ ...prev, [isTraveler ? 'reviewedByTraveler' : 'reviewedBySender']: true }))
            toast({ tone: 'success', title: '✓ Review submitted', message: 'Thanks for helping keep BringBuddy trustworthy.' })
            setModal(null)
          }} />
      )}
      {modal === 'cancel' && (
        <CancelModal warn={cancelWarn} onClose={() => setModal(null)}
          onCancelled={(reason) => {
            advance('cancelled', { cancelReason: reason })
            toast({ tone: 'warning', title: 'Delivery cancelled', message: isTraveler ? 'Your cancellation has been recorded.' : 'You can find another traveler from your dashboard.' })
            setModal(null)
          }} />
      )}
      {modal === 'dispute' && (
        <DisputeModal onClose={() => setModal(null)}
          onSubmitted={() => {
            setActiveOrder(prev => prev && ({ ...prev, disputeStatus: 'under-review' }))
            toast({ tone: 'info', title: 'Dispute submitted', message: 'BringBuddy support will review the order history and evidence.' })
            setModal(null)
          }} />
      )}
    </div>
  )
}

/* ============================================================
   Action panel — role & state aware
   ============================================================ */
function ActionPanel({
  order, isTraveler, busy, travelerName, senderName,
  onSecurePayment, onArrangePickup, onConfirmPickup, onStartTransit, onReadyForDelivery, onReview, onDiscuss,
}: {
  order: ActiveOrder; isTraveler: boolean; busy: boolean; travelerName: string; senderName: string
  onSecurePayment: () => void; onArrangePickup: () => void; onConfirmPickup: () => void
  onStartTransit: () => void; onReadyForDelivery: () => void; onReview: () => void; onDiscuss: () => void
}) {
  const wrap = (accent: 'primary' | 'coral' | 'success', eyebrow: string, title: string, body: string, action: ReactNode, note?: ReactNode) => (
    <div className={`rounded-[16px] p-4 text-white ${accent === 'coral' ? 'bg-coral' : accent === 'success' ? 'bg-success' : 'bg-primary'}`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70 mb-1">{eyebrow}</p>
      <p className="text-[15px] font-bold mb-1.5">{title}</p>
      <p className="text-[12px] opacity-85 mb-3 leading-snug">{body}</p>
      {action}
      {note}
    </div>
  )
  const waiting = (eyebrow: string, title: string, body: string) => (
    <div className="rounded-[16px] border border-border bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted mb-1">{eyebrow}</p>
      <p className="text-[15px] font-bold text-ink mb-1">{title}</p>
      <p className="text-[12px] text-ink-secondary leading-snug">{body}</p>
    </div>
  )

  const firstTraveler = travelerName.split(' ')[0]

  switch (order.status) {
    case 'cancelled':
      return (
        <div className="rounded-[16px] border border-danger/20 bg-danger-light p-5">
          <XCircle size={22} className="text-danger mb-2" />
          <p className="text-[15px] font-bold text-ink mb-1">Your delivery was cancelled</p>
          {order.cancelReason && <p className="text-[12px] text-ink-secondary mb-3">Reason: {order.cancelReason}</p>}
          {isTraveler ? (
            <p className="text-[12px] text-ink-secondary">Your cancellation has been recorded. Frequent cancellations may affect your trust score.</p>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              <Button variant="primary" size="md" className="w-full">Find Another Traveler</Button>
              <Button variant="secondary" size="md" className="w-full">Return to Dashboard</Button>
            </div>
          )}
        </div>
      )

    case 'pending':
      return waiting('Status', 'Awaiting traveler response', `${firstTraveler} typically responds within a few minutes. We'll notify you the moment they accept.`)

    case 'accepted':
      return isTraveler
        ? waiting('Next step', 'Waiting on sender', `${senderName.split(' ')[0]} is securing payment into escrow. You'll be able to arrange pickup once it's held.`)
        : wrap('primary', 'Next Step', 'Secure your payment', 'Hold the carrying fee safely in escrow. Funds release only after OTP delivery confirmation.',
            <Button variant="secondary" size="md" className="w-full text-primary hover:text-primary" trailingIcon={<ArrowRight size={14} />} onClick={onSecurePayment}>Secure Payment</Button>)

    case 'paid':
      return isTraveler
        ? waiting('Next step', 'Awaiting pickup arrangement', `${senderName.split(' ')[0]} secured payment. Coordinate a pickup time and place in chat.`)
        : (
          <div className="rounded-[16px] border border-border bg-white overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border flex items-center gap-2">
              <MapPin size={14} className="text-ink-muted" /><p className="text-[12px] font-bold text-ink uppercase tracking-widest">Pickup</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[13px] font-semibold text-ink">{order.from}</p>
              <p className="text-[12px] text-ink-secondary mt-0.5">{order.pickupAddress}</p>
              <div className="flex items-center justify-between mt-3 text-[12px]">
                <span className="text-ink-muted">Preferred time</span><span className="font-medium text-ink">26 Aug · 6:00 PM</span>
              </div>
              <div className="flex items-center justify-between mt-1.5 mb-3 text-[12px]">
                <span className="text-ink-muted">Status</span><span className="font-medium text-warning">Not arranged</span>
              </div>
              <Button variant="primary" size="md" className="w-full" onClick={onArrangePickup}>Arrange Pickup</Button>
              <Button variant="ghost" size="md" className="w-full mt-1.5" onClick={onDiscuss}>Discuss in Chat</Button>
            </div>
          </div>
        )

    case 'arranged':
      return isTraveler
        ? wrap('coral', 'Your Action', 'Confirm pickup', 'Confirm you have received the parcel from the sender to start the journey.',
            <Button variant="secondary" size="md" className="w-full text-coral hover:text-coral" disabled={busy} onClick={onConfirmPickup} leadingIcon={busy ? <Loader2 size={14} className="animate-spin" /> : undefined}>
              {busy ? 'Confirming…' : 'Confirm Pickup'}
            </Button>)
        : waiting('In progress', 'Pickup arranged', `Waiting for ${firstTraveler} to confirm they've received your parcel.`)

    case 'picked-up':
      return isTraveler
        ? wrap('coral', 'Your Action', 'Start transit', 'Mark the parcel as in transit once you begin your journey.',
            <Button variant="secondary" size="md" className="w-full text-coral hover:text-coral" disabled={busy} onClick={onStartTransit} leadingIcon={busy ? <Loader2 size={14} className="animate-spin" /> : <Plane size={14} />}>
              {busy ? 'Updating…' : 'Start Transit'}
            </Button>)
        : waiting('In progress', 'Parcel picked up', `${firstTraveler} has your parcel and will start transit shortly.`)

    case 'transit':
      return isTraveler
        ? wrap('coral', 'Your Action', 'Reached destination?', 'When you arrive, mark the order ready for delivery to begin OTP confirmation.',
            <Button variant="secondary" size="md" className="w-full text-coral hover:text-coral" onClick={onReadyForDelivery} trailingIcon={<ArrowRight size={14} />}>Ready for Delivery</Button>)
        : waiting('On the way', 'Your parcel is in transit', `${order.from} → ${order.to} with ${firstTraveler}. Estimated arrival ${order.travelDate}.`)

    case 'ready':
      return isTraveler
        ? wrap('coral', 'Final Step', 'Complete delivery', 'Share the delivery code with the receiver and confirm to release your payment.',
            <Button variant="secondary" size="md" className="w-full text-coral hover:text-coral" onClick={onReadyForDelivery} leadingIcon={<KeyRound size={14} />}>Confirm Delivery (OTP)</Button>)
        : wrap('primary', 'Almost there', 'Awaiting delivery confirmation', 'The receiver confirms delivery with a 6-digit code. Payment releases automatically once confirmed.',
            <Button variant="secondary" size="md" className="w-full text-primary hover:text-primary" onClick={onReadyForDelivery} leadingIcon={<KeyRound size={14} />}>Open Delivery Confirmation</Button>)

    case 'completed': {
      const reviewed = isTraveler ? order.reviewedByTraveler : order.reviewedBySender
      return (
        <div className="rounded-[16px] border border-success/25 bg-success-light overflow-hidden">
          <div className="px-5 py-5 text-center">
            <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto mb-2 animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-[16px] font-bold text-ink">Order completed</p>
            <div className="flex justify-center gap-4 mt-3 text-[12px] text-ink-secondary">
              <div><p className="text-ink-muted">Delivered</p><p className="font-semibold text-ink">{order.travelDate}</p></div>
              <div className="border-l border-success/25" />
              <div><p className="text-ink-muted">Payment</p><p className="font-semibold text-success">Released</p></div>
            </div>
            <div className="mt-4">
              {reviewed ? (
                <div className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-success"><CheckCircle2 size={14} /> Review submitted</div>
              ) : (
                <Button variant="primary" size="md" className="w-full" leadingIcon={<Star size={14} />} onClick={onReview}>
                  Review {isTraveler ? senderName.split(' ')[0] : firstTraveler}
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    }
    default:
      return null
  }
}

/* ---- Payment card (persistent) ---- */
function PaymentCard({ order, isTraveler, paid, released, senderTotal, travelerPayout }: {
  order: ActiveOrder; isTraveler: boolean; paid: boolean; released: boolean; senderTotal: number; travelerPayout: number
}) {
  const escrowBadge = released
    ? { label: 'Released', cls: 'bg-success-light text-success' }
    : paid ? { label: 'Secured in Escrow', cls: 'bg-primary-light text-primary' }
    : { label: 'Pending', cls: 'bg-warning-light text-warning' }

  return (
    <div className="rounded-[16px] border border-border bg-white overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border flex items-center gap-2">
        <Wallet size={14} className="text-ink-muted" />
        <p className="text-[12px] font-bold text-ink uppercase tracking-widest">{isTraveler ? 'Expected Earnings' : 'Payment'}</p>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] text-ink-muted">Escrow status</p>
          <span className={`rounded-full text-[11px] font-semibold px-2 py-0.5 transition-colors ${escrowBadge.cls}`}>{escrowBadge.label}</span>
        </div>

        {isTraveler ? (
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex justify-between text-[12px]"><span className="text-ink-muted">Carrying fee</span><span className="font-medium text-ink">৳{order.carryingFee.toLocaleString()}</span></div>
            <div className="flex justify-between text-[12px]"><span className="text-ink-muted">Platform fee</span><span className="font-medium text-ink">-৳{order.serviceFee.toLocaleString()}</span></div>
            <div className="flex justify-between text-[13px] font-bold pt-1.5 border-t border-border mt-0.5">
              <span className="text-ink">{released ? 'Paid out' : 'Expected payout'}</span>
              <span className={released ? 'text-success' : 'text-primary'}>৳{travelerPayout.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex justify-between text-[12px]"><span className="text-ink-muted">Carrying fee</span><span className="font-medium text-ink">৳{order.carryingFee.toLocaleString()}</span></div>
            <div className="flex justify-between text-[12px]"><span className="text-ink-muted">Platform service fee</span><span className="font-medium text-ink">৳{order.serviceFee.toLocaleString()}</span></div>
            <div className="flex justify-between text-[13px] font-bold pt-1.5 border-t border-border mt-0.5">
              <span className="text-ink">Total</span><span className="text-primary">৳{senderTotal.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className={`rounded-[10px] px-3 py-2.5 flex items-start gap-2 text-[11px] ${released ? 'bg-success-light text-ink-secondary' : 'bg-primary-light text-ink-secondary'} border ${released ? 'border-success/15' : 'border-primary/15'}`}>
          <Shield size={12} className={`shrink-0 mt-0.5 ${released ? 'text-success' : 'text-primary'}`} />
          {released
            ? `Payment released to ${order.travelerName.split(' ')[0]} after successful OTP delivery confirmation.`
            : paid ? 'Protected by escrow. Released to the traveler after OTP delivery confirmation.'
            : 'Payment will be held securely in escrow and released after successful delivery confirmation.'}
        </div>
      </div>
    </div>
  )
}

/* ---- Payment modal ---- */
function PaymentModal({ order, senderTotal, onClose, onSecured }: {
  order: ActiveOrder; senderTotal: number; onClose: () => void; onSecured: () => void
}) {
  const [phase, setPhase] = useState<'form' | 'processing' | 'done'>('form')
  function secure() {
    setPhase('processing')
    setTimeout(() => setPhase('done'), 1400)
    setTimeout(onSecured, 2400)
  }
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        {phase === 'form' && (
          <>
            <div className="w-11 h-11 rounded-[12px] bg-primary-light flex items-center justify-center mb-4"><Wallet size={20} className="text-primary" /></div>
            <h2 className="text-[20px] font-bold text-ink mb-1">Secure your payment</h2>
            <p className="text-[13px] text-ink-secondary mb-5">Hold the payment in escrow until delivery is confirmed.</p>
            <div className="rounded-[12px] border border-border divide-y divide-border mb-4">
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-ink-muted">Carrying fee</span><span className="font-medium text-ink">৳{order.carryingFee.toLocaleString()}</span></div>
              <div className="flex justify-between px-4 py-3 text-[13px]"><span className="text-ink-muted">Platform service fee</span><span className="font-medium text-ink">৳{order.serviceFee.toLocaleString()}</span></div>
              <div className="flex justify-between px-4 py-3 text-[15px] font-bold"><span className="text-ink">Total</span><span className="text-primary">৳{senderTotal.toLocaleString()}</span></div>
            </div>
            <div className="rounded-[10px] bg-primary-light border border-primary/15 px-3 py-2.5 flex items-start gap-2 text-[12px] text-ink-secondary mb-5">
              <Shield size={13} className="text-primary shrink-0 mt-0.5" />
              Your payment is held securely in escrow and released to the traveler after successful delivery confirmation.
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={secure}>Secure Payment</Button>
            <Button variant="ghost" size="md" className="w-full mt-2" onClick={onClose}>Back to Order</Button>
          </>
        )}
        {phase === 'processing' && (
          <div className="py-10 text-center">
            <Loader2 size={34} className="text-primary mx-auto mb-4 animate-spin" />
            <p className="text-[15px] font-semibold text-ink">Securing payment…</p>
            <p className="text-[13px] text-ink-muted mt-1">Holding ৳{senderTotal.toLocaleString()} in escrow</p>
          </div>
        )}
        {phase === 'done' && (
          <div className="py-10 text-center animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="w-16 h-16 rounded-full bg-success-light border-2 border-success/25 flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-success" /></div>
            <p className="text-[17px] font-bold text-ink">Payment secured</p>
            <p className="text-[13px] text-ink-secondary mt-1">Your funds are safely held in escrow.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ---- OTP modal ---- */
function OTPModal({ isTraveler, travelerName, payout, onClose, onConfirmed }: {
  isTraveler: boolean; travelerName: string; payout: number; onClose: () => void; onConfirmed: () => void
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState(false)
  const [phase, setPhase] = useState<'entry' | 'confirmed' | 'releasing' | 'released'>('entry')
  const [hint, setHint] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function setDigit(i: number, v: string) {
    const c = v.replace(/\D/g, '').slice(-1)
    setError(false)
    setDigits(prev => { const n = [...prev]; n[i] = c; return n })
    if (c && i < 5) refs.current[i + 1]?.focus()
  }
  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }
  function confirm() {
    const code = digits.join('')
    if (code.length < 6) { setError(true); return }
    if (code !== DEMO_OTP) { setError(true); setDigits(Array(6).fill('')); refs.current[0]?.focus(); return }
    setPhase('confirmed')
    setTimeout(() => setPhase('releasing'), 1100)
    setTimeout(() => setPhase('released'), 2600)
    setTimeout(onConfirmed, 3600)
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        {phase === 'entry' && (
          <>
            <div className="w-11 h-11 rounded-[12px] bg-coral-light flex items-center justify-center mb-4"><KeyRound size={20} className="text-coral" /></div>
            <h2 className="text-[20px] font-bold text-ink mb-1">Confirm your delivery</h2>
            <p className="text-[13px] text-ink-secondary mb-5">Ask the traveler for the 6-digit delivery code and enter it below.</p>

            {isTraveler && (
              <div className="rounded-[10px] bg-coral-light border border-coral/20 px-3 py-2.5 mb-4">
                <p className="text-[11px] font-semibold text-coral uppercase tracking-widest mb-1">Read this code to the receiver</p>
                <p className="text-[22px] font-bold text-ink tracking-[0.3em] text-center">{DEMO_OTP}</p>
              </div>
            )}

            <div className="flex justify-center gap-2 mb-2">
              {digits.map((d, i) => (
                <input key={i} ref={el => { refs.current[i] = el }} value={d} inputMode="numeric" maxLength={1}
                  onChange={e => setDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className={`w-11 h-14 text-center text-[22px] font-bold rounded-[10px] border bg-white text-ink outline-none transition-all ${
                    error ? 'border-danger ring-2 ring-danger/15' : 'border-border focus:border-coral focus:ring-2 focus:ring-coral/15'}`} />
              ))}
            </div>
            {error && <p className="text-[12px] text-danger text-center mb-2 flex items-center justify-center gap-1"><AlertTriangle size={12} /> That code doesn't match.</p>}

            <Button variant="coral" size="lg" className="w-full mt-3" onClick={confirm}>Confirm Delivery</Button>
            <div className="flex items-center justify-between mt-3">
              <button className="text-[12px] text-ink-muted hover:text-ink transition-colors" onClick={() => { setDigits(Array(6).fill('')); setError(false) }}>
                {error ? 'Request new code' : "I didn't receive a code"}
              </button>
              {!isTraveler && (
                <button className="text-[11px] text-ink-muted/70 hover:text-ink-muted transition-colors" onClick={() => setHint(h => !h)}>
                  Prototype hint
                </button>
              )}
            </div>
            {hint && !isTraveler && <p className="text-[11px] text-ink-muted mt-2 text-center">Demo code for this prototype: <strong>{DEMO_OTP}</strong></p>}
          </>
        )}

        {phase !== 'entry' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success-light border-2 border-success/25 flex items-center justify-center mx-auto mb-4 animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
              {phase === 'releasing' ? <Loader2 size={30} className="text-success animate-spin" /> : <CheckCircle2 size={32} className="text-success" />}
            </div>
            <p className="text-[17px] font-bold text-ink">
              {phase === 'confirmed' ? 'Delivery confirmed' : phase === 'releasing' ? 'Escrow releasing…' : 'Payment released'}
            </p>
            <p className="text-[13px] text-ink-secondary mt-1">
              {phase === 'confirmed' ? 'Your parcel has been successfully delivered.'
                : phase === 'releasing' ? 'Releasing funds from escrow.'
                : `৳${payout.toLocaleString()} has been released to ${travelerName.split(' ')[0]}'s earnings.`}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ---- Review modal ---- */
function ReviewModal({ isTraveler, counterpart, onClose, onSubmitted }: {
  isTraveler: boolean; counterpart: string; onClose: () => void; onSubmitted: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [error, setError] = useState(false)
  const [phase, setPhase] = useState<'form' | 'submitting' | 'done'>('form')
  const first = counterpart.split(' ')[0]

  function submit() {
    if (rating === 0) { setError(true); return }
    setPhase('submitting')
    setTimeout(() => setPhase('done'), 1000)
    setTimeout(onSubmitted, 1900)
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        {phase === 'form' && (
          <>
            <h2 className="text-[20px] font-bold text-ink mb-1">How was your experience with {first}?</h2>
            <p className="text-[13px] text-ink-secondary mb-5">Your honest review keeps the BringBuddy community trustworthy.</p>
            <div className="flex justify-center gap-2 mb-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => { setRating(n); setError(false) }} onMouseEnter={() => setHover(n)} aria-label={`${n} star`}>
                  <Star size={34} strokeWidth={1.5}
                    className={`transition-all ${(hover || rating) >= n ? 'fill-warning text-warning scale-110' : 'text-border'}`} />
                </button>
              ))}
            </div>
            {error && <p className="text-[12px] text-danger text-center mb-2">Please select a rating.</p>}
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Tell us about your experience."
              className="w-full mt-4 rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none" />
            <Button variant="primary" size="lg" className="w-full mt-4" onClick={submit}>Submit Review</Button>
            <Button variant="ghost" size="md" className="w-full mt-2" onClick={onClose}>Skip for now</Button>
          </>
        )}
        {phase === 'submitting' && (
          <div className="py-10 text-center"><Loader2 size={32} className="text-primary mx-auto mb-4 animate-spin" /><p className="text-[15px] font-semibold text-ink">Submitting review…</p></div>
        )}
        {phase === 'done' && (
          <div className="py-8 text-center animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="w-16 h-16 rounded-full bg-success-light border-2 border-success/25 flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-success" /></div>
            <p className="text-[17px] font-bold text-ink">Review submitted</p>
            <p className="text-[13px] text-ink-secondary mt-1 mb-4">Thanks for helping keep BringBuddy trustworthy.</p>
            {isTraveler ? (
              <div className="rounded-[12px] border border-border bg-divider px-4 py-3 text-left text-[12px]">
                <p className="font-semibold text-ink mb-1.5">Sender reputation</p>
                <div className="flex justify-between"><span className="text-ink-muted">Rating</span><span className="font-medium text-ink">4.7 → 4.7</span></div>
              </div>
            ) : (
              <div className="rounded-[12px] border border-border bg-divider px-4 py-3 text-left text-[12px]">
                <p className="font-semibold text-ink mb-1.5">Traveler reputation</p>
                <div className="flex justify-between mb-1"><span className="text-ink-muted">Rating</span><span className="font-medium text-ink">4.9 → 4.9</span></div>
                <div className="flex justify-between mb-1"><span className="text-ink-muted">Completed deliveries</span><span className="font-medium text-success">42 → 43</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Trust level</span><span className="font-medium text-ink">High Trust</span></div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ---- Cancel modal ---- */
const CANCEL_REASONS = ['Changed my plans', 'Traveler unavailable', 'Unable to meet pickup', 'Item no longer needed', 'Other']
function CancelModal({ warn, onClose, onCancelled }: { warn: boolean; onClose: () => void; onCancelled: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [phase, setPhase] = useState<'form' | 'processing'>('form')
  function proceed() {
    if (!reason) return
    setPhase('processing')
    setTimeout(() => onCancelled(reason), 900)
  }
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        {phase === 'form' ? (
          <>
            <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center mb-4 ${warn ? 'bg-danger-light' : 'bg-warning-light'}`}>
              <AlertTriangle size={20} className={warn ? 'text-danger' : 'text-warning'} />
            </div>
            <h2 className="text-[20px] font-bold text-ink mb-1">Cancel this delivery?</h2>
            <p className="text-[13px] text-ink-secondary mb-4">
              {warn
                ? 'This parcel has already been picked up. Cancelling now strongly affects the other participant and may apply a trust penalty. Support may need to get involved.'
                : 'Cancellation may affect the other participant and could result in a trust/reputation penalty depending on the situation.'}
            </p>
            <p className="text-[12px] font-semibold text-ink mb-2">Reason</p>
            <div className="flex flex-col gap-2 mb-5">
              {CANCEL_REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`flex items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[13px] text-left transition-all ${
                    reason === r ? 'border-primary bg-primary-light text-primary font-medium' : 'border-border text-ink-secondary hover:border-primary/30'}`}>
                  <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${reason === r ? 'border-primary' : 'border-border'}`}>
                    {reason === r && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  {r}
                </button>
              ))}
            </div>
            <Button variant="danger" size="lg" className="w-full" disabled={!reason} onClick={proceed}>Continue</Button>
            <Button variant="ghost" size="md" className="w-full mt-2" onClick={onClose}>Keep Order</Button>
          </>
        ) : (
          <div className="py-10 text-center"><Loader2 size={32} className="text-danger mx-auto mb-4 animate-spin" /><p className="text-[15px] font-semibold text-ink">Cancelling order…</p></div>
        )}
      </div>
    </Modal>
  )
}

/* ---- Dispute modal ---- */
const DISPUTE_TYPES = ['Delivery issue', 'Payment issue', 'Damaged item', 'Missing item', 'Traveler/sender issue', 'Other']
function DisputeModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [type, setType] = useState('')
  const [desc, setDesc] = useState('')
  const [error, setError] = useState(false)
  const [phase, setPhase] = useState<'form' | 'processing' | 'done'>('form')
  function submit() {
    if (!type || !desc.trim()) { setError(true); return }
    setPhase('processing')
    setTimeout(() => setPhase('done'), 1000)
    setTimeout(onSubmitted, 2000)
  }
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        {phase === 'form' && (
          <>
            <div className="w-11 h-11 rounded-[12px] bg-danger-light flex items-center justify-center mb-4"><ShieldAlert size={20} className="text-danger" /></div>
            <h2 className="text-[20px] font-bold text-ink mb-1">Need help with this order?</h2>
            <p className="text-[13px] text-ink-secondary mb-4">Tell us what happened. BringBuddy support can review the order history and evidence.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {DISPUTE_TYPES.map(t => (
                <button key={t} onClick={() => { setType(t); setError(false) }}
                  className={`rounded-[10px] border px-3 py-2.5 text-[12px] text-left transition-all ${type === t ? 'border-primary bg-primary-light text-primary font-medium' : 'border-border text-ink-secondary hover:border-primary/30'}`}>
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[12px] font-semibold text-ink mb-2">Describe what happened</p>
            <textarea value={desc} onChange={e => { setDesc(e.target.value); setError(false) }} rows={3} placeholder="Add as much detail as you can."
              className="w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none mb-3" />
            <div className="rounded-[10px] border border-dashed border-border px-3.5 py-3 mb-4">
              <p className="text-[12px] font-semibold text-ink mb-2">Evidence</p>
              <div className="flex items-center gap-2 text-[12px] text-ink-secondary mb-2"><Paperclip size={13} className="text-primary" /> package-photo.jpg</div>
              <button className="flex items-center gap-1.5 text-[12px] text-primary font-medium hover:gap-2.5 transition-all"><Plus size={13} /> Add evidence</button>
            </div>
            {error && <p className="text-[12px] text-danger mb-2">Please choose an issue and describe what happened.</p>}
            <Button variant="primary" size="lg" className="w-full" onClick={submit}>Continue</Button>
          </>
        )}
        {phase === 'processing' && (
          <div className="py-10 text-center"><Loader2 size={32} className="text-primary mx-auto mb-4 animate-spin" /><p className="text-[15px] font-semibold text-ink">Submitting dispute…</p></div>
        )}
        {phase === 'done' && (
          <div className="py-8 text-center animate-[bb-rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="w-16 h-16 rounded-full bg-warning-light border-2 border-warning/25 flex items-center justify-center mx-auto mb-4"><ShieldAlert size={30} className="text-warning" /></div>
            <p className="text-[17px] font-bold text-ink">Your dispute has been submitted</p>
            <p className="text-[13px] text-ink-secondary mt-1">Status: <strong className="text-warning">Under Review</strong></p>
            <p className="text-[12px] text-ink-muted mt-2">Our support team will review the order history and evidence and get back to you.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
