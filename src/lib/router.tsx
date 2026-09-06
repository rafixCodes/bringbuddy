import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'

export interface MyTrip {
  id: string
  from: string
  to: string
  date: string
  capacityKg: number
  usedKg: number
  feePerKg: number
  allowedCategories: string[]
  pickupPreferences: string
  notes: string
  status: 'active' | 'closed' | 'draft'
  activeOrders: number
}

export interface MarketplaceRequest {
  id: string
  type: 'carry-only' | 'shopping-request'
  senderId: string
  senderName: string
  senderInitials: string
  senderVerified: boolean
  senderRating: number
  from: string
  to: string
  travelDate: string
  weightKg?: number
  suggestedFee?: number
  itemDescription?: string
  specialInstructions?: string
  productUrl?: string
  productName?: string
  quantity?: number
  budget?: number
  postedHoursAgo: number
  status: 'open' | 'traveler-selected' | 'closed'
  applications: TravelerApplication[]
}

export interface TravelerApplication {
  id: string
  requestId: string
  travelerId: string
  travelerName: string
  travelerInitials: string
  travelerVerified: boolean
  travelerTrustLevel: 'High Trust' | 'Trusted' | 'New'
  travelerRating: number
  travelerDeliveries: number
  travelerCancellationRate: string
  travelerResponseTime: string
  proposedFee: number
  message: string
  status: 'pending' | 'accepted' | 'declined'
  tripFrom: string
  tripTo: string
  tripDate: string
}

export interface AppNotification {
  id: string
  type: 'order' | 'trip' | 'payment' | 'system'
  icon: string
  title: string
  body: string
  time: string
  read: boolean
  action?: PageName
}

export interface EarningRecord {
  id: string
  orderId: string
  route: string
  date: string
  status: 'completed' | 'pending'
  carryingFee: number
  platformFee: number
  net: number
}

export interface DisputeRecord {
  id: string
  orderId: string
  senderName: string
  travelerName: string
  issueType: string
  description: string
  evidence: string[]
  status: 'submitted' | 'under-review' | 'resolved'
  submittedAt: string
  resolvedAt?: string
  resolution?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  mode: string
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected'
  trustLevel: string
  completedDeliveries: number
  accountStatus: 'active' | 'suspended'
  joinedAt: string
}

export type PageName =
  | 'home'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'mode-selection'
  | 'sender-onboarding'
  | 'traveler-onboarding'
  | 'verification-intro'
  | 'verification-flow'
  | 'verification-pending'
  | 'verification-approved'
  | 'verification-rejected'
  | 'sender-dashboard'
  | 'traveler-dashboard'
  | 'trip-search'
  | 'traveler-profile'
  | 'order-new'
  | 'order-review'
  | 'order-sent'
  | 'marketplace-post'
  | 'request-detail'
  | 'order-hub'
  | 'my-trips'
  | 'post-trip'
  | 'trip-detail'
  | 'marketplace'
  | 'marketplace-request'
  | 'applications-view'
  | 'notifications'
  | 'earnings'
  | 'order-history'
  | 'dispute-flow'
  | 'profile'
  | 'admin'

export type UserMode = 'sender' | 'traveler'

export interface AuthUser {
  name: string
  email: string
  mode: UserMode
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected'
}

