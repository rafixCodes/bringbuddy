export interface Traveler {
  id: string
  name: string
  avatar: string
  initials: string
  verified: boolean
  trustLevel: 'High Trust' | 'Trusted' | 'New'
  rating: number
  completedDeliveries: number
  cancellationRate: string
  responseTime: string
  memberSince: string
  defaultFee: number
  bio: string
}

export interface Trip {
  id: string
  travelerId: string
  from: string
  fromCity: string
  to: string
  toCity: string
  date: string
  departISO: string
  capacityKg: number
  usedKg: number
  feePerKg: number
  allowedCategories: string[]
}

export const TRAVELERS: Traveler[] = [
  {
    id: 't1',
    name: 'Aisha Rahman',
    avatar: '',
    initials: 'AR',
    verified: true,
    trustLevel: 'High Trust',
    rating: 4.9,
    completedDeliveries: 42,
    cancellationRate: '2%',
    responseTime: '~15 min',
    memberSince: 'March 2025',
    defaultFee: 450,
    bio: 'Frequent UK–BD traveller. I fly Dhaka–London several times a year for work and am happy to carry parcels on my return.',
  },
  {
    id: 't2',
    name: 'Karim Hossain',
    avatar: '',
    initials: 'KH',
    verified: true,
    trustLevel: 'High Trust',
    rating: 4.8,
    completedDeliveries: 28,
    cancellationRate: '0%',
    responseTime: '~30 min',
    memberSince: 'January 2025',
    defaultFee: 480,
    bio: 'PhD student in London, travelling between Dhaka and London regularly. Reliable and on-time.',
  },
  {
    id: 't3',
    name: 'Priya Nair',
    avatar: '',
    initials: 'PN',
    verified: true,
    trustLevel: 'Trusted',
    rating: 4.7,
    completedDeliveries: 15,
    cancellationRate: '5%',
    responseTime: '~1 hr',
    memberSince: 'June 2025',
    defaultFee: 420,
    bio: 'Based in London, visiting family in Dhaka seasonally. Happy to help out fellow BringBuddy members.',
  },
  {
    id: 't4',
    name: 'Syed Imran',
    avatar: '',
    initials: 'SI',
    verified: true,
    trustLevel: 'Trusted',
    rating: 4.6,
    completedDeliveries: 9,
    cancellationRate: '3%',
    responseTime: '~45 min',
    memberSince: 'September 2025',
    defaultFee: 400,
    bio: 'Business traveller between Dhaka and London. Reliable and communicative.',
  },
  {
    id: 't5',
    name: 'Nadia Sultana',
    avatar: '',
    initials: 'NS',
    verified: false,
    trustLevel: 'New',
    rating: 4.5,
    completedDeliveries: 3,
    cancellationRate: '0%',
    responseTime: '~2 hr',
    memberSince: 'November 2025',
    defaultFee: 380,
    bio: 'New to BringBuddy but experienced with international travel. Looking to help out.',
  },
  {
    id: 't6',
    name: 'Farhan Chowdhury',
    avatar: '',
    initials: 'FC',
    verified: true,
    trustLevel: 'Trusted',
    rating: 4.7,
    completedDeliveries: 18,
    cancellationRate: '4%',
    responseTime: '~40 min',
    memberSince: 'February 2025',
    defaultFee: 460,
    bio: 'Software engineer splitting time between Dhaka and New York. Travel every couple of months.',
  },
  {
    id: 't7',
    name: 'Meherun Nesa',
    avatar: '',
    initials: 'MN',
    verified: true,
    trustLevel: 'High Trust',
    rating: 4.9,
    completedDeliveries: 35,
    cancellationRate: '1%',
    responseTime: '~20 min',
    memberSince: 'April 2025',
    defaultFee: 320,
    bio: 'Cabin crew on Gulf routes. Dhaka–Dubai almost every week, plenty of spare allowance.',
  },
  {
    id: 't8',
    name: 'Tanvir Alam',
    avatar: '',
    initials: 'TA',
    verified: false,
    trustLevel: 'New',
    rating: 4.3,
    completedDeliveries: 2,
    cancellationRate: '0%',
    responseTime: '~3 hr',
    memberSince: 'December 2025',
    defaultFee: 300,
    bio: 'Just joined. Regular Dhaka–Dubai trips for family, happy to take small parcels.',
  },
  {
    id: 't9',
    name: 'Rownak Jahan',
    avatar: '',
    initials: 'RJ',
    verified: true,
    trustLevel: 'Trusted',
    rating: 4.6,
    completedDeliveries: 12,
    cancellationRate: '6%',
    responseTime: '~1 hr',
    memberSince: 'August 2025',
    defaultFee: 440,
    bio: 'Masters student in London. Fly home to Dhaka twice a year and carry parcels both ways.',
  },
  {
    id: 't10',
    name: 'Shahriar Kabir',
    avatar: '',
    initials: 'SK',
    verified: true,
    trustLevel: 'High Trust',
    rating: 4.8,
    completedDeliveries: 31,
    cancellationRate: '2%',
    responseTime: '~25 min',
    memberSince: 'May 2025',
    defaultFee: 495,
    bio: 'Import business owner. Frequent Toronto and Dubai routes with large luggage allowance.',
  },
]

