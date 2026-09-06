BATCH 5 — BRINGBUDDY MARKETPLACE ECOSYSTEM

IMPORTANT:
Continue from the CURRENT BringBuddy application exactly as it exists after Batch 4.

This is an ADDITIVE extension.

DO NOT restart the project.
DO NOT regenerate the entire application.
DO NOT replace the existing design system.
DO NOT delete or simplify existing functionality.
DO NOT rebuild the Batch 4 Order Hub lifecycle.

The existing Batch 4 Order Hub is now the stable transaction core.

PRESERVE IT.

============================================================
BATCH 5 OBJECTIVE
============================================================

Batch 5 should build the ecosystem AROUND the existing Order Hub.

The main goal is to make the complete discovery and booking experience feel like a real marketplace:

TRAVELER:
Dashboard
→ Post Trip
→ Trip becomes discoverable
→ Receive direct request OR marketplace application
→ Accept
→ Existing Order Hub

SENDER:
Dashboard
→ Search Trips
→ View Trip / Traveler
→ Create Carry Order OR Shopping Request
→ Direct Request OR Public Marketplace
→ Review Applications
→ Select Traveler
→ Existing Order Hub

The key outcome is:

TRIP MANAGEMENT
+
TRIP SEARCH
+
PUBLIC MARKETPLACE
+
APPLICATIONS
+
SHOPPING REQUESTS
+
ORDER HUB CONNECTION

============================================================
CURRENT IMPLEMENTATION — DO NOT REBUILD
============================================================

The current application already contains substantial functionality.

Preserve all of this:

- Landing page
- Authentication
- Registration
- Login
- Forgot password
- Onboarding
- Sender mode
- Traveler mode
- Mode switching
- Traveler verification flow
- Sender dashboard
- Traveler dashboard
- Traveler profile
- Trip Search foundation
- Traveler cards
- Order creation
- Carry Only order
- Shopping Request foundation
- Direct booking
- Marketplace posting foundation
- Order summary
- Order request flow
- Traveler request review
- Traveler acceptance
- Capacity visualization
- Restricted-item validation
- Order Hub
- Chat
- Shared files
- Order timeline
- Escrow/payment prototype
- Pickup
- Transit
- OTP
- Delivery completion
- Reviews
- Cancellation
- Dispute foundation
- Notifications/toasts
- Existing responsive behavior
- Existing animation/micro-interaction language

Especially:

DO NOT REBUILD OR REPLACE THE EXISTING ORDER HUB.

============================================================
PART 1 — TRAVELER TRIP MANAGEMENT
============================================================

Build the complete Traveler-side trip management experience.

The Traveler should be able to:

1. View current trips
2. Create a new trip
3. View trip details
4. Edit a trip
5. Manage luggage capacity
6. See orders associated with a trip
7. Close/disable a trip

Use the existing Traveler Dashboard and navigation.

Do not create a separate unrelated visual system.

============================================================
PART 2 — MY TRIPS
============================================================

Add a "My Trips" area to Traveler navigation/dashboard.

Show trip cards containing:

Origin
Destination
Travel date
Available capacity
Used capacity
Fee per kg
Active orders
Trip status

Example:

Dhaka → London

28 Aug 2026

6 kg available
2 kg committed

৳450/kg

2 active deliveries

Status:
Active

CTA:
View Trip

Secondary:
Manage

============================================================
PART 3 — POST A TRIP
============================================================

Create the Traveler "Post a Trip" experience.

Fields:

From
To
Departure date
Arrival date if appropriate
Available luggage capacity
Fee per kg
Allowed item categories
Pickup preferences
Additional notes

Example:

Post Your Trip

From:
Dhaka

To:
London

Travel date:
28 Aug 2026

Available capacity:
8 kg

Carrying fee:
৳450/kg

Allowed categories:

☑ Documents
☑ Clothing
☑ Small Electronics
☑ Gifts

CTA:

Publish Trip

Secondary:

Save Draft

============================================================
PART 4 — TRIP VALIDATION
============================================================

Provide sensible validation.

Examples:

Capacity:
"Enter a valid luggage capacity."

Fee:
"Please enter a carrying fee."

Date:
"Travel date must be in the future."

Route:
"Please enter both origin and destination."

Keep errors consistent with the existing design system.

============================================================
PART 5 — PUBLISH TRIP SUCCESS
============================================================

After publishing:

show a polished success state:

✓ Trip published

"Your Dhaka → London trip is now visible to Senders."

Show:

28 Aug 2026
8 kg capacity
৳450/kg

CTA:

View Trip

Secondary:

Go to Dashboard

Use subtle success animation and toast.

============================================================
PART 6 — TRIP DETAIL
============================================================

Create a proper Trip Detail experience.

A Sender should be able to reach this from:

Trip Search
Traveler Profile
Marketplace context where appropriate

Show:

Traveler
Verification
Trust level
Rating
Completed deliveries
Response time
Cancellation rate

Trip:

Dhaka → London
28 Aug 2026

Available luggage:
6 kg

Fee:
৳450/kg

Allowed categories

Pickup preferences

Traveler notes

Primary CTA:

Request This Traveler

Secondary:

View Profile

============================================================
PART 7 — TRIP EDITING
============================================================

Traveler should be able to edit a published trip.

Possible editable fields:

capacity
fee
pickup preferences
notes
allowed categories

Do not allow nonsensical changes after active orders exist.

For example:

If 4 kg is already committed:

Current committed:
4 kg

Available:
4 kg

Do not let the Traveler reduce total capacity below the committed amount.

Show a clear explanation if necessary.

============================================================
PART 8 — TRIP CAPACITY
============================================================

Connect trip capacity to the existing capacity visualization.

Example:

8 kg total

██████░░

2 kg committed
6 kg available

Show:

Active Orders:
2

Available:
6 kg

When an order is accepted, prototype state should update where practical.

Use the existing capacity/business logic rather than creating another capacity system.

============================================================
PART 9 — TRIP CLOSE / DISABLE
============================================================

Allow Traveler to close a trip if appropriate.

CTA:

Close Trip

Confirmation:

"Stop accepting new delivery requests for this trip?"

Explain:

"Existing accepted orders will remain active."

Actions:

Close Trip

Keep Active

After closing:

Status:
Closed

New Senders should not be able to request this trip.

Existing orders remain accessible.

============================================================
PART 10 — SENDER TRIP SEARCH
============================================================

Now make Trip Search a complete discovery experience.

The Sender should be able to search:

From
To
Travel date
Weight/capacity

Example:

From:
Dhaka

To:
London

Travel date:
28 Aug

Parcel weight:
2.5 kg

CTA:

Search Trips

============================================================
PART 11 — SEARCH RESULTS
============================================================

Display multiple relevant Traveler/Trip cards.

Each card should show:

Traveler avatar
Name
Verified badge
Trust level
Rating
Completed deliveries

Trip route
Date
Available capacity
Fee per kg

Example:

Aisha Rahman
✓ Verified
High Trust

★ 4.9
42 deliveries

Dhaka → London

28 Aug 2026

6 kg available

৳450/kg

Response time:
~15 min

CTA:

View Trip

Secondary:

Request

Cards should have subtle hover/elevation interaction.

============================================================
PART 12 — SEARCH FILTERS
============================================================

Add useful filters.

Filters:

Travel date
Price per kg
Available capacity
Rating
Verified travelers
Trust level

Provide:

Sort by:

Recommended
Lowest fee
Highest rating
Soonest trip

Filters should work in prototype state where practical.

Do not overcomplicate.

============================================================
PART 13 — SEARCH EMPTY STATE
============================================================

If no trips match:

"No trips found"

"Try adjusting your date, route, or weight."

Actions:

Adjust Search

Browse Marketplace

Keep the experience helpful.

============================================================
PART 14 — TRAVELER PROFILE
============================================================

The existing Traveler Profile should become a useful destination from search.

Show:

Profile photo/avatar
Name
Verified badge
Trust level
Rating
Completed deliveries
Cancellation rate
Response time
Member since

Bio

Recent trip examples

