/**
 * BringBuddy wordmark + symbol.
 * The mark is a parcel/box whose upper face lifts off as a paper-plane route —
 * "a parcel already in motion along someone's journey." Recognizable at small sizes.
 */
export function Logo({ size = 32, showWordmark = true, variant = 'default' }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="9" fill="#3157D5" />
        <path
          d="M9 14.5 16 11l7 3.5v6.2L16 24l-7-3.3v-6.2Z"
          fill="#fff"
          fillOpacity="0.16"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M16 17.6 9 14.5M16 17.6l7-3.1M16 17.6V24" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
        <path
          d="M18.5 9.5c2.6-1.3 5-1.4 6.8-.4"
          stroke="#F9735B"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="0.2 3"
        />
        <circle cx="25.6" cy="9.3" r="1.7" fill="#F9735B" />
      </svg>
      {showWordmark && (
        <span className={`text-[19px] font-bold tracking-tight ${variant === 'white' ? 'text-white' : 'text-ink'}`}>
          Bring<span className={variant === 'white' ? 'text-white/80' : 'text-primary'}>Buddy</span>
        </span>
      )}
    </span>
  )
}