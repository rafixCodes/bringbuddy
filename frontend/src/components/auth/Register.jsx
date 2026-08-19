import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui'
import { AuthLayout } from './AuthLayout'
import { FormField, PasswordField } from './FormField'
import { useToast } from '../../lib/toast'
import { registerUser } from '../../services/authService'

function getPasswordStrength(pw) {
  if (!pw) return null
  if (pw.length < 6) return { label: 'Too short', color: 'bg-danger', width: 'w-1/4' }
  if (pw.length < 8 || !/[0-9]/.test(pw)) return { label: 'Weak', color: 'bg-warning', width: 'w-2/4' }
  if (!/[^a-zA-Z0-9]/.test(pw)) return { label: 'Good', color: 'bg-info', width: 'w-3/4' }
  return { label: 'Strong', color: 'bg-success', width: 'w-full' }
}

export function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState('idle')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const strength = getPasswordStrength(password)

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Full name is required.'
    if (!email) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.'
    if (!phone.trim()) e.phone = 'Phone number is required.'
    if (!password) e.password = 'Password is required.'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (!confirm) e.confirm = 'Please confirm your password.'
    else if (confirm !== password) e.confirm = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setState('loading')
    setServerError('')

    try {
      const data = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      })

      localStorage.setItem('token', data.token)
      setState('success')
      toast({ tone: 'success', title: 'Account created!', message: 'Welcome to BringBuddy.' })
      navigate('/onboarding')
    } catch (error) {
      setState('error')
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      setServerError(message)
      toast({ tone: 'error', title: 'Registration failed', message })
    }
  }

  const isLoading = state === 'loading'

  return (
    <AuthLayout panel="register">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-ink tracking-tight mb-1.5">Create your BringBuddy account</h1>
          <p className="text-[15px] text-ink-secondary">One account. Two ways to participate.</p>
        </div>

        <div className="flex flex-col gap-4">
          <FormField
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
            error={errors.name}
            disabled={isLoading}
          />

          <FormField
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); setServerError('') }}
            error={errors.email}
            disabled={isLoading}
          />

          <FormField
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="01700000000"
            value={phone}
            onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })) }}
            error={errors.phone}
            disabled={isLoading}
          />

          <div>
            <PasswordField
              label="Password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
              error={errors.password}
              disabled={isLoading}
            />
            {strength && !errors.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-border overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <span className="text-[11px] text-ink-muted font-medium w-12 text-right">{strength.label}</span>
              </div>
            )}
          </div>

          <PasswordField
            label="Confirm password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })) }}
            error={errors.confirm}
            success={confirm && confirm === password && !errors.confirm ? 'Passwords match' : undefined}
            disabled={isLoading}
          />

          {serverError && (
            <div role="alert" className="rounded-[8px] bg-danger-light border border-danger/20 px-3.5 py-2.5 text-[13px] text-danger font-medium">
              {serverError}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full mt-1" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Creating account…</>
            ) : 'Create Account'}
          </Button>

          <p className="text-center text-[12px] text-ink-muted leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="text-primary font-medium cursor-pointer hover:underline">Terms of Service</span>{' '}
            and{' '}
            <span className="text-primary font-medium cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>

        <p className="mt-6 text-center text-[14px] text-ink-muted">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-primary font-semibold hover:text-primary-hover transition-colors">
            Log in
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}