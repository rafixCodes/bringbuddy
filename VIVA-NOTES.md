# BringBuddy - Viva Notes

Features completed so far: **7, 8, 9** (from the sprint sheet).

---

## 1. Setup and running

### What you need installed
- **Node.js 22**
- **pnpm 10.34.3** - if you do not have it, either `npm install -g pnpm`
  or just use `npx pnpm@10.34.3` in place of `pnpm` in every command below

The exact versions are pinned in `.mise.toml`.

### Steps
```bash
cd "BATCH FINAL"
pnpm install          # reads pnpm-lock.yaml, installs exact versions
pnpm dev              # starts the dev server
```
Then open **http://localhost:8443/** in the browser.

The port is **8443**, not Vite's usual 5173. `vite.config.ts` sets
`port: parseInt(process.env.PORT || '8443')` with `strictPort: true`.

Two things follow from `strictPort: true`:
- if 8443 is already in use the server **fails to start** instead of quietly
  moving to another port
- to run on a different port, set the env var: `PORT=3000 pnpm dev`

`pnpm preview` uses the same 8443 default.

The dev server has hot reload, so saving a file updates the page immediately.

### Other commands
```bash
pnpm build                 # production build into dist/
pnpm preview               # serve the built dist/ folder
pnpm exec tsc --noEmit     # type-check only, no output files
```

Use `pnpm exec tsc`, not `npx tsc`. If `node_modules` is missing, `npx tsc`
downloads an unrelated package called `tsc` from npm and prints
"This is not the tsc command you are looking for" instead of type-checking.

### Important - do not delete the .figma folder
`vite.config.ts` imports `./.figma/make/site.json` on its very first lines.
If that folder is missing, **both `pnpm dev` and `pnpm build` fail** with
`Could not resolve './.figma/make/site.json'`. It looks like an ignorable
config folder but it is a real dependency of the build.

### Things you do NOT need
- No database. No MongoDB, no connection string.
- No backend server.
- No `.env` file, no API keys.

Everything runs in the browser. All data is seeded in the code and held in
React state - see section 6.

### Folders that are generated, not source
`node_modules/` and `dist/` are produced by the commands above. They are
listed in `.gitignore` and are not part of the submitted source.

### Dependencies

Runtime:
| Package | Version | Used for |
|---|---|---|
| react | 19.2.4 | UI library |
| react-dom | 19.2.4 | React renderer for the browser |
| lucide-react | 0.462.0 | Icon set used across every screen |

Build and development:
| Package | Version | Used for |
|---|---|---|
| vite | 8.0.3 | Dev server and bundler |
| @vitejs/plugin-react | 6.0.1 | React support (JSX, hot reload) |
| typescript | 5.9.3 | Type checking, strict mode on |
| tailwindcss | 4.2.2 | Styling, utility classes in the JSX |
| @tailwindcss/vite | 4.2.2 | Tailwind v4 plugin for Vite |
| @types/react, @types/react-dom, @types/node | - | Type definitions |
| oxfmt | 0.2.0 | Formatter (present but not run on this codebase) |

Note on Tailwind: this is **Tailwind v4**, which needs no `tailwind.config.js`
and no PostCSS config. It is wired through the Vite plugin, and
`src/index.css` pulls it in with a single `@import 'tailwindcss';`.

### Entry points, if asked how the app boots
```
index.html          -> has the #root div, loads src/main.tsx
src/main.tsx        -> mounts <App /> wrapped in <RouterProvider> and
                       <ToastProvider>, inside <React.StrictMode>;
                       also imports src/index.css
src/App.tsx         -> one switch statement on the current page name
src/lib/router.tsx  -> the page name state and all shared app state
src/lib/toast.tsx   -> the toast notification provider
```
There is no react-router. Navigation is a single `page` value in context and a
`switch` in `App.tsx` that returns the matching screen. `navigate('marketplace')`
just sets that value. That is why the URL never changes as you move around,
and why a browser refresh always returns to the landing page.

`src/index.css` loads the Inter font from Google Fonts on its first line, then
imports Tailwind. Without internet the app still works, it just falls back to
the system font.

---

## 2. Feature numbering - read this first

The sprint sheet and the project proposal PDF use **different numbers** for the
same features. If the examiner asks by number, be ready for both.