export interface OrderDraft {
  type?: 'carry-only' | 'shopping-request'
  bookingMethod?: 'direct' | 'marketplace'
  selectedTravelerId?: string
  selectedTripId?: string
  itemDescription?: string
  weightKg?: number
  pickupAddress?: string
  receiverName?: string
  receiverPhone?: string
  specialInstructions?: string
  productUrl?: string
  quantity?: number
  budget?: number
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'paid'
  | 'arranged'
  | 'picked-up'
  | 'transit'
  | 'ready'
  | 'completed'
  | 'cancelled'

export interface ActiveOrder {
  id: string
  status: OrderStatus
  type: 'carry-only' | 'shopping-request'
  bookingMethod: 'direct' | 'marketplace'
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
  carryingFee: number
  serviceFee: number
  senderName?: string
  timestamps?: Partial<Record<OrderStatus, string>>
  reviewedBySender?: boolean
  reviewedByTraveler?: boolean
  cancelReason?: string
  disputeStatus?: 'none' | 'under-review'
  productUrl?: string
  quantity?: number
  budget?: number
  specialInstructions?: string
  receiverPhone?: string
}

interface RouterCtx {
  page: PageName
  navigate: (p: PageName) => void
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
  switchMode: (m: UserMode) => void
  orderDraft: OrderDraft
  setOrderDraft: (d: OrderDraft | ((prev: OrderDraft) => OrderDraft)) => void
  activeOrder: ActiveOrder | null
  setActiveOrder: Dispatch<SetStateAction<ActiveOrder | null>>
  myTrips: MyTrip[]
  setMyTrips: Dispatch<SetStateAction<MyTrip[]>>
  viewingTripId: string | null
  setViewingTripId: (id: string | null) => void
  viewingTravelerId: string | null
  setViewingTravelerId: (id: string | null) => void
  viewingRequestId: string | null
  setViewingRequestId: (id: string | null) => void
  currentTravelerId: string
  currentSenderId: string
  marketplaceRequests: MarketplaceRequest[]
  setMarketplaceRequests: Dispatch<SetStateAction<MarketplaceRequest[]>>
  notifications: AppNotification[]
  setNotifications: Dispatch<SetStateAction<AppNotification[]>>
  earnings: EarningRecord[]
  setEarnings: Dispatch<SetStateAction<EarningRecord[]>>
  disputes: DisputeRecord[]
  setDisputes: Dispatch<SetStateAction<DisputeRecord[]>>
  adminUsers: AdminUser[]
  setAdminUsers: Dispatch<SetStateAction<AdminUser[]>>
  isAdmin: boolean
  setIsAdmin: (v: boolean) => void
}

const RouterContext = createContext<RouterCtx | null>(null)

const CURRENT_TRAVELER_ID = 't1'
const CURRENT_SENDER_ID = 's1'

const INITIAL_MY_TRIPS: MyTrip[] = [
  {
    id: 'mt1',
    from: 'Dhaka', to: 'London',
    date: '28 Aug 2026',
    capacityKg: 8, usedKg: 2,
    feePerKg: 450,
    allowedCategories: ['Documents', 'Clothing', 'Small Electronics', 'Gifts'],
    pickupPreferences: 'Gulshan-2 or Banani area',
    notes: 'Frequent UK–BD traveller. Happy to carry parcels.',
    status: 'active',
    activeOrders: 1,
  },
  {
    id: 'mt2',
    from: 'London', to: 'Dhaka',
    date: '14 Oct 2026',
    capacityKg: 10, usedKg: 0,
    feePerKg: 500,
    allowedCategories: ['Documents', 'Clothing', 'Gifts', 'Books'],
    pickupPreferences: 'East London area',
    notes: 'Return trip. Can carry up to 10 kg.',
    status: 'active',
    activeOrders: 0,
  },
]

const INITIAL_MARKETPLACE: MarketplaceRequest[] = [
  {
    id: 'mr1',
    type: 'carry-only',
    senderId: 's1',
    senderName: 'Alex Johnson',
    senderInitials: 'AJ',
    senderVerified: true,
    senderRating: 4.7,
    from: 'Dhaka', to: 'London',
    travelDate: '28 Aug 2026',
    weightKg: 2.5,
    suggestedFee: 1125,
    itemDescription: 'Traditional clothing and small gifts',
    specialInstructions: 'Handle with care. Items are fragile.',
    postedHoursAgo: 2,
    status: 'open',
    applications: [
      {
        id: 'app-mr1-t2',
        requestId: 'mr1',
        travelerId: 't2',
        travelerName: 'Karim Hossain',
        travelerInitials: 'KH',
        travelerVerified: true,
        travelerTrustLevel: 'High Trust',
        travelerRating: 4.8,
        travelerDeliveries: 28,
        travelerCancellationRate: '0%',
        travelerResponseTime: '~30 min',
        proposedFee: 1200,
        message: 'PhD student, travelling 1 Sep. Very reliable, zero cancellations so far.',
        status: 'pending',
        tripFrom: 'Dhaka', tripTo: 'London', tripDate: '1 Sep 2026',
      },
      {
        id: 'app-mr1-t3',
        requestId: 'mr1',
        travelerId: 't3',
        travelerName: 'Priya Nair',
        travelerInitials: 'PN',
        travelerVerified: true,
        travelerTrustLevel: 'Trusted',
        travelerRating: 4.7,
        travelerDeliveries: 15,
        travelerCancellationRate: '5%',
        travelerResponseTime: '~1 hr',
        proposedFee: 1050,
        message: 'Happy to carry your parcel. Flying 5 Sep, can meet anywhere in Dhaka.',
        status: 'pending',
        tripFrom: 'Dhaka', tripTo: 'London', tripDate: '5 Sep 2026',
      },
      {
        id: 'app-mr1-t6',
        requestId: 'mr1',
        travelerId: 't6',
        travelerName: 'Farhan Chowdhury',
        travelerInitials: 'FC',
        travelerVerified: true,
        travelerTrustLevel: 'Trusted',
        travelerRating: 4.7,
        travelerDeliveries: 18,
        travelerCancellationRate: '4%',
        travelerResponseTime: '~40 min',
        proposedFee: 1150,
        message: 'I fly 8 Sep and still have 6 kg free. Can collect from Gulshan or Banani.',
        status: 'pending',
        tripFrom: 'Dhaka', tripTo: 'London', tripDate: '8 Sep 2026',
      },
    ],
  },
  {
    id: 'mr2',
    type: 'shopping-request',
    senderId: 's2',
    senderName: 'Sadia Islam',
    senderInitials: 'SI',
    senderVerified: true,
    senderRating: 4.9,
    from: 'London', to: 'Dhaka',
    travelDate: '5 Sep 2026',
    productName: 'Dyson V15 Detect Vacuum',
    productUrl: 'https://dyson.co.uk',
    quantity: 1,
    budget: 65000,
    specialInstructions: 'Please get the Gold/Iron colour if available.',
    postedHoursAgo: 5,
    status: 'open',
    applications: [],
  },
  {
    id: 'mr3',
    type: 'carry-only',
    senderId: 's3',
    senderName: 'Rahim Ahmed',
    senderInitials: 'RA',
    senderVerified: true,
    senderRating: 4.6,
    from: 'Dhaka', to: 'London',
    travelDate: '1 Sep 2026',
    weightKg: 1.2,
    suggestedFee: 576,
    itemDescription: 'Handmade jamdani saree and sweets',
    specialInstructions: 'Please keep dry.',
    postedHoursAgo: 24,
    status: 'open',
    applications: [
      {
        id: 'app-mr3-t4',
        requestId: 'mr3',
        travelerId: 't4',
        travelerName: 'Syed Imran',
        travelerInitials: 'SI',
        travelerVerified: true,
        travelerTrustLevel: 'Trusted',
        travelerRating: 4.6,
        travelerDeliveries: 9,
        travelerCancellationRate: '3%',
        travelerResponseTime: '~45 min',
        proposedFee: 600,
        message: 'Travelling 12 Sep with an empty bag. Can pick up any weekday evening.',
        status: 'pending',
        tripFrom: 'Dhaka', tripTo: 'London', tripDate: '12 Sep 2026',
      },
      {
        id: 'app-mr3-t9',
        requestId: 'mr3',
        travelerId: 't9',
        travelerName: 'Rownak Jahan',
        travelerInitials: 'RJ',
        travelerVerified: true,
        travelerTrustLevel: 'Trusted',
        travelerRating: 4.6,
        travelerDeliveries: 12,
        travelerCancellationRate: '6%',
        travelerResponseTime: '~1 hr',
        proposedFee: 540,
        message: 'Flying 24 Sep. I have carried sarees before, will keep them wrapped and dry.',
        status: 'pending',
        tripFrom: 'Dhaka', tripTo: 'London', tripDate: '24 Sep 2026',
      },
    ],
  },
  {
    id: 'mr4',
    type: 'shopping-request',
    senderId: 's4',
    senderName: 'Nusrat Karim',
    senderInitials: 'NK',
    senderVerified: false,
    senderRating: 4.5,
    from: 'London', to: 'Dhaka',
    travelDate: '12 Sep 2026',
    productName: 'LEGO Technic Set 42167',
    productUrl: 'https://lego.com',
    quantity: 2,
    budget: 18000,
    specialInstructions: 'Both sets please, one is a gift.',
    postedHoursAgo: 48,
    status: 'open',
    applications: [],
  },
  {
    id: 'mr5',
    type: 'shopping-request',
    senderId: 's1',
    senderName: 'Alex Johnson',
    senderInitials: 'AJ',
    senderVerified: true,
    senderRating: 4.7,
    from: 'London', to: 'Dhaka',
    travelDate: '14 Sep 2026',
    productName: 'Bose QuietComfort Ultra Headphones',
    productUrl: 'https://bose.co.uk',
    quantity: 1,
    budget: 42000,
    specialInstructions: 'Black if possible. Please keep the receipt for customs.',
    postedHoursAgo: 6,
    status: 'open',
    applications: [
      {
        id: 'app-mr5-t9',
        requestId: 'mr5',
        travelerId: 't9',
        travelerName: 'Rownak Jahan',
        travelerInitials: 'RJ',
        travelerVerified: true,
        travelerTrustLevel: 'Trusted',
        travelerRating: 4.6,
        travelerDeliveries: 12,
        travelerCancellationRate: '6%',
        travelerResponseTime: '~1 hr',
        proposedFee: 2400,
        message: 'I fly London to Dhaka on 2 Sep and pass a Bose store on the way to the airport.',
        status: 'pending',
        tripFrom: 'London', tripTo: 'Dhaka', tripDate: '2 Sep 2026',
      },
    ],
  },
  {
    id: 'mr6',
    type: 'carry-only',
    senderId: 's5',
    senderName: 'Tanjila Haque',
    senderInitials: 'TH',
    senderVerified: true,
    senderRating: 4.8,
    from: 'Dhaka', to: 'London',
    travelDate: '3 Sep 2026',
    weightKg: 3,
    suggestedFee: 1350,
    itemDescription: 'Books and stationery for my nephew',
    specialInstructions: 'No rush, anytime in the first week of September works.',
    postedHoursAgo: 3,
    status: 'open',
    applications: [
      {
        id: 'app-mr6-t6',
        requestId: 'mr6',
        travelerId: 't6',
        travelerName: 'Farhan Chowdhury',
        travelerInitials: 'FC',
        travelerVerified: true,
        travelerTrustLevel: 'Trusted',
        travelerRating: 4.7,
        travelerDeliveries: 18,
        travelerCancellationRate: '4%',
        travelerResponseTime: '~40 min',
        proposedFee: 1400,
        message: 'Books are easy to pack flat. I fly 8 Sep if that is not too late.',
        status: 'pending',
        tripFrom: 'Dhaka', tripTo: 'London', tripDate: '8 Sep 2026',
      },
    ],
  },
  {
    id: 'mr7',
    type: 'carry-only',
    senderId: 's6',
    senderName: 'Imtiaz Bhuiyan',
    senderInitials: 'IB',
    senderVerified: false,
    senderRating: 4.4,
    from: 'Dhaka', to: 'Dubai',
    travelDate: '10 Sep 2026',
    weightKg: 4,
    suggestedFee: 1280,
    itemDescription: 'Spare laptop charger and office documents',
    specialInstructions: 'Documents are in a sealed envelope, please keep them flat.',
    postedHoursAgo: 9,
    status: 'open',
    applications: [],
  },
  {
    id: 'mr8',
    type: 'shopping-request',
    senderId: 's7',
    senderName: 'Rehana Begum',
    senderInitials: 'RB',
    senderVerified: true,
    senderRating: 4.9,
    from: 'London', to: 'Dhaka',
    travelDate: '10 Oct 2026',
    productName: 'Clarks school shoes (size 3 and 5)',
    productUrl: 'https://clarks.co.uk',
    quantity: 2,
    budget: 12000,
    specialInstructions: 'Black, one pair size 3 and one size 5. Receipt please.',
    postedHoursAgo: 30,
    status: 'open',
    applications: [],
  },
  {
    id: 'mr9',
    type: 'carry-only',
    senderId: 's8',
    senderName: 'Zayan Rahim',
    senderInitials: 'ZR',
    senderVerified: true,
    senderRating: 4.6,
    from: 'Dhaka', to: 'New York',
    travelDate: '6 Sep 2026',
    weightKg: 1.5,
    suggestedFee: 980,
    itemDescription: 'Wedding invitation cards',
    specialInstructions: 'Please do not bend the envelopes.',
    postedHoursAgo: 20,
    status: 'open',
    applications: [],
  },
]

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', type: 'order', icon: '✅', title: 'Traveler accepted your request', body: 'Aisha Rahman accepted your Dhaka → London delivery.', time: '2:31 PM', read: false, action: 'order-hub' },
  { id: 'n2', type: 'payment', icon: '🛡️', title: 'Payment secured in escrow', body: 'Your payment of ৳1,215 is held securely until delivery.', time: '2:40 PM', read: false, action: 'order-hub' },
  { id: 'n3', type: 'order', icon: '🚚', title: 'Your parcel is now in transit', body: 'Aisha has confirmed pickup and is now in transit.', time: '10:42 AM', read: true, action: 'order-hub' },
  { id: 'n4', type: 'payment', icon: '💰', title: 'Payment released to earnings', body: 'Delivery confirmed. ৳1,035 has been added to your earnings.', time: 'Yesterday', read: true, action: 'earnings' },
  { id: 'n5', type: 'system', icon: '🔔', title: 'New delivery request received', body: 'Alex Johnson sent a 2.5 kg parcel request for your trip.', time: 'Yesterday', read: true, action: 'order-hub' },
  { id: 'n6', type: 'trip', icon: '✈️', title: 'Trip published successfully', body: 'Your Dhaka → London trip is now visible to senders.', time: '2 days ago', read: true, action: 'my-trips' },
]

