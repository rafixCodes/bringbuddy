import { useState } from 'react'
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui'
import { AuthLayout } from './AuthLayout'
import { PasswordField, FormField } from './FormField'
import { useToast } from '../../lib/toast'

export function ForgotPassword() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [state, setState] = useState('request')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwErrors, setPwErrors] = useState({})

  async function handleRequest(e) {
    e.preventDefault()
    if (!email) { setEmailError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email address.'); return }
    setEmailError('')
    setState('loading-request')
    await new Promise(r => setTimeout(r, 1200))
    setState('sent')
  }

  async function handleReset(e) {
    e.preventDefault()
    const e2 = {}
    if (!newPassword || newPassword.length < 6) e2.newPassword = 'Password must be at least 6 characters.'
    if (!confirmPassword) e2.confirmPassword = 'Please confirm your password.'
    else if (confirmPassword !== newPassword) e2.confirmPassword = 'Passwords do not match.'
    setPwErrors(e2)
    if (Object.keys(e2).length) return

    setState('loading-reset')
    await new Promise(r => setTimeout(r, 1200))
    setState('done')
    toast({ tone: 'success', title: 'Password updated', message: 'You can now log in with your new password.' })
  }

  return (
    <AuthLayout panel="login">
      {state === 'request' || state === 'loading-request' ? (
        <form onSubmit={handleRequest} noValidate>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-ink-muted hover:text-ink text-[13px] font-medium mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to login
          </button>

          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-ink tracking-tight mb-1.5">Reset your password</h1>
            <p className="text-[15px] text-ink-secondary">
              Enter your account email and we'll guide you through resetting your password.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <FormField
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              error={emailError}
              disabled={state === 'loading-request'}
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === 'loading-request'}>
              {state === 'loading-request' ? (
                <><Loader2 size={16} className="animate-spin" /> Sending…</>
              ) : 'Send Reset Link'}
            </Button>
          </div>
        </form>
      ) : state === 'sent' ? (
        <div className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="w-14 h-14 rounded-[16px] bg-primary-light flex items-center justify-center mb-6">
            <MailCheck size={26} className="text-primary" />
          </div>
          <h1 className="text-[28px] font-bold text-ink tracking-tight mb-2">Check your email</h1>
          <p className="text-[15px] text-ink-secondary mb-6 leading-relaxed">
            We've sent a password reset link to <strong className="text-ink">{email}</strong>. Check your inbox and follow the link.
          </p>
          <p className="text-[13px] text-ink-muted mb-6">Didn't receive it? Check your spam folder or{' '}
            <button onClick={() => setState('request')} className="text-primary font-medium hover:underline">try again</button>.
          </p>
          {/* Not wired to a real backend yet — deferred. Simulates clicking the emailed link. */}
          <Button variant="secondary" size="lg" className="w-full mb-3" onClick={() => setState('reset')}>
            Simulate reset link →
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate('/login')}>
            Back to login
          </Button>
        </div>
      ) : state === 'reset' || state === 'loading-reset' ? (
        <form onSubmit={handleReset} noValidate className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-ink tracking-tight mb-1.5">Choose a new password</h1>
            <p className="text-[15px] text-ink-secondary">Make it strong and memorable.</p>
          </div>
          <div className="flex flex-col gap-4">
            <PasswordField
              label="New password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setPwErrors(p => ({ ...p, newPassword: '' })) }}
              error={pwErrors.newPassword}
              disabled={state === 'loading-reset'}
            />
            <PasswordField
              label="Confirm new password"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setPwErrors(p => ({ ...p, confirmPassword: '' })) }}
              error={pwErrors.confirmPassword}
              success={confirmPassword && confirmPassword === newPassword ? 'Passwords match' : undefined}
              disabled={state === 'loading-reset'}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full mt-1" disabled={state === 'loading-reset'}>
              {state === 'loading-reset' ? (
                <><Loader2 size={16} className="animate-spin" /> Updating…</>
              ) : 'Reset Password'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="animate-[bb-rise_0.4s_cubic-bezier(0.22,1,0.36,1)_both] text-center">
          <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-[28px] font-bold text-ink tracking-tight mb-2">Password updated</h1>
          <p className="text-[15px] text-ink-secondary mb-8">Your password has been successfully changed. You can now log in.</p>
          <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </div>
      )}
    </AuthLayout>
  )
}