export const TRIPS: Trip[] = [
  {
    id: 'tr1', travelerId: 't1',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'LHR', toCity: 'London',
    date: '28 Aug 2026', departISO: '2026-08-28',
    capacityKg: 8, usedKg: 2,
    feePerKg: 450,
    allowedCategories: ['Documents', 'Clothing', 'Small Electronics', 'Food items'],
  },
  {
    id: 'tr2', travelerId: 't2',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'LHR', toCity: 'London',
    date: '1 Sep 2026', departISO: '2026-09-01',
    capacityKg: 10, usedKg: 4,
    feePerKg: 480,
    allowedCategories: ['Documents', 'Clothing', 'Cosmetics'],
  },
  {
    id: 'tr3', travelerId: 't3',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'LHR', toCity: 'London',
    date: '5 Sep 2026', departISO: '2026-09-05',
    capacityKg: 6, usedKg: 1,
    feePerKg: 420,
    allowedCategories: ['Documents', 'Clothing', 'Gifts'],
  },
  {
    id: 'tr4', travelerId: 't4',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'LHR', toCity: 'London',
    date: '12 Sep 2026', departISO: '2026-09-12',
    capacityKg: 7, usedKg: 0,
    feePerKg: 400,
    allowedCategories: ['Documents', 'Clothing', 'Small Electronics', 'Books'],
  },
  {
    id: 'tr5', travelerId: 't5',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'LHR', toCity: 'London',
    date: '18 Sep 2026', departISO: '2026-09-18',
    capacityKg: 5, usedKg: 0,
    feePerKg: 380,
    allowedCategories: ['Documents', 'Clothing'],
  },
  {
    id: 'tr6', travelerId: 't7',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'DXB', toCity: 'Dubai',
    date: '30 Aug 2026', departISO: '2026-08-30',
    capacityKg: 12, usedKg: 3,
    feePerKg: 320,
    allowedCategories: ['Documents', 'Clothing', 'Cosmetics', 'Gifts'],
  },
  {
    id: 'tr7', travelerId: 't6',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'JFK', toCity: 'New York',
    date: '3 Sep 2026', departISO: '2026-09-03',
    capacityKg: 9, usedKg: 2,
    feePerKg: 620,
    allowedCategories: ['Documents', 'Clothing', 'Small Electronics'],
  },
  {
    id: 'tr8', travelerId: 't10',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'YYZ', toCity: 'Toronto',
    date: '9 Sep 2026', departISO: '2026-09-09',
    capacityKg: 11, usedKg: 4,
    feePerKg: 580,
    allowedCategories: ['Documents', 'Clothing', 'Gifts', 'Books'],
  },
  {
    id: 'tr9', travelerId: 't9',
    from: 'LHR', fromCity: 'London',
    to: 'DAC', toCity: 'Dhaka',
    date: '2 Sep 2026', departISO: '2026-09-02',
    capacityKg: 8, usedKg: 0,
    feePerKg: 440,
    allowedCategories: ['Documents', 'Clothing', 'Cosmetics', 'Small Electronics'],
  },
  {
    id: 'tr10', travelerId: 't1',
    from: 'LHR', fromCity: 'London',
    to: 'DAC', toCity: 'Dhaka',
    date: '14 Sep 2026', departISO: '2026-09-14',
    capacityKg: 10, usedKg: 2,
    feePerKg: 470,
    allowedCategories: ['Documents', 'Clothing', 'Gifts'],
  },
  {
    id: 'tr11', travelerId: 't8',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'DXB', toCity: 'Dubai',
    date: '22 Sep 2026', departISO: '2026-09-22',
    capacityKg: 6, usedKg: 0,
    feePerKg: 300,
    allowedCategories: ['Documents', 'Clothing'],
  },
  {
    id: 'tr12', travelerId: 't2',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'FRA', toCity: 'Frankfurt',
    date: '7 Sep 2026', departISO: '2026-09-07',
    capacityKg: 7, usedKg: 1,
    feePerKg: 540,
    allowedCategories: ['Documents', 'Clothing', 'Books'],
  },
  {
    id: 'tr13', travelerId: 't7',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'SYD', toCity: 'Sydney',
    date: '25 Sep 2026', departISO: '2026-09-25',
    capacityKg: 9, usedKg: 0,
    feePerKg: 700,
    allowedCategories: ['Documents', 'Clothing', 'Gifts'],
  },
  {
    id: 'tr14', travelerId: 't10',
    from: 'DXB', fromCity: 'Dubai',
    to: 'DAC', toCity: 'Dhaka',
    date: '16 Sep 2026', departISO: '2026-09-16',
    capacityKg: 10, usedKg: 3,
    feePerKg: 330,
    allowedCategories: ['Documents', 'Clothing', 'Cosmetics', 'Small Electronics'],
  },
  {
    id: 'tr15', travelerId: 't3',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'CDG', toCity: 'Paris',
    date: '20 Sep 2026', departISO: '2026-09-20',
    capacityKg: 6, usedKg: 1,
    feePerKg: 560,
    allowedCategories: ['Documents', 'Clothing', 'Gifts'],
  },
  {
    id: 'tr16', travelerId: 't6',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'LHR', toCity: 'London',
    date: '8 Sep 2026', departISO: '2026-09-08',
    capacityKg: 9, usedKg: 3,
    feePerKg: 460,
    allowedCategories: ['Documents', 'Clothing', 'Cosmetics', 'Books'],
  },
  {
    id: 'tr17', travelerId: 't9',
    from: 'DAC', fromCity: 'Dhaka',
    to: 'LHR', toCity: 'London',
    date: '24 Sep 2026', departISO: '2026-09-24',
    capacityKg: 7, usedKg: 0,
    feePerKg: 440,
    allowedCategories: ['Documents', 'Clothing', 'Small Electronics'],
  },
]

