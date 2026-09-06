import { useReveal } from './lib/useReveal'
import { useRouter } from './lib/router'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { TrustStrip } from './components/TrustStrip'
import { HowItWorks } from './components/HowItWorks'
import { ValueProps } from './components/ValueProps'
import { MarketplacePreview } from './components/MarketplacePreview'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { ActivityToast } from './components/ActivityToast'

// Auth
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { ForgotPassword } from './components/auth/ForgotPassword'

// Onboarding
import { ModeSelection } from './components/onboarding/ModeSelection'
import { SenderOnboarding } from './components/onboarding/SenderOnboarding'
import { TravelerOnboarding } from './components/onboarding/TravelerOnboarding'
import { VerificationIntro } from './components/onboarding/VerificationIntro'
import { VerificationFlow } from './components/onboarding/VerificationFlow'
import {
  VerificationPending,
  VerificationApproved,
  VerificationRejected,
} from './components/onboarding/VerificationStates'

// Dashboards
import { SenderDashboard } from './components/dashboard/SenderDashboard'
import { TravelerDashboard } from './components/dashboard/TravelerDashboard'

// Trip discovery
import { TripSearch } from './components/trips/TripSearch'
import { TravelerProfile } from './components/trips/TravelerProfile'
import { MyTrips } from './components/trips/MyTrips'
import { PostTrip } from './components/trips/PostTrip'
import { TripDetail } from './components/trips/TripDetail'

// Marketplace
import { Marketplace } from './components/marketplace/Marketplace'
import { MarketplaceRequestDetail } from './components/marketplace/MarketplaceRequestDetail'
import { ApplicationsView } from './components/marketplace/ApplicationsView'

// Orders
import { OrderCreation } from './components/orders/OrderCreation'
import { OrderSummary } from './components/orders/OrderSummary'
import { OrderSent } from './components/orders/OrderSent'
import { MarketplacePost } from './components/orders/MarketplacePost'
import { RequestDetail } from './components/orders/RequestDetail'
import { OrderHub } from './components/orders/OrderHub'
import { OrderHistory } from './components/orders/OrderHistory'

// Notifications, Earnings, Disputes, Profile
import { NotificationsCenter } from './components/notifications/NotificationsCenter'
import { EarningsDashboard } from './components/earnings/EarningsDashboard'
import { DisputeFlow } from './components/disputes/DisputeFlow'
import { ProfilePage } from './components/profile/ProfilePage'

// Admin
import { AdminCenter } from './components/admin/AdminCenter'

function LandingPage() {
  useReveal()
  return (
    <div className="min-h-screen bg-background text-ink">
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <ValueProps />
        <MarketplacePreview />
        <FinalCTA />
      </main>
      <Footer />
      <ActivityToast />
    </div>
  )
}

export default function App() {
  const { page, user, isAdmin } = useRouter()

  if (isAdmin) return <AdminCenter />

  switch (page) {
    // Auth
    case 'login':           return <Login />
    case 'register':        return <Register />
    case 'forgot-password': return <ForgotPassword />
    case 'reset-password':  return <ForgotPassword />

    // Onboarding
    case 'mode-selection':       return <ModeSelection />
    case 'sender-onboarding':    return <SenderOnboarding />
    case 'traveler-onboarding':  return <TravelerOnboarding />
    case 'verification-intro':   return <VerificationIntro />
    case 'verification-flow':    return <VerificationFlow />
    case 'verification-pending': return <VerificationPending />
    case 'verification-approved': return <VerificationApproved />
    case 'verification-rejected': return <VerificationRejected />

    // Dashboards
    case 'sender-dashboard':   return <SenderDashboard />
    case 'traveler-dashboard': return <TravelerDashboard />

    // Trip discovery
    case 'trip-search':      return <TripSearch />
    case 'traveler-profile': return <TravelerProfile />

    // Order creation
    case 'order-new':        return <OrderCreation />
    case 'order-review':     return <OrderSummary />
    case 'order-sent':       return <OrderSent />
    case 'marketplace-post': return <MarketplacePost />

    // Traveler side
    case 'request-detail': return <RequestDetail />

    // Shared
    case 'order-hub': return <OrderHub />

    // Batch 5 - Trip management
    case 'my-trips':   return <MyTrips />
    case 'post-trip':  return <PostTrip />
    case 'trip-detail': return <TripDetail />

    // Batch 5 - Marketplace
    case 'marketplace':          return <Marketplace />
    case 'marketplace-request':  return <MarketplaceRequestDetail />
    case 'applications-view':    return <ApplicationsView />

    // Final batch
    case 'notifications':  return <NotificationsCenter />
    case 'earnings':       return <EarningsDashboard />
    case 'order-history':  return <OrderHistory />
    case 'dispute-flow':   return <DisputeFlow />
    case 'profile':        return <ProfilePage />

    default: return <LandingPage />
  }
}
