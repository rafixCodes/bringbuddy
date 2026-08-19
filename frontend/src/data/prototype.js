/* ============================================================
   BringBuddy Prototype Data
   DUMMY DATA — replace with real API calls once Trip Management (Feature 3)
   and Order Management (Features 4/5/9) are built on the backend.
   ============================================================ */

export const TRAVELERS = [
  {
    id: 't1', name: 'Aisha Rahman', avatar: '', initials: 'AR',
    verified: true, trustLevel: 'High Trust', rating: 4.9,
    completedDeliveries: 42, cancellationRate: '2%', responseTime: '~15 min',
    memberSince: 'March 2025', defaultFee: 450,
    bio: 'Frequent UK–BD traveller. I fly Dhaka–London several times a year for work and am happy to carry parcels on my return.',
  },
  {
    id: 't2', name: 'Karim Hossain', avatar: '', initials: 'KH',
    verified: true, trustLevel: 'High Trust', rating: 4.8,
    completedDeliveries: 28, cancellationRate: '0%', responseTime: '~30 min',
    memberSince: 'January 2025', defaultFee: 480,
    bio: 'PhD student in London, travelling between Dhaka and London regularly. Reliable and on-time.',
  },
  {
    id: 't3', name: 'Priya Nair', avatar: '', initials: 'PN',
    verified: true, trustLevel: 'Trusted', rating: 4.7,
    completedDeliveries: 15, cancellationRate: '5%', responseTime: '~1 hr',
    memberSince: 'June 2025', defaultFee: 420,
    bio: 'Based in London, visiting family in Dhaka seasonally. Happy to help out fellow BringBuddy members.',
  },
  {
    id: 't4', name: 'Syed Imran', avatar: '', initials: 'SI',
    verified: true, trustLevel: 'Trusted', rating: 4.6,
    completedDeliveries: 9, cancellationRate: '3%', responseTime: '~45 min',
    memberSince: 'September 2025', defaultFee: 400,
    bio: 'Business traveller between Dhaka and London. Reliable and communicative.',
  },
  {
    id: 't5', name: 'Nadia Sultana', avatar: '', initials: 'NS',
    verified: false, trustLevel: 'New', rating: 4.5,
    completedDeliveries: 3, cancellationRate: '0%', responseTime: '~2 hr',
    memberSince: 'November 2025', defaultFee: 380,
    bio: 'New to BringBuddy but experienced with international travel. Looking to help out.',
  },
]

export const TRIPS = [
  { id: 'tr1', travelerId: 't1', from: 'DAC', fromCity: 'Dhaka', to: 'LHR', toCity: 'London', date: '28 Aug 2026', capacityKg: 8, usedKg: 2, feePerKg: 450, allowedCategories: ['Documents', 'Clothing', 'Small Electronics', 'Food items'] },
  { id: 'tr2', travelerId: 't2', from: 'DAC', fromCity: 'Dhaka', to: 'LHR', toCity: 'London', date: '1 Sep 2026', capacityKg: 10, usedKg: 4, feePerKg: 480, allowedCategories: ['Documents', 'Clothing', 'Cosmetics'] },
  { id: 'tr3', travelerId: 't3', from: 'DAC', fromCity: 'Dhaka', to: 'LHR', toCity: 'London', date: '5 Sep 2026', capacityKg: 6, usedKg: 1, feePerKg: 420, allowedCategories: ['Documents', 'Clothing', 'Gifts'] },
  { id: 'tr4', travelerId: 't4', from: 'DAC', fromCity: 'Dhaka', to: 'LHR', toCity: 'London', date: '12 Sep 2026', capacityKg: 7, usedKg: 0, feePerKg: 400, allowedCategories: ['Documents', 'Clothing', 'Small Electronics', 'Books'] },
  { id: 'tr5', travelerId: 't5', from: 'DAC', fromCity: 'Dhaka', to: 'LHR', toCity: 'London', date: '18 Sep 2026', capacityKg: 5, usedKg: 0, feePerKg: 380, allowedCategories: ['Documents', 'Clothing'] },
]

export const RESTRICTED_ITEMS = [
  'weapon', 'gun', 'knife', 'explosive', 'bomb', 'drug', 'narcotics',
  'cash', 'currency', 'money', 'alcohol', 'liquid', 'flammable', 'battery',
  'lithium', 'radioactive', 'animal', 'plant', 'food', 'medicine', 'prescription',
]

// DUMMY client-side check — Feature 17 already has a real server-side version
// on the restricted-item-validation branch. Replace this with a real API call
// once that branch is merged.
export function checkRestrictedItem(description) {
  const lower = description.toLowerCase()
  for (const item of RESTRICTED_ITEMS) {
    if (lower.includes(item)) {
      const messages = {
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

export function getTravelerById(id) {
  return TRAVELERS.find(t => t.id === id) ?? TRAVELERS[0]
}

export function getTripsByTraveler(travelerId) {
  return TRIPS.filter(t => t.travelerId === travelerId)
}

export function getTripById(id) {
  return TRIPS.find(t => t.id === id) ?? TRIPS[0]
}

export function calcFees(weightKg, feePerKg) {
  const carryingFee = Math.round(weightKg * feePerKg)
  const serviceFee = Math.round(carryingFee * 0.08)
  const total = carryingFee + serviceFee
  return { carryingFee, serviceFee, total }
}