export interface Order {
  id: string
  type: 'carry-only' | 'shopping-request'
  bookingMethod: 'direct' | 'marketplace'
  status: 'pending' | 'accepted' | 'pickup' | 'transit' | 'delivered' | 'completed'
  senderId: string
  senderName: string
  travelerId: string
  travelerName: string
  tripId: string
  from: string
  to: string
  travelDate: string
  itemDescription: string
  weightKg: number
  pickupAddress: string
  receiverName: string
  receiverPhone: string
  specialInstructions: string
  carryingFee: number
  serviceFee: number
  createdAt: string
  productUrl?: string
  quantity?: number
  budget?: number
}

export const RESTRICTED_ITEMS = [
  'weapon', 'gun', 'knife', 'explosive', 'bomb', 'drug', 'narcotics',
  'cash', 'currency', 'money', 'alcohol', 'liquid', 'flammable', 'battery',
  'lithium', 'radioactive', 'animal', 'plant', 'food', 'medicine', 'prescription',
]

export function checkRestrictedItem(description: string): string | null {
  const lower = description.toLowerCase()
  for (const item of RESTRICTED_ITEMS) {
    if (lower.includes(item)) {
      const messages: Record<string, string> = {
        weapon: 'Weapons and dangerous items cannot be carried.',
        gun: 'Firearms and weapons cannot be carried.',
        knife: 'Sharp weapons are not permitted.',
        explosive: 'Explosives and hazardous materials cannot be carried.',
        bomb: 'Explosives and hazardous materials cannot be carried.',
        drug: 'Controlled substances are strictly prohibited.',
        narcotics: 'Controlled substances are strictly prohibited.',
        cash: 'Large amounts of cash or negotiable instruments are not permitted.',
        currency: 'Large amounts of cash or negotiable instruments are not permitted.',
        money: 'Large amounts of cash or negotiable instruments are not permitted.',
        alcohol: 'Alcohol may be restricted depending on destination regulations.',
        liquid: 'Liquids above 100ml in carry-on are not permitted by airline.',
        flammable: 'Flammable materials cannot be carried.',
        battery: 'Loose lithium batteries may be restricted — check airline policy.',
        lithium: 'Loose lithium batteries may be restricted — check airline policy.',
        radioactive: 'Radioactive materials are strictly prohibited.',
        animal: 'Live animals cannot be carried through BringBuddy.',
        plant: 'Plants and seeds may be restricted at customs.',
        food: 'Certain food items may be restricted at destination customs.',
        medicine: 'Prescription medicines require documentation — contact us first.',
        prescription: 'Prescription medicines require documentation — contact us first.',
      }
      return messages[item] ?? 'This item type may be restricted. Please contact support.'
    }
  }
  return null
}

