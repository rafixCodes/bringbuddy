# BringBuddy — Full Site Map & Feature Flow

**Purpose:** This is the master reference for how every page and feature connects. Before building any new page, check here first — where does it sit in the flow, what links into it, what links out of it. This exists so we stop building disconnected pages like `Home.jsx` was.

---

## 1. The Two User Journeys

Every feature in the project belongs to one (or both) of two core journeys. Almost all confusion about "how does X connect to Y" gets resolved by asking: which journey is this page serving?

### Journey A — Traveler (has luggage space, wants to earn)
```
Register/Login (Traveler role)
  → Dashboard
  → Post a Trip (Feature 3)
  → Trip appears in Search/Marketplace (Feature 6, 7)
  → Receives Direct Request OR Application from a sender (Feature 8)
  → Accepts → Order Hub created (Feature 9)
  → Escrow holds payment (Feature 10)
  → Carries/buys item, updates timeline (Feature 12)
  → Delivers, gets OTP from receiver (Feature 13)
  → Payment released → shows in Earnings Dashboard (Feature 18)
  → Sender leaves a Review (Feature 14)
  → Reputation Card updates, unlocks more active order slots (Feature 2, 11)
```

### Journey B — Sender (needs something delivered/bought)
```
Register/Login (Sender role)
  → Dashboard
  → Search for a Trip (Feature 6) OR post publicly (Feature 7)
  → Create an Order — Parcel (Feature 4) or Shopping Request (Feature 5)
  → Either sends Direct Request to a specific traveler,
    or posts to Public Marketplace and reviews Applications (Feature 8)
  → Picks a traveler → Order Hub created (Feature 9)
  → Escrow payment held (Feature 10)
  → Tracks progress via timeline (Feature 12)
  → Gives OTP to the receiver at delivery (Feature 13)
  → Confirms delivery → escrow releases
  → Leaves a Review for the traveler (Feature 14)
  → Can raise a Dispute if something goes wrong (Feature 20)
```

**Key insight:** most users will do both journeys — someone can be a sender this week and a traveler next month. The `User` model already reflects this (role field + `travelerInfo` sub-schema), so the UI should let a user switch modes rather than treating them as two separate account types.

---

## 2. Full Page/Route List

This is every route the finished site needs. ✅ = exists and works today. 🟡 = route exists, needs work. ❌ = doesn't exist yet.

| Route | Page | Journey | Status |
|---|---|---|---|
| `/` | Home / Landing | Both | 🟡 bare, needs decoration (on your list) |
| `/login` | Login | Both | ✅ working |
| `/register` | Register | Both | ✅ working |
| `/dashboard` | Dashboard (role-aware) | Both | 🟡 works, but currently generic — needs to branch by role eventually |
| `/profile/:id` | Traveler Profile & Reputation Card | Both | 🟡 Feature 2, backend done, no frontend yet |
| `/verify` | Traveler Verification submission | Traveler | ❌ Feature 1 |
| `/trips/new` | Post a Trip | Traveler | ❌ Feature 3 |
| `/trips/:id` | Trip Detail | Both | ❌ Feature 3 |
| `/trips/search` | Search & Filter Trips | Sender | ❌ Feature 6 |
| `/orders/new` | Create Order (Parcel/Shopping toggle) | Sender | ❌ Feature 4, 5 |
| `/marketplace` | Public Marketplace | Both | ❌ Feature 7 |
| `/orders/:id/applications` | Manage Applications | Sender | ❌ Feature 8 |
| `/orders/:id` | Order Hub (chat, timeline, receipts) | Both | ❌ Feature 9 |
| `/orders/:id/payment` | Escrow / Payment status | Both | ❌ Feature 10 |
| `/orders/:id/otp` | OTP delivery confirmation | Both | ❌ Feature 13 |
| `/orders/:id/review` | Leave a Review | Both | ❌ Feature 14 |
| `/notifications` | Notification/Activity Center | Both | ❌ Feature 15 |
| `/orders/:id/cancel` | Cancellation flow | Both | ❌ Feature 16 |
| `/earnings` | Earnings & Transaction Dashboard | Traveler | ❌ Feature 18 |
| `/admin` | Admin Control Center | Admin | ❌ Feature 19 |
| `/admin/restricted-items` | Manage Restricted Items | Admin | ❌ Feature 17 (backend done) |
| `/orders/:id/dispute` | Raise/View Dispute | Both | ❌ Feature 20 |