Reviews preview

Active route

CTA:

Request This Traveler

Do not duplicate unrelated profile implementations.

============================================================
PART 15 — DIRECT REQUEST FLOW
============================================================

Connect Trip Search / Trip Detail to existing Order Creation.

Sender chooses:

Request This Traveler

Then:

Create Order

The selected traveler and selected trip should already be populated.

Do NOT make the Sender select the traveler again.

Example:

Traveler:
Aisha Rahman

Trip:
Dhaka → London
28 Aug 2026

Then Sender selects:

Carry Only
OR
Shopping Request

============================================================
PART 16 — CARRY ONLY ORDER
============================================================

Preserve the existing Carry Only order flow.

Make sure it clearly includes:

Item description
Weight
Pickup
Destination/route
Receiver
Receiver phone
Special instructions

Run restricted-item validation.

Then:

Order Summary
→ Request Traveler
→ Existing request flow
→ Traveler accepts
→ Existing Order Hub

DO NOT rebuild the downstream lifecycle.

============================================================
PART 17 — SHOPPING REQUEST
============================================================

Now make Shopping Request a genuine second order type.

The Sender should be able to choose:

Carry a Parcel

OR

Buy Something Abroad

For Shopping Request show:

Product URL
Product name if available
Quantity
Budget
Preferred size/color/variant
Instructions
Delivery destination
Receiver information

Example:

Shopping Request

Product:
[Product URL]

Quantity:
1

Budget:
৳12,000

Preferred variant:
Black · Size M

Instructions:
"Please purchase the black version, size M."

CTA:

Continue

============================================================
PART 18 — SHOPPING REQUEST REVIEW
============================================================

Create a Shopping Request summary.

Show:

Shopping Request

Product
Quantity
Budget
Traveler
Route
Travel date
Instructions

Estimated total

Explain:

"The traveler will purchase the item abroad and bring it to the destination."

Then:

Request Traveler

After acceptance:

→ existing Order Hub

The Order Hub should display Shopping Request information appropriately.

Do NOT create a completely separate lifecycle.

============================================================
PART 19 — PUBLIC MARKETPLACE
============================================================

Build the Public Marketplace as a major feature.

The Marketplace should contain public delivery/shopping requests posted by Senders.

Example cards:

Need a parcel carried

Dhaka → London
2.5 kg

Travel date:
28 Aug

Sender:
Verified

Suggested carrying fee:
৳1,100

Posted:
2 hours ago

CTA:

View Request

For Shopping Requests:

Need help buying abroad

London → Dhaka

Product:
[Product name]

Budget:
৳12,000

Quantity:
1

CTA:

View Request

============================================================
PART 20 — MARKETPLACE FILTERS
============================================================

Marketplace filters:

Route
Travel date
Order type
Weight
Budget
Request type

Tabs:

All
Carry Only
Shopping Requests

Search:

Search destination or route

Provide sorting:

Newest
Travel date
Highest fee
Closest match

============================================================
PART 21 — MARKETPLACE REQUEST DETAIL
============================================================

When Traveler opens a public request:

show:

Sender
Verification/trust information
Route
Travel date
Order type
Parcel details OR shopping details
Weight
Special instructions
Receiver details where appropriate
Suggested carrying fee

Primary CTA:

Apply to Carry

Secondary:

Message Sender

Do not expose unnecessary private information.

============================================================
PART 22 — TRAVELER APPLICATION
============================================================

When Traveler selects:

Apply to Carry

show a compact application modal.

Fields:

Your carrying fee

Optional message

Example:

Your fee:
৳1,100

Message:
"I'll be flying to London on 28 Aug and can pick up in Dhanmondi."

CTA:

Submit Application

After submission:

✓ Application sent

"Alex can now review your offer."

Use a toast and subtle success animation.

============================================================
PART 23 — SENDER APPLICATIONS
============================================================

Create:

/orders/:id/applications

or equivalent prototype view.

Sender sees applications for their public request.

Each application card:

Traveler
Verified
Trust level
Rating
Completed deliveries
Cancellation rate
Response time
Proposed carrying fee
Message