| Sprint sheet | Proposal PDF | Feature name |
|---|---|---|
| 7 | Feature 6 | Smart Traveler Search & Filtering |
| 8 | Feature 7 | Public Delivery Marketplace |
| 9 | Feature 8 | Booking & Application Management (direct request half) |

Safe way to answer: "In our sprint plan these are 7, 8 and 9. In the proposal
document they are features 6, 7 and 8."

Business rule from the PDF that ties 8 and 9 together:
**"Two booking methods: Direct Request and Public Marketplace."**
Feature 9 is the direct path, Feature 8 is the public path. Both end in the
same place - an accepted order that opens the Order Hub.

---

## 3. Feature 7 - Smart Traveler Search & Filtering

### What it does
A sender searches for travelers who are already flying their route, then
narrows the list down with filters and sorting.

### What the PDF asks for
"Search by route, travel date, capacity, rating, trust level, verification
and price." All seven are implemented.

| Requirement | How it is handled |
|---|---|
| Route | From and To city dropdowns, exact match |
| Travel date | Shows trips departing on or after the chosen date |
| Capacity | Minimum free kg slider |
| Rating | Minimum star rating slider |
| Trust level | High Trust / Trusted / New chips, multi-select |
| Verification | "Verified only" toggle |
| Price | Maximum fee per kg slider |

### Where the code is
- `src/data/prototype.ts` - the data and the `searchTrips()` function
- `src/components/trips/TripSearch.tsx` - the screen

The search logic sits in the data file, not in the component. Reason: the
component only deals with the UI, and the filtering can be tested on its own.
Later, when a backend exists, only this one function needs to be swapped for
an API call.

### How searchTrips() works
It takes one criteria object and runs each trip through a filter chain:

1. `trip.fromCity` must equal the chosen From city
2. `trip.toCity` must equal the chosen To city
3. `trip.departISO >= criteria.date`
4. free capacity (`capacityKg - usedKg`) must be >= minimum capacity
5. `feePerKg` must be <= maximum fee
6. traveler rating must be >= minimum rating
7. if "verified only" is on, traveler must be verified
8. if any trust level chips are selected, traveler's level must be one of them

Whatever survives is then sorted.

### The departISO field (likely viva question)
Trips originally stored the date only as a display string like `'28 Aug 2026'`.
The date picker gives `'2026-08-28'`. Those two cannot be compared, so the
date filter could not work at all.

So a second field `departISO` was added to every trip, holding the ISO form.
The display string is kept for the UI. ISO dates in `YYYY-MM-DD` form sort
correctly as plain strings, so the comparison is a simple `>=` with no date
parsing needed.

### Sorting - five options
- **Best match** (default) - scoring function, explained below
- **Lowest price** - `feePerKg` ascending
- **Highest rating** - traveler rating descending
- **Departing soonest** - `departISO` ascending
- **Most space left** - free kg descending

### The "Best match" score
This is the "Smart" part of the feature name. Each result gets a score and the
highest score goes first:

```
score  = rating x 10                          (up to 50)
       + trust level bonus                    (High Trust 20, Trusted 12, New 4)
       + 10 if the traveler is verified
       + min(completedDeliveries, 40) / 4     (up to 10)
       + min(freeCapacityKg, 10)              (up to 10)
       + max(0, 10 - daysAfterChosenDate / 3) (up to 10)
       - feePerKg / 100                       (cheaper scores higher)
```

Why these factors: they are the same things the PDF says build trust -
ratings, verification, delivery history - plus the two practical things a
sender cares about, which are how close the flight is to their date and how
cheap it is.

Worked example - searching Dhaka to London from 28 Aug 2026:
Aisha Rahman scores 100.5 and comes first (4.9 rating, High Trust, verified,
42 deliveries, flying exactly on the chosen date). Nadia Sultana scores 54.0
and comes last (unverified, New, only 3 deliveries).

### Data that was added
The original data had only 5 travelers and 5 trips, and every trip was
Dhaka to London. So route filtering could not be demonstrated - any search
returned the same five rows.

Now: **10 travelers, 17 trips, 8 cities** (Dhaka, Dubai, Frankfurt, London,
New York, Paris, Sydney, Toronto), covering both directions on several
routes, and all three trust levels.

The city dropdown is not a hardcoded list. `TRIP_CITIES` is built from the
trip data itself, so the dropdown can never offer a city that has no trips.

---

## 4. Feature 8 - Public Delivery Marketplace