---

## 3. How Features Actually Depend on Each Other

This is the part that matters most for planning who-builds-what-when. Some features are pure prerequisites; others are independent and can be parallelized.

**Hard dependency chain (must be built roughly in this order):**
```
Auth (done)
  → Feature 2: Traveler Profile (mostly done)
  → Feature 3: Trip Management  ─┐
  → Feature 4/5: Order Creation  ─┤→ these three feed into:
                                   → Feature 6: Search/Filter
                                   → Feature 7: Public Marketplace
                                        → Feature 8: Booking/Applications
                                             → Feature 9: Order Hub
                                                  → Feature 10: Escrow Payment
                                                  → Feature 12: Timeline
                                                  → Feature 13: OTP Confirmation
                                                       → Feature 14: Reviews
                                                       → Feature 18: Earnings (reads Payment data)
```

**Can be built in parallel, low dependency risk:**
- Feature 1 (Verification) — only touches User model, isolated like your Feature 2
- Feature 17 (Restricted Items) — already done, isolated
- Feature 15 (Notifications) — can be stubbed early and wired in later as other features fire events into it
- Feature 19 (Admin Center) — mostly just aggregates existing data once other features exist
- Feature 11 (Capacity/Active Order limits) — business logic layered onto Trip + User, can be built once Trip exists

**Genuinely blocked until Order Hub exists:**
- Feature 16 (Cancellation) — needs an order to cancel
- Feature 20 (Disputes) — needs an order to dispute

**Practical takeaway:** Trip Management (3) and Order Creation (4/5) are the real bottleneck. Almost everything else is downstream of those two. If you want to unblock teammates fastest, get those two features built first — even barebones — and the rest of the team can build search, marketplace, and hub UI against real data instead of guessing at shapes.

---

## 4. Navigation Structure (what the nav bar should actually contain)

Right now `Home.jsx` has three plain-text links. Here's what the real nav should look like once more features exist, so you're not redesigning it five times:

**Logged out:**
`BringBuddy logo → Home | Login | Register`

**Logged in (any role):**
`BringBuddy logo → My Trips/Orders | Marketplace | Notifications (bell icon) | Profile dropdown (Profile, Earnings if traveler, Logout)`

**Admin (additional):**
`+ Admin Center link, visible only if role === 'admin'`

This is why the Dashboard route needs to eventually branch by role — a traveler's dashboard should surface "Post a Trip" and active deliveries; a sender's should surface "Create Order" and their tracked deliveries. Right now it's one generic profile-dump page, which is fine as a temporary state but shouldn't be the final design.

---

## 5. Suggested Build Order Going Forward

Given what's already true today (auth working, Feature 2 backend done, restricted-items + verification built but unmerged):

1. Finish merging what you already have (auth, restricted-item-validation)
2. Finish Feature 2 frontend (Profile Card) — you're closest to done here
3. Assign Trip Management (3) and Order Creation (4/5) next, as the unblocking bottleneck — these should probably go to two different teammates in parallel since they're independent of each other structurally (different models) even though both feed into search/marketplace later
4. Once those exist, Search/Filter (6), Marketplace (7), and Booking (8) can all be worked in parallel by different people since they're mostly querying, not creating
5. Order Hub (9) is the next real convergence point — whoever builds it needs Trip + Order + Application all functioning first
6. Everything downstream of Order Hub (10, 12, 13, 14, 18, 16, 20) can be split across the team once the Hub exists

---

## 6. Living Document Note

Update this file as features actually get merged — flip the status column in section 2, and note in section 3 if a dependency assumption turns out wrong once you're actually building it. Treat this the same way you treat INDEX.md — a snapshot that needs to stay honest, not a one-time plan.
