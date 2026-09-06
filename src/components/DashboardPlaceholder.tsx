import { Package, Plane, Plus, ArrowRight, Search } from 'lucide-react'
import { Button } from './ui'
import { AuthNavbar } from './AuthNavbar'
import { useRouter } from '../lib/router'

export function DashboardPlaceholder() {
  const { user, navigate } = useRouter()
  const isTraveler = user?.mode === 'traveler'

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-28 pb-20">
        {/* Welcome header */}
        <div className="mb-10 animate-[bb-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${isTraveler ? 'bg-coral-light' : 'bg-primary-light'}`}>
              {isTraveler ? <Plane size={20} className="text-coral" /> : <Package size={20} className="text-primary" />}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest">
                {isTraveler ? 'Traveler Dashboard' : 'Sender Dashboard'}
              </p>
            </div>
          </div>
          <h1 className="text-[32px] font-bold text-ink tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-[15px] text-ink-secondary mt-1">
            {isTraveler
              ? 'Post your trip and start earning from your spare luggage space.'
              : 'Find a verified traveler and send your parcel securely.'}
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {(isTraveler ? [
            { icon: <Plus size={20} className="text-coral" />, bg: 'bg-coral-light', title: 'Post a Trip', desc: 'List your upcoming route and available weight.' },
            { icon: <Search size={20} className="text-primary" />, bg: 'bg-primary-light', title: 'Browse Requests', desc: 'Find delivery requests that match your route.' },
            { icon: <Package size={20} className="text-ink-secondary" />, bg: 'bg-divider', title: 'Active Orders', desc: 'Manage your current delivery commitments.' },
          ] : [
            { icon: <Plus size={20} className="text-primary" />, bg: 'bg-primary-light', title: 'New Delivery', desc: 'Create a delivery request or shopping request.' },
            { icon: <Search size={20} className="text-primary" />, bg: 'bg-primary-light', title: 'Find Travelers', desc: 'Browse verified travelers going your route.' },
            { icon: <Package size={20} className="text-ink-secondary" />, bg: 'bg-divider', title: 'My Orders', desc: 'Track your active and completed deliveries.' },
          ]).map(card => (
            <div key={card.title} className="rounded-[16px] border border-border bg-white p-5 hover:shadow-[var(--shadow-e2)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
              <div className={`w-10 h-10 rounded-[10px] ${card.bg} flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <p className="text-[15px] font-semibold text-ink mb-1">{card.title}</p>
              <p className="text-[13px] text-ink-secondary leading-snug">{card.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[12px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Coming soon <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon notice */}
        <div className="rounded-[20px] border-2 border-dashed border-border bg-white px-8 py-10 text-center">
          <div className={`w-14 h-14 rounded-[16px] ${isTraveler ? 'bg-coral-light' : 'bg-primary-light'} flex items-center justify-center mx-auto mb-4`}>
            {isTraveler ? <Plane size={26} className="text-coral" /> : <Package size={26} className="text-primary" />}
          </div>
          <h2 className="text-[20px] font-bold text-ink mb-2">
            {isTraveler ? 'Traveler Dashboard' : 'Sender Dashboard'} — Coming in Batch 3
          </h2>
          <p className="text-[14px] text-ink-secondary max-w-md mx-auto mb-6 leading-relaxed">
            The full dashboard — trip management, marketplace, order hub, payment, tracking, and more — will be built in the next batch.
          </p>
          {!isTraveler && (
            <Button variant="secondary" size="lg" onClick={() => navigate('mode-selection')}>
              Switch to Traveler Mode
            </Button>
          )}
          {isTraveler && user?.verificationStatus === 'none' && (
            <Button variant="coral" size="lg" onClick={() => navigate('verification-intro')}>
              Complete Verification
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
