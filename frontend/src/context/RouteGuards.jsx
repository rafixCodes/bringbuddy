import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Full-page fallback while AuthContext resolves the token on first load.
function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

// Requires a logged-in user. Sends unauthenticated visitors to /login.
// Redirects logged-in-but-not-onboarded users into onboarding automatically,
// so a stale/direct link to a dashboard can't strand them mid-flow.
export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace />
  if (user.accountType !== 'admin' && !user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

// Requires accountType === 'admin'. Non-admins get bounced to their own dashboard
// rather than an error page, since a regular user hitting /admin isn't malicious,
// just a bad link.
export function AdminRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace />
  if (user.accountType !== 'admin') {
    return <Navigate to={user.currentMode === 'traveler' ? '/traveler-dashboard' : '/sender-dashboard'} replace />
  }
  return children
}

// Wraps onboarding-only routes: needs a logged-in user who hasn't finished
// onboarding yet. A user who already completed onboarding gets sent to their
// dashboard instead of being able to re-run mode selection via this route.
export function OnboardingRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace />
  if (user.accountType === 'admin') return <Navigate to="/admin" replace />
  if (user.hasCompletedOnboarding) {
    return <Navigate to={user.currentMode === 'traveler' ? '/traveler-dashboard' : '/sender-dashboard'} replace />
  }
  return children
}

// Wraps public-only routes (login/register/forgot-password). A logged-in user
// landing on /login shouldn't see the form again — send them where Login.jsx's
// own redirect logic would have sent them.
export function PublicOnlyRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <AuthLoading />
  if (user) {
    if (user.accountType === 'admin') return <Navigate to="/admin" replace />
    if (!user.hasCompletedOnboarding) return <Navigate to="/onboarding" replace />
    return <Navigate to={user.currentMode === 'traveler' ? '/traveler-dashboard' : '/sender-dashboard'} replace />
  }
  return children
}