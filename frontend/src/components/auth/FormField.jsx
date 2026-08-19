import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export function FormField({ label, error, success, hint, rightSlot, className = '', id, ...rest }) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const state = error ? 'error' : success ? 'success' : 'default'

  const borderClass = {
    default: 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
    error: 'border-danger/60 ring-2 ring-danger/10',
    success: 'border-success/60 ring-2 ring-success/10',
  }[state]

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={fieldId} className="text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className={`flex items-center gap-2 rounded-[8px] border bg-white px-3.5 transition-all duration-200 ${borderClass}`}>
        <input
          id={fieldId}
          className="flex-1 h-11 bg-transparent text-[14px] text-ink placeholder:text-ink-muted outline-none"
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...rest}
        />
        {rightSlot}
        {error && <AlertCircle size={16} className="text-danger shrink-0" aria-hidden />}
        {success && !error && <CheckCircle2 size={16} className="text-success shrink-0" aria-hidden />}
      </div>
      {error && (
        <p id={`${fieldId}-error`} role="alert" className="text-[12px] text-danger flex items-center gap-1">
          {error}
        </p>
      )}
      {success && !error && (
        <p className="text-[12px] text-success">{success}</p>
      )}
      {hint && !error && !success && (
        <p id={`${fieldId}-hint`} className="text-[12px] text-ink-muted">{hint}</p>
      )}
    </div>
  )
}

export function PasswordField({ label = 'Password', ...rest }) {
  const [show, setShow] = useState(false)
  return (
    <FormField
      label={label}
      type={show ? 'text' : 'password'}
      autoComplete="current-password"
      rightSlot={
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="text-ink-muted hover:text-ink transition-colors shrink-0"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      {...rest}
    />
  )
}