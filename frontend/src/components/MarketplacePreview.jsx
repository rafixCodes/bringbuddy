import { MapPin, Calendar, Weight, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Rating, SectionHeader } from './ui'

const listings = [
  { name: 'Rahim Ahmed', initials: 'RA', route: 'Dhaka → London', date: '28 Aug 2026', capacity: '8 kg', price: '৳450/kg', rating: 4.9, deliveries: 27 },
  { name: 'Sadia Karim', initials: 'SK', route: 'Dhaka → Dubai', date: '30 Aug 2026', capacity: '5 kg', price: '৳380/kg', rating: 4.8, deliveries: 19 },
  { name: 'Tanvir Hasan', initials: 'TH', route: 'Dhaka → Toronto', date: '02 Sep 2026', capacity: '12 kg', price: '৳620/kg', rating: 5.0, deliveries: 41 },
  { name: 'Nabila Rahman', initials: 'NR', route: 'Dhaka → New York', date: '05 Sep 2026', capacity: '7 kg', price: '৳700/kg', rating: 4.7, deliveries: 12 },
]

function TravelerCard({ t, delay, onView }) {
  return (
    <div className={`bb-reveal ${delay} group flex h-full flex-col rounded-[12px] border border-border bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[var(--shadow-e2)]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={t.initials} verified size={44} />
          <div>
            <div className="text-[15px] font-semibold text-ink">{t.name}</div>
            <Badge tone="verified" label="Verified Traveler" />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-divider pt-4 text-[14px]">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <MapPin size={15} className="text-primary" /> {t.route}
        </div>
        <div className="flex items-center gap-2 text-ink-secondary">
          <Calendar size={15} className="text-ink-muted" /> {t.date}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-2 text-ink-secondary">
            <Weight size={15} className="text-ink-muted" /> {t.capacity} available
          </span>
          <span className="font-semibold text-ink">{t.price}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-divider pt-3">
        <Rating value={t.rating} />
        <span className="text-[13px] text-ink-muted">{t.deliveries} deliveries</span>
      </div>

      <Button variant="secondary" className="mt-4 w-full justify-center group-hover:border-primary/40" trailingIcon={<ArrowRight size={16} />} onClick={onView}>
        View Trip
      </Button>
    </div>
  )
}

export function MarketplacePreview() {
  const navigate = useNavigate()
  // These are sample/demo listings, not real trip data (Feature 3/6 aren't
  // built yet — see site map). "View Trip" sends a logged-out visitor to
  // register rather than a real trip detail page that doesn't exist yet.
  const handleView = () => navigate('/register')

  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="bb-reveal flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader
            align="left"
            eyebrow="Marketplace"
            title="Travelers are already going your way."
            subtitle="A live preview of the BringBuddy marketplace. Filter by route, date, capacity and reputation to find your match."
          />
          <span className="shrink-0 rounded-full bg-primary-light px-3 py-1 text-[12px] font-medium text-primary">
            Sample listings
          </span>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((t, i) => (
            <TravelerCard key={t.name} t={t} delay={`bb-delay-${i + 1}`} onView={handleView} />
          ))}
        </div>
      </div>
    </section>
  )
}