export function getTravelerById(id: string) {
  return TRAVELERS.find(t => t.id === id) ?? TRAVELERS[0]
}

export function getTripsByTraveler(travelerId: string) {
  return TRIPS.filter(t => t.travelerId === travelerId)
}

export function getTripById(id: string) {
  return TRIPS.find(t => t.id === id) ?? TRIPS[0]
}

export function calcFees(weightKg: number, feePerKg: number) {
  const carryingFee = Math.round(weightKg * feePerKg)
  const serviceFee  = Math.round(carryingFee * 0.08)
  const total       = carryingFee + serviceFee
  return { carryingFee, serviceFee, total }
}

export type TrustLevel = Traveler['trustLevel']

export type TripSortKey =
  | 'best-match'
  | 'lowest-price'
  | 'highest-rating'
  | 'earliest'
  | 'most-capacity'

export interface TripSearchCriteria {
  from: string
  to: string
  date: string
  minCapacity: number
  maxFee: number
  minRating: number
  verifiedOnly: boolean
  trustLevels: TrustLevel[]
  sort: TripSortKey
}

export interface TripSearchResult {
  trip: Trip
  traveler: Traveler
  availableKg: number
  score: number
  daysAfterPreferred: number
}

export const TRIP_CITIES = Array.from(
  new Set(TRIPS.flatMap(t => [t.fromCity, t.toCity]))
).sort()

export const TRUST_LEVELS: TrustLevel[] = ['High Trust', 'Trusted', 'New']

const TRUST_SCORE: Record<TrustLevel, number> = {
  'High Trust': 20,
  'Trusted': 12,
  'New': 4,
}

export function formatPostedAgo(hours: number) {
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export function daysApart(a: string, b: string) {
  const start = new Date(a).getTime()
  const end = new Date(b).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return Number.POSITIVE_INFINITY
  return Math.abs(Math.round((end - start) / 86400000))
}

function daysBetween(fromISO: string, toISO: string) {
  const start = Date.parse(fromISO)
  const end = Date.parse(toISO)
  if (Number.isNaN(start) || Number.isNaN(end)) return 0
  return Math.max(0, Math.round((end - start) / 86400000))
}

function matchScore(traveler: Traveler, trip: Trip, availableKg: number, daysAfterPreferred: number) {
  let score = traveler.rating * 10
  score += TRUST_SCORE[traveler.trustLevel]
  if (traveler.verified) score += 10
  score += Math.min(traveler.completedDeliveries, 40) / 4
  score += Math.min(availableKg, 10)
  score += Math.max(0, 10 - daysAfterPreferred / 3)
  score -= trip.feePerKg / 100
  return Math.round(score * 10) / 10
}

function sortResults(results: TripSearchResult[], sort: TripSortKey) {
  const sorted = [...results]
  switch (sort) {
    case 'lowest-price':
      return sorted.sort((a, b) => a.trip.feePerKg - b.trip.feePerKg)
    case 'highest-rating':
      return sorted.sort((a, b) => b.traveler.rating - a.traveler.rating)
    case 'earliest':
      return sorted.sort((a, b) => a.trip.departISO.localeCompare(b.trip.departISO))
    case 'most-capacity':
      return sorted.sort((a, b) => b.availableKg - a.availableKg)
    default:
      return sorted.sort((a, b) => b.score - a.score)
  }
}

export function searchTrips(criteria: TripSearchCriteria): TripSearchResult[] {
  const results: TripSearchResult[] = []

  for (const trip of TRIPS) {
    const traveler = TRAVELERS.find(t => t.id === trip.travelerId)
    if (!traveler) continue
    if (criteria.from && trip.fromCity !== criteria.from) continue
    if (criteria.to && trip.toCity !== criteria.to) continue
    if (criteria.date && trip.departISO < criteria.date) continue

    const availableKg = trip.capacityKg - trip.usedKg
    if (availableKg < criteria.minCapacity) continue
    if (trip.feePerKg > criteria.maxFee) continue
    if (traveler.rating < criteria.minRating) continue
    if (criteria.verifiedOnly && !traveler.verified) continue
    if (criteria.trustLevels.length > 0 && !criteria.trustLevels.includes(traveler.trustLevel)) continue

    const daysAfterPreferred = daysBetween(criteria.date, trip.departISO)
    results.push({
      trip,
      traveler,
      availableKg,
      daysAfterPreferred,
      score: matchScore(traveler, trip, availableKg, daysAfterPreferred),
    })
  }

  return sortResults(results, criteria.sort)
}
