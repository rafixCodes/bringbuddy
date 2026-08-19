import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui'
import { AuthLayout } from './AuthLayout'
import { FormField, PasswordField } from './FormField'
import { useToast } from '../../lib/toast'
import { loginUser } from '../../services/authService'

export function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState('idle')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [authError, setAuthError] = useState('')

  function validate() {
    let valid = true
    setEmailError('')
    setPasswordError('')
    setAuthError('')

    if (!email) { setEmailError('Email is required.'); valid = false }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email address.'); valid = false }
    if (!password) { setPasswordError('Password is required.'); valid = false }
    else if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); valid = false }
    return valid
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setState('loading')

    try {
      const data = await loginUser({ email, password })
      localStorage.setItem('token', data.token)
      setState('success')
      toast({ tone: 'success', title: 'Login successful', message: 'Welcome back to BringBuddy.' })

      const { accountType, hasCompletedOnboarding, currentMode } = data.user

      setTimeout(() => {
        if (accountType === 'admin') {
          navigate('/admin')
        } else if (!hasCompletedOnboarding) {
          navigate('/onboarding')
        } else if (currentMode === 'traveler') {
          navigate('/traveler-dashboard')
        } else {
          navigate('/sender-dashboard')
        }
      }, 400)
    } catch (error) {
      setState('error')
      const message = error.response?.data?.message || 'Invalid email or password. Please try again.'
      setAuthError(message)
    }
  }

  const isLoading = state === 'loading'

  return (
    <AuthLayout panel="login">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-ink tracking-tight mb-1.5">Welcome back</h1>
          <p className="text-[15px] text-ink-secondary">Log in to continue with BringBuddy.</p>
        </div>

        <div className="flex flex-col gap-4">
          <FormField
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); setAuthError('') }}
            error={emailError}
            disabled={isLoading}
          />

          <div>
            <PasswordField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(''); setAuthError('') }}
              error={passwordError}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="mt-1.5 text-[12px] text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {authError && (
            <div role="alert" className="rounded-[8px] bg-danger-light border border-danger/20 px-3.5 py-2.5 text-[13px] text-danger font-medium">
              {authError}
            </div>
          )}

          {state === 'success' && (
            <div className="rounded-[8px] bg-success-light border border-success/20 px-3.5 py-2.5 text-[13px] text-success font-medium flex items-center gap-2">
              <span>✓</span> Login successful — redirecting…
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-1"
            disabled={isLoading || state === 'success'}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing you in…
              </>
            ) : 'Log In'}
          </Button>
        </div>

        <p className="mt-6 text-center text-[14px] text-ink-muted">
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/register')} className="text-primary font-semibold hover:text-primary-hover transition-colors">
            Create one
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}