const INITIAL_EARNINGS: EarningRecord[] = [
  { id: 'e1', orderId: 'BB-1048', route: 'Dhaka → London', date: '28 Aug 2026', status: 'completed', carryingFee: 1125, platformFee: 90, net: 1035 },
  { id: 'e2', orderId: 'BB-1041', route: 'Dhaka → Singapore', date: '22 Aug 2026', status: 'completed', carryingFee: 920, platformFee: 74, net: 846 },
  { id: 'e3', orderId: 'BB-1035', route: 'London → Dhaka', date: '14 Aug 2026', status: 'completed', carryingFee: 1360, platformFee: 109, net: 1251 },
  { id: 'e4', orderId: 'BB-1029', route: 'Dhaka → London', date: '5 Aug 2026', status: 'completed', carryingFee: 900, platformFee: 72, net: 828 },
  { id: 'e5', orderId: 'BB-1055', route: 'Dhaka → London', date: '1 Sep 2026', status: 'pending', carryingFee: 1250, platformFee: 100, net: 1150 },
]

const INITIAL_DISPUTES: DisputeRecord[] = [
  {
    id: 'DIS-001', orderId: 'BB-1047',
    senderName: 'Alex Johnson', travelerName: 'Karim Hossain',
    issueType: 'Damaged item',
    description: 'The saree arrived with a stain and a small tear. The item was packed securely.',
    evidence: ['package-photo.jpg', 'damage-photo.jpg'],
    status: 'under-review',
    submittedAt: '12 Aug 2026',
  },
]