Actions:

View Profile

Accept Traveler

Compare

============================================================
PART 24 — APPLICATION COMPARISON
============================================================

Provide a useful comparison experience.

Compare:

Traveler
Rating
Completed deliveries
Trust
Cancellation
Response time
Fee

Use a comparison drawer/modal if that fits the existing design.

Keep it simple and readable.

============================================================
PART 25 — SELECT TRAVELER
============================================================

When Sender chooses:

Accept Traveler

show confirmation:

"Choose Aisha Rahman for this delivery?"

Show:

Fee:
৳1,100

Route:
Dhaka → London

Travel date:
28 Aug

CTA:

Choose Traveler

After confirmation:

✓ Traveler selected

Then transition directly into the existing Order Hub.

Do NOT create another disconnected order lifecycle.

============================================================
PART 26 — APPLICATION STATES
============================================================

Public Marketplace request should visually support:

Open
Application submitted
Traveler selected
Closed

Traveler application states:

Applied
Accepted
Declined

Sender should be able to see the current application state.

============================================================
PART 27 — MARKETPLACE EMPTY STATES
============================================================

If no public requests exist:

"No matching requests"

"Try another route or check back later."

CTA:

Browse Trips

If Traveler has no suitable requests:

"No requests match your route."

CTA:

Search Another Route

============================================================
PART 28 — DIRECT VS MARKETPLACE CLARITY
============================================================

Make the distinction between the two booking methods extremely clear.

DIRECT REQUEST:

Sender
→ chooses specific Traveler/Trip
→ creates order
→ sends request
→ Traveler accepts
→ Order Hub

PUBLIC MARKETPLACE:

Sender
→ creates public request
→ Travelers apply
→ Sender reviews applications
→ selects Traveler
→ Order Hub

Do not confuse these two flows.

============================================================
PART 29 — MODE-SPECIFIC EXPERIENCE
============================================================

Remember:

One account.

Two modes.

Sender Mode:

Search Trips
Create Order
Post Marketplace Request
Track Orders
Review Travelers

Traveler Mode:

My Trips
Post Trip
Browse Marketplace Requests
Apply to Carry
Manage Deliveries
View Earnings

The user can switch between modes using the existing mode switch.

Do NOT create separate accounts.

============================================================
PART 30 — NAVIGATION
============================================================

Extend the existing authenticated navigation without breaking it.

Sender navigation should expose:

Dashboard
Find a Trip
Marketplace
My Orders
Notifications
Profile

Traveler navigation:

Dashboard
My Trips
Marketplace
My Deliveries
Notifications
Earnings
Profile

Do not add Admin to the normal user navigation.

Admin will be built separately in Batch 7.

============================================================
PART 31 — DASHBOARD INTEGRATION
============================================================

Update existing dashboards rather than rebuilding them.

Traveler Dashboard should show:

Upcoming Trips
Available Capacity
Active Deliveries
Pending Requests
Recent Earnings preview

CTA:

Post a Trip

Sender Dashboard should show:

Active Deliveries
Pending Requests
Recent Orders
Suggested Trips

CTA:

Find a Trip

CTA:

Create Order

Use the existing dashboard components and design language.

============================================================
PART 32 — ORDER CONNECTION
============================================================

This is critical.

Every path must converge into the existing Order Hub.

Direct:

Trip Search
→ Traveler
→ Order Creation
→ Request
→ Accept
→ Order Hub

Marketplace:

Marketplace
→ Public Request
→ Applications
→ Select Traveler
→ Order Hub

Shopping:

Shopping Request
→ Traveler
→ Request/Applications
→ Accept
→ Order Hub

Do not create separate fake Order Hub implementations.

Use the existing activeOrder state.

============================================================
PART 33 — PROTOTYPE STATE
============================================================

Extend the existing prototype state cleanly.

Reuse:

RouterContext
activeOrder
orderDraft
existing traveler/trip data
existing toast system

Do NOT create duplicate global state systems unnecessarily.

Prototype state is fine.

The backend will replace it later.

============================================================
PART 34 — ANIMATION
============================================================