### What it does
Instead of choosing one traveler, the sender posts the request publicly.
Travelers going that route see it and apply with their own carrying fee. The
sender compares the applicants and picks one.

### What the PDF asks for
"Publish orders publicly so matching travelers can apply with their carrying
fee."

Three parts: **publish**, **matching travelers**, **apply with their fee**.

### Where the code is
- `src/lib/router.tsx` - the data types and the stored requests
- `src/components/orders/MarketplacePost.tsx` - publishing a request
- `src/components/marketplace/Marketplace.tsx` - the browse screen
- `src/components/marketplace/MarketplaceRequestDetail.tsx` - one request, apply / withdraw
- `src/components/marketplace/ApplicationsView.tsx` - sender reviews and picks

### Data model
`MarketplaceRequest`
- `id`, `type` (carry-only or shopping-request)
- sender fields: `senderId`, `senderName`, `senderInitials`, `senderVerified`, `senderRating`
- `from`, `to`, `travelDate`
- carry-only fields: `weightKg`, `suggestedFee`, `itemDescription`
- shopping fields: `productName`, `productUrl`, `quantity`, `budget`
- `specialInstructions`, `postedHoursAgo`
- `status`: open / traveler-selected / closed
- `applications`: array of TravelerApplication

`TravelerApplication`
- `id`, `requestId`, `travelerId`
- a snapshot of the traveler at the time of applying: name, initials,
  verified, trust level, rating, deliveries, cancellation rate, response time
- `proposedFee`, `message`, `status` (pending / accepted / declined)
- which trip they will carry it on: `tripFrom`, `tripTo`, `tripDate`

Why the application stores a snapshot of the traveler instead of just an id:
the sender is comparing offers, and the numbers they compared should stay the
same even if the traveler's stats change later.

Currently seeded with **9 requests**, some with applications and some without,
so both the populated list and the empty state can be shown.

### Publishing
This was the biggest gap. The "Post Request" button used to create an order
object and nothing else - **nothing was ever added to the marketplace**, so
the core promise of the feature did not work.

Now `MarketplacePost.tsx` builds a full `MarketplaceRequest` and inserts it at
the front of the list with `postedHoursAgo: 0`. The sender also picks the
route, the travel-by date, and the suggested fee or budget on this screen,
because a request without a route cannot be matched to any traveler.

### Matching travelers
`matchingTrip(request, myTrips)` decides whether a request matches one of the
logged-in traveler's own published trips. A trip matches when:

1. the trip is active
2. `trip.from === request.from` and `trip.to === request.to`
3. `daysApart(trip.date, request.travelDate) <= 14`

If more than one trip matches, the closest one by date wins.

Why 14 days: a sender writes "travel by 12 September" as a target, not an
exact date. Two weeks is close enough to be useful without matching a flight
that is months away. A traveler flying on 14 October will **not** match a
request that needs delivery by 5 September - and that is correct behaviour,
not a bug.

Matching requests get a green "Matches your trip" badge on the card.

### Filters and sorting
Filters: text search (route, product, item), route, verified-senders-only,
and a minimum / maximum fee range. For the fee the value compared is
`suggestedFee` for carry requests and `budget` for shopping requests.

Sorts:
- **Newest** - `postedHoursAgo` ascending
- **Travel date** - travel date ascending
- **Highest fee** - fee or budget descending
- **Closest match** - matching requests first, closest date gap first, then newest

"Newest" needed a change. The posted time was stored only as a display string
like `'2 hours ago'`, which cannot be sorted. It is now stored as a number
`postedHoursAgo`, and the label is produced by a small `formatPostedAgo()`
helper. One value, no chance of the number and the label disagreeing.

### Who sees what
- A **sender** gets two tabs: "My Requests" (their own posts, with the
  application count and a Review Applications button) and "All Requests".
- A **traveler** never sees their own requests. You cannot carry your own
  parcel, and you cannot apply to your own post.