const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: 'u1', name: 'Aisha Rahman', email: 'aisha@example.com', mode: 'traveler', verificationStatus: 'approved', trustLevel: 'High Trust', completedDeliveries: 42, accountStatus: 'active', joinedAt: 'Mar 2025' },
  { id: 'u2', name: 'Karim Hossain', email: 'karim@example.com', mode: 'traveler', verificationStatus: 'approved', trustLevel: 'High Trust', completedDeliveries: 28, accountStatus: 'active', joinedAt: 'Jan 2025' },
  { id: 'u3', name: 'Alex Johnson', email: 'alex@example.com', mode: 'sender', verificationStatus: 'none', trustLevel: 'Trusted', completedDeliveries: 0, accountStatus: 'active', joinedAt: 'Jun 2025' },
  { id: 'u4', name: 'Priya Nair', email: 'priya@example.com', mode: 'traveler', verificationStatus: 'pending', trustLevel: 'Trusted', completedDeliveries: 15, accountStatus: 'active', joinedAt: 'Jun 2025' },
  { id: 'u5', name: 'Syed Imran', email: 'imran@example.com', mode: 'traveler', verificationStatus: 'pending', trustLevel: 'Trusted', completedDeliveries: 9, accountStatus: 'active', joinedAt: 'Sep 2025' },
  { id: 'u6', name: 'Nadia Sultana', email: 'nadia@example.com', mode: 'traveler', verificationStatus: 'none', trustLevel: 'New', completedDeliveries: 3, accountStatus: 'active', joinedAt: 'Nov 2025' },
  { id: 'u7', name: 'Sadia Islam', email: 'sadia@example.com', mode: 'sender', verificationStatus: 'none', trustLevel: 'Trusted', completedDeliveries: 0, accountStatus: 'active', joinedAt: 'Jul 2025' },
]

