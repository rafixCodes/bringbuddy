// Real Trip.js status enum: 'draft' | 'published' | 'full' | 'completed' | 'cancelled'.
// Distinct from the Figma prototype's simpler 'active'|'closed'|'draft' set —
// mapped here rather than duplicated across PostTrip.jsx/MyTrips.jsx.
export const TRIP_STATUS = {
  draft: { label: 'Draft', cls: 'bg-divider text-ink-muted' },
  published: { label: 'Active', cls: 'bg-success-light text-success' },
  full: { label: 'Full', cls: 'bg-warning-light text-warning' },
  completed: { label: 'Completed', cls: 'bg-info-light text-info' },
  cancelled: { label: 'Closed', cls: 'bg-danger-light text-danger' },
}

export function getTripStatusInfo(status) {
  return TRIP_STATUS[status] || { label: status, cls: 'bg-divider text-ink-secondary' }
}

// The Figma source only ever collected a city name via a plain dropdown —
// it never collected a country, because Trip.js's departureCountry/
// destinationCountry requirement wasn't something the prototype needed to
// satisfy. This pairs each city with its country so the form can stay a
// simple one-dropdown-per-side UX while still sending a real, valid
// country string to the backend.
export const CITY_COUNTRY = {
  Dhaka: 'Bangladesh',
  London: 'United Kingdom',
  'New York': 'United States',
  Dubai: 'United Arab Emirates',
  Toronto: 'Canada',
  Sydney: 'Australia',
  Paris: 'France',
  Frankfurt: 'Germany',
  'Kuala Lumpur': 'Malaysia',
  Singapore: 'Singapore',
}

export const CITIES = Object.keys(CITY_COUNTRY)