Continue the established animation language.

Use subtle motion for:

Search results entering
Filter drawer
Card hover
Trip publishing
Application submission
Traveler selection
Marketplace request submission
Mode switching
Toast notifications
Successful transitions

Examples:

Publish Trip
→ loading
→ success
→ trip appears in My Trips

Apply
→ submitting
→ success toast

Choose Traveler
→ confirmation
→ transition to Order Hub

Do NOT over-animate.

Motion should communicate state and hierarchy.

============================================================
PART 35 — MOBILE
============================================================

Everything introduced in this batch must remain responsive.

Mobile requirements:

Search filters become a drawer/sheet
Traveler cards stack
Marketplace cards stack
Application comparison becomes a drawer
Order creation remains easy to complete
Trip creation fields stack
Navigation remains usable
No horizontal scrolling

Preserve existing mobile behavior.

============================================================
PART 36 — CREATIVE DESIGN FREEDOM
============================================================

You may improve any of these experiences if you have a better design idea:

Trip cards
Trip Detail
Search filters
Marketplace cards
Application comparison
Shopping Request
Trip creation
Application modal
Dashboard information hierarchy
Animations
Floating cards
Empty states

However:

Do not change the core product logic.

Use the existing BringBuddy visual system.

Do not turn the website into a generic SaaS dashboard.

============================================================
PART 37 — DO NOT BUILD IN THIS BATCH
============================================================

Do NOT spend this batch building:

Full Admin Center
Full Notifications Center
Full Earnings Dashboard
Full Dispute Resolution
Full Restricted Item Admin
Real backend
Real payment
Real chat backend
Real GPS
Real database
Real authentication

Those are reserved for Batches 6–7.

Do not deepen the existing Order Hub unnecessarily.

============================================================
PART 38 — FINAL END-TO-END TEST
============================================================

Before finishing Batch 5, verify that the following can be demonstrated.

TRAVELER FLOW:

Login
→ Traveler Mode
→ Dashboard
→ My Trips
→ Post Trip
→ Publish
→ Trip appears
→ View Trip
→ Browse Marketplace
→ Open public request
→ Apply
→ Application submitted
→ Sender selects traveler
→ Existing Order Hub

SENDER DIRECT FLOW:

Sender Mode
→ Find a Trip
→ Search Dhaka → London
→ Filter
→ View Traveler
→ Request Traveler
→ Carry Only Order
→ Request
→ Traveler accepts
→ Existing Order Hub

SENDER SHOPPING FLOW:

Sender
→ Create Order
→ Shopping Request
→ Product
→ Quantity
→ Budget
→ Instructions
→ Select Traveler / Marketplace
→ Request
→ Traveler accepts
→ Existing Order Hub

PUBLIC MARKETPLACE FLOW:

Sender
→ Create Public Request
→ Marketplace
→ Traveler opens request
→ Apply
→ Sender opens Applications
→ Compare
→ Select Traveler
→ Existing Order Hub

============================================================
FINAL PRESERVATION RULE
============================================================

The Batch 4 Order Hub is the central transaction system.

DO NOT replace it.

All new booking/discovery flows must feed INTO it.

Do not create disconnected pages.

Do not delete existing components.

Do not reset existing state.

Do not regenerate the whole application.

EXTEND THE CURRENT APPLICATION.

============================================================
BATCH 5 COMPLETION CRITERIA
============================================================

At the end of this batch, BringBuddy should convincingly demonstrate:

✓ Traveler can publish a trip
✓ Sender can search trips
✓ Sender can inspect travelers
✓ Sender can create Carry Only order
✓ Sender can create Shopping Request
✓ Sender can request a specific traveler
✓ Sender can post a public request
✓ Traveler can browse public requests
✓ Traveler can apply
✓ Sender can review applications
✓ Sender can compare travelers
✓ Sender can choose traveler
✓ All booking paths converge into existing Order Hub
✓ Existing Batch 4 lifecycle remains intact
✓ Existing animations remain intact
✓ Existing responsive behavior remains intact

STOP AFTER COMPLETING BATCH 5.