export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageName>('home')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [orderDraft, setOrderDraft] = useState<OrderDraft>({})
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null)
  const [myTrips, setMyTrips] = useState<MyTrip[]>(INITIAL_MY_TRIPS)
  const [viewingTripId, setViewingTripId] = useState<string | null>(null)
  const [viewingTravelerId, setViewingTravelerId] = useState<string | null>(null)
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null)
  const [marketplaceRequests, setMarketplaceRequests] = useState<MarketplaceRequest[]>(INITIAL_MARKETPLACE)
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS)
  const [earnings, setEarnings] = useState<EarningRecord[]>(INITIAL_EARNINGS)
  const [disputes, setDisputes] = useState<DisputeRecord[]>(INITIAL_DISPUTES)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS)
  const [isAdmin, setIsAdmin] = useState(false)

  const switchMode = (m: UserMode) => {
    if (user) setUser({ ...user, mode: m })
  }

  return (
    <RouterContext.Provider value={{
      page, navigate: setPage,
      user, setUser, switchMode,
      orderDraft, setOrderDraft,
      activeOrder, setActiveOrder,
      myTrips, setMyTrips,
      viewingTripId, setViewingTripId,
      viewingTravelerId, setViewingTravelerId,
      viewingRequestId, setViewingRequestId,
      currentTravelerId: CURRENT_TRAVELER_ID,
      currentSenderId: CURRENT_SENDER_ID,
      marketplaceRequests, setMarketplaceRequests,
      notifications, setNotifications,
      earnings, setEarnings,
      disputes, setDisputes,
      adminUsers, setAdminUsers,
      isAdmin, setIsAdmin,
    }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used within RouterProvider')
  return ctx
}