### Applying, withdrawing, accepting
**Apply** - the traveler enters their own carrying fee (pre-filled with the
sender's suggestion) and an optional message. The application is built from
the real logged-in traveler's profile.

**Withdraw** - allowed while the request is still open.

**Accept** - in `ApplicationsView` the sender picks one. The chosen
application becomes `accepted`, all others become `declined`, the request
becomes `traveler-selected`, an order is created and the Order Hub opens.

**Compare** - two or more applicants can be shown side by side in a table.
The best value in each row (lowest fee, highest rating, most deliveries) is
highlighted.

### Bugs that were fixed here (good viva material)
1. **Applications were fake.** `ApplicationsView` had a hardcoded
   `DEMO_APPLICATIONS` array tied to request `mr1`. Opening the applications
   of *any* request showed mr1's three applicants. Now every request carries
   its own applications and the fallback is gone.

2. **The applicant was always the same person.** Applying built the
   application with `travelerId: 't1'`, rating 4.9, 42 deliveries hardcoded,
   no matter who was logged in. It now reads the real profile through
   `getTravelerById(currentTravelerId)`.

3. **The status field meant two things at once.** `MarketplaceRequest.status`
   had a value `'applied'`, which was used to mean both "somebody applied" and
   "I applied". Those are different questions. `'applied'` was removed from the
   status list, and "have I applied" is now answered by looking for the
   traveler's own id inside `request.applications`.

4. **Filters and sorts that did nothing.** The minimum / maximum fee inputs
   were collected but never applied, and three of the four sort options had no
   code behind them.

---

## 5. Feature 9 - Direct Booking

### What it does
The other booking method. The sender picks one specific traveler's trip and
sends a request straight to them. The traveler accepts or declines.

### What the PDF asks for
"Supports both direct requests and public applications with
accept / reject / confirm workflow."

### The full flow
```
Trip Search  ->  Trip Detail  ->  "Request"
      -> Order Creation   (type -> parcel details -> booking method)
      -> chooses "Direct Request"
      -> Order Summary    (review, capacity check)
      -> Send             (order status = pending)
      -> traveler's dashboard shows "New Request"
      -> Request Detail   -> Accept   (status = accepted, Order Hub opens)
                          -> Decline  (status = cancelled, reason recorded)
```

### Where the code is
- `src/components/orders/OrderSummary.tsx` - sender's review and send
- `src/components/orders/RequestDetail.tsx` - traveler's accept / decline

### What was fixed on the sender side
**Order id.** Every direct order was created with the id `'BB-1048'`
hardcoded, so all orders shared one number. Now each order gets its own
generated id.

**Booking with no traveler chosen.** The review screen fell back to
`selectedTravelerId ?? 't1'` and `selectedTripId ?? 'tr1'`. If the sender
started from the dashboard shortcut instead of from a trip, no traveler was
ever selected, and the order was silently booked with Aisha Rahman on trip
tr1 - a traveler the sender never picked.

Now the review screen refuses to send an incomplete direct request. It shows a
"Pick a traveler first" screen with a button into the search. The parcel
details are not lost, because the traveler selection is merged into the
existing draft rather than replacing it.

**Capacity validation.** There was no check at all, so a 10 kg parcel could be
booked onto a trip with 2 kg of space left. The review screen now shows a
"Space left" row, and sending is blocked with an explanation if the parcel is
heavier than the free capacity.

### What was fixed on the traveler side
**The capacity bar was fake.** The accept screen used two constants,
`CAPACITY_TOTAL = 6` and `CAPACITY_USED_BEFORE = 0`. They had no connection to
the trip being booked, so the bar showed the same numbers for every order. It
now reads the real trip through `getTripById(activeOrder.tripId)`.

**The sender was hardcoded.** The screen always showed "Alex Johnson", "AJ",
"4.7 star, 8 completed orders", whoever actually sent the request. It now
shows the real sender name. The rating line was removed rather than faked,
because that data does not exist anywhere in the order.

**Special instructions were hardcoded** to "Handle with care. Fragile items
inside." - whatever the sender had actually typed was never shown. It now
shows the real text, and the row is hidden when there are no instructions.

**Accepting destroyed data.** Accept rebuilt the order object field by field
with fallback values, and any field it did not list was lost - sender name,
special instructions, receiver phone, product URL, quantity, budget. It now
updates the status on the existing object, so nothing is dropped.

**Declining was a dead end.** It set the active order to `null`. The order
simply vanished and the sender was never told anything. Now the traveler picks
a reason (luggage full, dates changed, not comfortable with the item, other)
and can add a note. The order becomes `cancelled` with the reason stored, and
a notification goes to the sender, whose dashboard shows it in red.

Before doing that, both dashboards were checked to make sure a `cancelled`
status could not crash them - the sender's status map has a `cancelled` entry,
and the traveler's dashboard filters by an explicit list that excludes it.

**Timestamps and notifications** are now recorded on send, accept and decline.

---

## 6. Where the data lives

This is a **frontend prototype**. There is no server yet. All state lives in
one React context in `src/lib/router.tsx`, provided to the whole app.

Main pieces of state:
- `user` - who is logged in, and whether they are in sender or traveler mode
- `myTrips` - the logged-in traveler's published trips
- `marketplaceRequests` - all public requests and their applications
- `activeOrder` - the order currently being worked on
- `notifications`, `earnings`, `disputes`, `adminUsers`
- `currentTravelerId` / `currentSenderId` - which seeded person "you" are

Reference data that does not change - travelers, trips, restricted item
rules, fee calculation - lives in `src/data/prototype.ts`.

Because it is all in memory, **refreshing the page resets everything.** Say
this openly if asked; it is expected for a prototype.

---

## 7. How this maps to a MERN backend (very likely viva question)

The proposal specifies MongoDB, Express, React, Node with MVC. Nothing is
built yet, but the frontend is arranged so the swap is mostly mechanical.

Collections:
| Collection | Comes from |
|---|---|
| `users` | `user`, `adminUsers` |
| `trips` | `TRIPS`, `myTrips` |
| `orders` | `activeOrder` |
| `marketplacerequests` | `marketplaceRequests` |
| `applications` | `TravelerApplication` (own collection, referencing request and traveler) |
| `notifications` | `notifications` |
| `reviews`, `disputes`, `transactions` | later features |

Endpoints these three features would need:
```
GET  /api/trips/search?from=&to=&date=&minCapacity=&maxFee=&minRating=
                       &verified=&trustLevel=&sort=
GET  /api/marketplace/requests?type=&route=&minFee=&maxFee=&sort=
POST /api/marketplace/requests
POST /api/marketplace/requests/:id/applications
DEL  /api/marketplace/requests/:id/applications/:appId
POST /api/marketplace/requests/:id/select
POST /api/orders                      (direct request)
POST /api/orders/:id/accept
POST /api/orders/:id/decline
```

MVC mapping: the React screens are the View. Express route handlers are the
Controller. Mongoose schemas are the Model. The search scoring and the
route-matching rules belong in the Model layer or a service, not in the
Controller, for the same reason `searchTrips()` is not inside the component.

---

## 8. Questions to be ready for

**Q. Why is the search called "smart"?**
It does not just filter, it ranks. Six factors are combined into one score -
rating, trust level, verification, delivery history, free capacity and how
close the flight is to the requested date - and the fee is subtracted so
cheaper trips rank higher. The top result is labelled "Best match".

**Q. Why did you need a second date field on trips?**
The trip stored the date only as text, `'28 Aug 2026'`, and the date picker
produces `'2026-08-28'`. They cannot be compared, so date filtering was
impossible. `departISO` stores the comparable form and the display string
stays for the UI.

**Q. How do you decide a traveler "matches" a request?**
Same origin, same destination, and the trip departs within 14 days of the
sender's target date. If several trips match, the closest one is used.

**Q. Why can't a traveler see their own requests in the marketplace?**
Because you cannot carry your own parcel. In this prototype one account can
switch between sender and traveler mode, so requests posted by the logged-in
sender id are filtered out of the traveler's browse list.

**Q. What happens if a traveler declines a direct request?**
They choose a reason and may add a note. The order becomes `cancelled` with
that reason saved, a notification goes to the sender, and the sender sees it
marked Cancelled. Letting the sender then pick another traveler is the
Cancellation and Recovery feature, which is not built yet.

**Q. Why is the capacity check on the review screen and not earlier?**
The review screen is where the order is actually committed, and it is the
first point where the parcel weight and the specific trip are both known. It
is the last gate before sending.

**Q. Two order types and two booking methods - how do they combine?**
Order types are Carry Only and Shopping Request. Booking methods are Direct
Request and Public Marketplace. Any type can go through either method, so
there are four combinations, and all four end in an accepted order with an
Order Hub.

**Q. What is not done yet?**
Trust score, reviews being stored, trip cancellation, saved trips, per-order
OTP, profile saving, admin approval wiring, event notifications, and file
sharing in the Order Hub. Also JWT and role-based authorization, which
genuinely need a server.

**Q. How did you test it without a backend?**
TypeScript strict mode and a production build on every change, plus a script
that runs the search function against the real trip data and checks the
filters and each sort order. The date helpers were checked for all twelve
months after finding that one month formatted differently from the rest.
