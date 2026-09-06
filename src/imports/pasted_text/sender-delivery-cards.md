BATCH 3 — CORE BRINGBUDDY TRANSACTION JOURNEY

IMPORTANT:
Continue from the EXISTING BringBuddy application that you have already built in this same project/chat.

DO NOT create a new project.
DO NOT rebuild Batch 1.
DO NOT rebuild Batch 2.
DO NOT replace working authentication, onboarding, verification, mode switching, design system, or existing components.

Preserve everything that already works.

This batch should EXTEND the existing application.

============================================================
GOAL OF THIS BATCH
============================================================

We are now moving from:

"BringBuddy looks like a website"

to:

"I can actually understand and experience how BringBuddy works."

Build the first complete end-to-end product journey.

The main experience should be:

SENDER
↓
Sender Dashboard
↓
Find a Traveler
↓
Search Trips
↓
Evaluate Traveler / Trip
↓
Traveler Profile
↓
Choose Trip
↓
Create Delivery
↓
Select Carry Only or Shopping Request
↓
Choose Direct Request or Public Marketplace
↓
Review Order
↓
Send Request
↓
Traveler Dashboard
↓
Incoming Request
↓
Traveler reviews request
↓
Accept
↓
ORDER HUB

The Order Hub is the convergence point where the Sender and Traveler journeys become one shared order experience.

This is the most important product journey we have built so far.

============================================================
VERY IMPORTANT PRODUCT PRINCIPLE
============================================================

BringBuddy is ONE ACCOUNT with TWO MODES.

SENDER MODE:
A user who wants to send something or request something from abroad.

TRAVELER MODE:
A user who has spare luggage capacity and wants to carry something for another user.

A user can switch between these modes from the same account.

DO NOT create separate Sender and Traveler accounts.

The user identity, profile, verification, notifications, reputation and settings remain associated with the same account.

============================================================
WHAT THIS BATCH SHOULD ACHIEVE
============================================================

At the end of this batch, I should be able to open the prototype and demonstrate something like:

"I am a sender."

→ Find a traveler

→ Search Dhaka to London

→ See available travelers/trips

→ Open a traveler's profile

→ See their verification, reputation, completed deliveries, rating, cancellation rate, response time and fee

→ Select a trip

→ Create a delivery

→ Choose Carry Only

→ Enter parcel information

→ See estimated cost

→ Select Direct Request

→ Review the request

→ Send the request

→ Switch to Traveler Mode

→ See the incoming request

→ Open it

→ Accept it

→ Both sides now share an Order Hub

This should feel like one connected application rather than a collection of unrelated screens.

============================================================
PART 1 — AUTHENTICATED APP SHELL
============================================================

Create the real authenticated application shell around the existing dashboard.

Preserve the existing BringBuddy design language.

Include:

- BringBuddy logo
- navigation
- current mode indicator
- mode switch
- notifications
- profile/avatar menu
- logout
- main content area

The authenticated experience should feel like a natural continuation of the landing page.

Do NOT make it look like a generic admin dashboard.

Use the existing design tokens, typography, colors, cards, buttons, spacing, icons and animation language.

============================================================
PART 2 — SENDER DASHBOARD
============================================================

Turn the existing Sender Dashboard placeholder into a useful working dashboard.

The dashboard should immediately communicate:

"What can I do?"

and:

"What is happening with my deliveries?"

Header:

"Good morning, [User Name]"

Supporting text:

"Ready to send something?"

Primary CTA:

Find a Traveler

Secondary CTA:

Create a Delivery

Also provide a smaller option for:

Shopping Request

The dashboard should contain:

1. Active Deliveries
2. Pending Requests
3. Recent Activity
4. Quick Actions
5. Trust / Safety information

Use realistic sample data where needed.

The data is prototype data, not real backend data.

============================================================
PART 3 — SENDER ACTIVE DELIVERY CARDS
============================================================

Create realistic active delivery cards.

Example:

PARCEL TO LONDON

Dhaka → London

2.5 kg

Traveler:
Aisha Rahman

Status:
Traveler Accepted

Progress:
Request → Accepted → Pickup → In Transit → Delivered

CTA:

View Order

This should eventually lead to the Order Hub.

For this batch, make the connection functional.

Do not build every downstream order feature yet.

============================================================
PART 4 — FIND A TRAVELER
============================================================

Create the first real Sender workflow.

Clicking:

Find a Traveler

should navigate to a Trip Search page.

Create:

/trips/search

or the equivalent route already used by the implementation.

Heading:

"Find a traveler"

Supporting message:

"Search travelers already going your way."

============================================================
PART 5 — TRIP SEARCH
============================================================

Create a polished search interface.

Primary fields:

From
To
Travel Date

Additional filters:

Available Capacity
Price / kg
Allowed Item Category

Primary CTA:

Search Trips

Use autocomplete/dropdown behavior where appropriate.

Make the search feel interactive.

Example:

From:
Dhaka

To:
London

Date:
28 Aug 2026

Search

============================================================
PART 6 — SEARCH RESULTS
============================================================

After searching, show available traveler trips.

Heading:

"Trips from Dhaka to London"

Show result count.

Example:

12 trips available

Create attractive Trip/Traveler result cards.

Each card should show:

Traveler profile photo
Traveler name
Verification badge
Rating
Completed deliveries
Departure
Destination
Travel date
Available luggage capacity
Price/kg
Trust level

CTA:

View Trip

Secondary:

View Profile

Do NOT overload the cards.

The user should be able to compare travelers quickly.

============================================================
PART 7 — SEARCH FILTERS
============================================================

Make filters interactive enough for the prototype.

Include:

Date
Capacity
Price
Rating
Verified Travelers
Allowed Item Categories

Use a filter drawer/popover on mobile.

Use sidebar or horizontal filter controls on desktop depending on what fits the existing design better.

Add:

Clear Filters

Do not create an overly complicated filtering system.

============================================================
PART 8 — SEARCH EMPTY STATE
============================================================

Create an empty state:

"No trips found"

Supporting message:

"Try another date, destination or filter."

Actions:

Clear Filters

Modify Search

Make this feel polished and useful.

============================================================
PART 9 — TRAVELER PROFILE
============================================================

Clicking View Profile should open:

/profile/:id

Create a proper Traveler Profile.

This is important because the Sender needs enough information to trust a traveler.

Profile Hero:

Profile photo
Name
Verification badge
Trust level
Rating
Member since

Example:

Aisha Rahman

✓ Verified Traveler

High Trust

4.9 ★

42 completed deliveries

Member since March 2026

============================================================
PART 10 — TRAVELER REPUTATION
============================================================

Create a reputation section.

Show the project-required information:

Verification status
Trust level
Completed deliveries
Cancellation rate
Response time
Rating
Member since
Default carrying fee

Example:

Verification
✓ Verified

Trust Level
High Trust

Completed Deliveries
42

Cancellation Rate
2%

Response Time
~15 min

Rating
4.9 ★

Default Carrying Fee
৳450 / kg

Do not invent unrelated reputation metrics.

============================================================
PART 11 — PROFILE TRUST PRESENTATION
============================================================

Make the trust information visually meaningful.

The user should immediately understand:

"Can I trust this traveler?"

Use:

- verification badge
- rating
- completed delivery count
- cancellation rate
- response time
- trust level

Do NOT expose sensitive identity information such as passport/NID numbers.

============================================================
PART 12 — TRAVELER PROFILE TRIP PREVIEW
============================================================

Show the traveler's relevant upcoming trips.

Example:

Upcoming Trip

Dhaka → London

28 Aug 2026

6 kg available

৳450 / kg

Allowed items:
Documents
Clothing
Small electronics

CTA:

Choose This Trip

This CTA should take the Sender into the order creation flow.

============================================================
PART 13 — CHOOSE A TRIP
============================================================

Create a trip detail / selection state.

The Sender should be able to confirm:

Traveler
Route
Travel date
Available capacity
Price/kg
Allowed categories
Trust/reputation

Primary CTA:

Continue with This Traveler

Do not make the Sender repeat the entire search.

============================================================
PART 14 — CREATE ORDER
============================================================

Now create the actual order creation experience.

Route:

/orders/new

The Sender should choose between TWO order types.

CARD 1:

CARRY ONLY

"Send a parcel with a traveler."

CARD 2:

SHOPPING REQUEST

"Ask a traveler to buy something abroad."

Make both interactive.

This distinction is mandatory.

============================================================
PART 15 — CARRY ONLY ORDER
============================================================

Build the Carry Only flow.

Heading:

"Send a parcel"

Fields should cover the project requirements:

Item description
Weight
Pickup location
Destination
Receiver information
Special instructions if appropriate

Include restricted-item validation.

Show a subtle warning/help section:

"Some items cannot be carried through BringBuddy."

Provide:

View Restricted Items

Do not create a huge warning unless the user enters a problematic item.

============================================================
PART 16 — RESTRICTED ITEM VALIDATION
============================================================

Create a prototype interaction for restricted items.

If the user enters a clearly prohibited sample item, show:

"This item can't be carried through BringBuddy."

Explain briefly why.

Provide:

Change Item

Do not allow the flow to proceed with that sample restricted item.

If the item is acceptable:

✓ Item appears eligible

Do not make the validation feel like a fake security popup.

============================================================
PART 17 — SHOPPING REQUEST
============================================================

Create the alternate Shopping Request flow.

Fields:

Product URL
Quantity
Budget
Instructions

Example:

Product URL:
[URL]

Quantity:
1

Budget:
৳12,000

Instructions:
"Please purchase the black version, size M."

Explain:

"The traveler purchases the item abroad and brings it to you."

Do not build the real external shopping/product integration.

This is the prototype experience only.

============================================================
PART 18 — BOOKING METHOD
============================================================

After selecting the order type, let the Sender choose how to find the traveler.

Two options:

DIRECT REQUEST

"Send this request directly to the traveler you selected."

PUBLIC MARKETPLACE

"Post your request publicly so eligible travelers can apply."

These are two different booking methods.

Make the difference extremely clear.

Do NOT make them look like two unrelated products.

============================================================
PART 19 — DIRECT REQUEST FLOW
============================================================

For Direct Request:

Show the selected traveler prominently.

Example:

Sending to:

Aisha Rahman
✓ Verified
4.9 ★
42 deliveries

Trip:

Dhaka → London
28 Aug 2026

Then show the order details.

CTA:

Continue

============================================================
PART 20 — PUBLIC MARKETPLACE FLOW
============================================================

For Public Marketplace:

Explain:

"Your request will be visible to eligible travelers going this route. Travelers can apply with their carrying fee, and you can choose the best match."

CTA:

Continue to Post Request

Do not build the complete marketplace application system yet.

Create enough UI for the Sender to understand how the public route works.

============================================================
PART 21 — ORDER SUMMARY
============================================================

Create a polished final review page before submission.

Heading:

"Review your request"

Sections:

DELIVERY

Carry Only / Shopping Request

ROUTE

Dhaka → London

TRAVELER

Aisha Rahman

TRIP

28 Aug 2026

PACKAGE

2.5 kg

PRICING

Carrying Fee
৳1,125

Platform Service Fee
৳X

Estimated Total
৳X

IMPORTANT:

Do not pretend these numbers are actual payment calculations if they are not implemented.

They can be prototype/sample values.

Clearly structure the UI so the real backend can later replace the calculation.

============================================================
PART 22 — ORDER SUMMARY SAFETY
============================================================

Include a compact information section:

"Your payment is protected by BringBuddy's escrow process."

Do not claim that actual payment is occurring in this prototype.

This is preparing the user for the later Escrow feature.

============================================================
PART 23 — SEND REQUEST
============================================================

Primary CTA:

Send Request

On click:

show a confirmation transition/modal.

Example:

"Request sent"

"Your request has been sent to Aisha."

Show:

Route
Traveler
Order type
Status

Status:

Awaiting Traveler Response

CTA:

View Order

This should lead to the Order Hub.

============================================================
PART 24 — ORDER CREATED STATE
============================================================

Create an Order Hub entry state.

Heading:

"Your request is on its way."

Status:

Awaiting Traveler Response

Show:

Order ID
Route
Traveler
Order Type
Weight
Travel Date
Status

CTA:

Open Order Hub

Do not build the entire Order Hub yet.

But make this the actual bridge into the shared order experience.

============================================================
PART 25 — SWITCH TO TRAVELER MODE
============================================================

The user should be able to switch modes from the same account.

Example:

Current:
Sender

Switch to:
Traveler

On switching:

Show a subtle transition.

Then navigate to:

Traveler Dashboard

Do NOT log out.

Do NOT create a second account.

============================================================
PART 26 — TRAVELER DASHBOARD
============================================================

Create the Traveler Dashboard as an actual functional view.

Header:

"Good morning, [User Name]"

Supporting message:

"Here's what's happening with your trips."

Primary CTA:

Post a Trip

Secondary:

Browse Requests

Show:

Upcoming Trips
Available Capacity
Requests
Active Deliveries
Reputation
Earnings Preview

Do not build the complete Trip Creation feature yet.

The Post a Trip button may lead to a well-designed placeholder/next-step screen if necessary.

============================================================
PART 27 — TRAVELER INCOMING REQUEST
============================================================

This is critical.

After the Sender sends a Direct Request and the user switches to Traveler Mode, the Traveler Dashboard should show:

"New request"

Example:

Aisha wants you to carry:

2.5 kg parcel

Dhaka → London

28 Aug 2026

Estimated carrying fee:

৳1,125

Actions:

View Request

Accept

Decline

Make this interaction clickable.

============================================================
PART 28 — TRAVELER REQUEST DETAIL
============================================================

Create a request detail screen/modal.

Show:

Sender
Order type
Parcel description
Weight
Pickup
Destination
Receiver information where appropriate
Travel date
Carrying fee
Special instructions
Restricted-item status

Show traveler-relevant trust information about the sender only where appropriate.

Primary:

Accept Request

Secondary:

Decline

Do not expose information that should not be visible.

============================================================
PART 29 — ACCEPT REQUEST
============================================================

When Traveler selects:

Accept Request

show a confirmation state.

Example:

"Accept this delivery?"

"You'll be committing 2.5 kg of your available luggage capacity to this order."

Show:

Current capacity:
6 kg available

After acceptance:
3.5 kg available

This is a prototype representation of Feature 11.

Primary:

Accept Delivery

Secondary:

Cancel

============================================================
PART 30 — CAPACITY LIMIT FOUNDATION
============================================================

Show the effect of accepted orders on luggage capacity.

Example:

Before:

6 kg available

After:

3.5 kg available

Use a progress visualization.

Also show the active-order limit concept where relevant.

Do not implement complex backend business logic.

We only need a convincing prototype interaction.

============================================================
PART 31 — ORDER HUB
============================================================

THIS IS THE MOST IMPORTANT NEW SCREEN IN THIS BATCH.

After the Traveler accepts the request, both sides should converge into:

/orders/:id

The Order Hub is the shared private workspace for this order.

The Order Hub must visually communicate:

"This is now one shared transaction."

Create a polished order workspace.

============================================================
PART 32 — ORDER HUB HEADER
============================================================

Header:

Order #BB-1048

Dhaka → London

Status:

Accepted

Show:

Sender
Traveler
Order Type
Travel Date

Use a clear status badge.

============================================================
PART 33 — ORDER HUB TIMELINE PREVIEW
============================================================

Create a basic order timeline.

For now:

✓ Request Sent
✓ Traveler Accepted
○ Pickup
○ In Transit
○ Delivery Confirmation
○ Completed

The completed downstream features will later expand these stages.

Use a clear visual timeline.

Do NOT build full tracking yet.

============================================================
PART 34 — ORDER HUB CHAT PREVIEW
============================================================

Create a private chat area.

Example:

Aisha:
"Hi! I can meet at the pickup point around 6 PM."

Rahim:
"Perfect. I'll bring the package before then."

Input:

"Write a message..."

Send button.

Make this visually interactive.

This is a prototype chat, not a backend messaging system.

============================================================
PART 35 — ORDER HUB FILE / RECEIPT SHARING PREVIEW
============================================================

Create a small shared-files section.

Example:

Shared Files

📎 package-details.pdf

Add File

This establishes the future file/receipt-sharing functionality.

Do not implement actual cloud file storage.

============================================================
PART 36 — ORDER HUB ORDER DETAILS
============================================================

Include a collapsible or side panel:

Order Details

Type:
Carry Only

Weight:
2.5 kg

Pickup:
Dhaka

Destination:
London

Receiver:
[Name]

Special Instructions:
[Text]

Traveler:
Aisha Rahman

Sender:
Rahim Ahmed

Keep this organized.

============================================================
PART 37 — ORDER HUB PAYMENT PREVIEW
============================================================

Show a compact payment state.

Example:

Payment Status

Escrow:
Pending

Estimated total:
৳X

Explain:

"Payment will be held in escrow before the trip is confirmed."

Do NOT implement actual payment.

This establishes the foundation for Feature 10.

============================================================
PART 38 — ORDER HUB NEXT STEPS
============================================================

At the current Accepted stage, show:

Next step:

Arrange Pickup

CTA:

Discuss Pickup

Later stages will add:

Payment
Tracking
OTP
Review

Do not prematurely expose every later-stage action as active.

Use disabled/locked states when appropriate.

============================================================
PART 39 — ORDER STATUS TRANSITIONS
============================================================

Make the prototype demonstrate that the Order Hub is stateful.

At minimum support:

Awaiting Traveler Response
Accepted

After acceptance:

Request Sent
→ Accepted

The UI should update when the Traveler accepts.

Do not implement every lifecycle state yet.

============================================================
PART 40 — SHARED ORDER HUB CONCEPT
============================================================

IMPORTANT:

Do not create separate unrelated "Sender Order Page" and "Traveler Order Page."

Both roles should access the SAME Order Hub.

The available actions may differ according to role.

Example:

Sender:
View timeline
Chat
Order details
Payment status

Traveler:
View timeline
Chat
Order details
Pickup discussion

But the underlying order workspace should feel shared.

This is one of the defining architectural ideas of BringBuddy.

============================================================
PART 41 — PUBLIC MARKETPLACE FOUNDATION
============================================================

Although the complete Marketplace will be built later, create enough structure that the Sender understands the alternative to Direct Request.

The Sender should be able to choose:

Direct Request

OR

Post Publicly

If Post Publicly is selected, show:

"Your request will be visible to travelers going this route."

Include:

Route
Date
Item type
Weight
Budget / expected fee
Instructions

CTA:

Post Request

After posting:

"Request posted"

Status:

Waiting for traveler applications

Do not build traveler application management yet.

============================================================
PART 42 — SHOPPING REQUEST FOUNDATION
============================================================

Make sure the user can actually enter the Shopping Request path.

Flow:

Sender Dashboard
→ Create Delivery
→ Shopping Request
→ Product URL
→ Quantity
→ Budget
→ Instructions
→ Traveler/Booking Method
→ Summary
→ Request

The UI should clearly distinguish this from Carry Only.

Do not build the complete shopping purchase lifecycle.

============================================================
PART 43 — TRUST & SAFETY
============================================================

Use BringBuddy's existing trust language throughout this flow.

Appropriate moments:

Traveler Search:
✓ Verified Traveler

Traveler Profile:
Trust Level
Rating
Completed Deliveries

Order Creation:
Restricted Item validation

Order Summary:
Escrow explanation

Order Hub:
Order timeline
Shared workspace

Do not spam the user with trust badges everywhere.

Use them where they reduce uncertainty.

============================================================
PART 44 — ANIMATIONS & MICRO-INTERACTIONS
============================================================

Use tasteful animations.

Search:

- filters animate open
- result cards enter subtly
- loading skeletons
- hover states

Traveler selection:

- selected card elevation
- smooth border transition

Order creation:

- progress transitions
- step changes with subtle animation

Request submission:

- success check animation
- request status transition

Mode switching:

Sender → Traveler

Use a smooth transition.

Order Hub:

- status transition animation
- timeline progression
- new request notification
- chat message entrance

Do NOT over-animate.

Avoid:
- bouncing everything
- constant floating motion
- excessive parallax
- flashing
- unnecessary spinning

The animations should make the application feel polished, not like a demo gimmick.

============================================================
PART 45 — NOTIFICATION POPUPS
============================================================

Use notification/toast UI at important moments.

Example:

After Sender sends request:

✓ Request sent
Aisha has been notified.

When Traveler switches into Traveler Mode:

🔔 New delivery request

A 2.5 kg parcel is waiting for your response.

When Traveler accepts:

✓ Delivery accepted
The Sender has been notified.

These are prototype notifications.

Do not build the full Notifications Center yet.

============================================================
PART 46 — RESPONSIVE DESIGN
============================================================

Maintain responsive behavior.

Desktop:
1440px

Tablet:
768–1024px

Mobile:
approximately 390px

Mobile requirements:

- search filters collapse
- traveler cards stack
- order creation becomes single-column
- profile sections stack
- Order Hub becomes a mobile-friendly layout
- chat remains usable
- CTAs remain easy to tap
- no horizontal overflow

Use the existing design system.

============================================================
PART 47 — LOADING / ERROR / EMPTY STATES
============================================================

Add realistic states.

Search:
Loading
Results
No results
Error

Profile:
Loading
Available
Unavailable

Order creation:
Validation error
Restricted item
Success

Request:
Sending
Sent
Failed

Traveler:
No requests
New request
Request accepted

Order Hub:
Loading
Active
Error

Make these states visually consistent.

============================================================
PART 48 — ROUTE / CONNECTION STRUCTURE
============================================================

Connect the existing application naturally.

Existing:

Landing
→ Login / Register
→ Onboarding
→ Dashboard

Add:

Sender Dashboard
→ /trips/search

Trip Search
→ Traveler/Trip Detail

Traveler Profile
→ Select Trip

Select Trip
→ /orders/new

Create Order
→ Order Summary

Order Summary
→ Request Sent

Request Sent
→ Order Hub

Mode Switch
→ Traveler Dashboard

Traveler Dashboard
→ Incoming Request

Incoming Request
→ Request Detail

Request Detail
→ Accept

Accept
→ Order Hub

The same Order Hub should be accessible from both Sender and Traveler contexts.

Do not create dead-end screens.

============================================================
PART 49 — DESIGN SYSTEM PRESERVATION
============================================================

Use the visual language already created.

Preserve:

Typography
Colors
Spacing
Border radius
Buttons
Cards
Inputs
Icons
Navigation
Animations
Illustration style
Floating cards
Toast style
Modal style

You may improve the design where appropriate.

Do not make the new application area visually disconnected from the existing landing page.

============================================================
PART 50 — CREATIVE FREEDOM
============================================================

You have permission to improve the design if you think your idea will produce a better experience.

You may change:

- dashboard layout
- search layout
- traveler card layout
- profile composition
- order creation step arrangement
- Order Hub layout
- animations
- floating elements
- responsive navigation
- information hierarchy

if your alternative is clearly better.

However, do NOT change these product rules:

1. One account can be both Sender and Traveler.
2. Sender and Traveler are modes.
3. Carry Only and Shopping Request are separate order types.
4. Direct Request and Public Marketplace are separate booking methods.
5. Traveler verification is required for traveler capabilities that require it.
6. Traveler reputation/trust information is important when selecting a traveler.
7. The Order Hub is the shared convergence point after a request becomes an order.
8. Restricted-item validation must exist.
9. Capacity must visibly affect the Traveler's experience.
10. The experience must feel like one coherent BringBuddy product.

============================================================
PART 51 — CODE / IMPLEMENTATION
============================================================

Preserve all existing code that works.

Do not rewrite the existing authentication/onboarding system.

Reuse existing:

- components
- contexts
- state
- routing
- styling
- design tokens
- animations
- responsive utilities

Create reusable components for:

TripCard
TravelerCard
ProfileHeader
ReputationCard
SearchFilters
OrderTypeSelector
BookingMethodSelector
OrderSummary
RequestCard
OrderTimeline
OrderHub
ChatPanel
Toast
ModeSwitcher

Use component variants rather than duplicated UI where appropriate.

Keep the implementation clean enough that a developer can later replace prototype state with a real backend.

Do NOT attempt to build the actual MERN backend.

This batch is about the functioning frontend experience and prototype behavior.

============================================================
PART 52 — FILE ORGANIZATION
============================================================

Keep existing sections:

01 — Design System
02 — Landing / Home
03 — Authentication & Onboarding

Add:

04 — Authenticated Application
05 — Trip Discovery
06 — Traveler Profile
07 — Order Creation
08 — Booking
09 — Order Hub

Use meaningful names.

Use Auto Layout.

Use reusable components and variants.

============================================================
FINAL QUALITY TEST
============================================================

Before considering Batch 3 complete, make sure the prototype can demonstrate this complete story:

1. Start logged in as Sender.

2. Open Sender Dashboard.

3. Click "Find a Traveler."

4. Search:
Dhaka → London.

5. See multiple traveler/trip results.

6. Filter results.

7. Open a traveler profile.

8. Inspect:
Verification
Trust Level
Rating
Completed Deliveries
Cancellation Rate
Response Time
Default Fee

9. Select a trip.

10. Create a Carry Only order.

11. Enter:
Item
Weight
Pickup
Destination
Receiver

12. Demonstrate restricted-item validation.

13. Choose:
Direct Request.

14. Review the order.

15. See estimated price and escrow explanation.

16. Send the request.

17. See:
"Request sent."

18. Switch to Traveler Mode without logging out.

19. See the new request on Traveler Dashboard.

20. Open the request.

21. Review parcel/trip/capacity details.

22. Accept the request.

23. See luggage capacity update.

24. See acceptance confirmation.

25. Open the shared Order Hub.

26. See:
Order status
Timeline
Sender
Traveler
Order details
Chat
Shared files
Payment/escrow preview
Next step

27. Demonstrate that the Order Hub is the same shared transaction rather than two unrelated pages.

Also make sure the alternative Shopping Request path and Public Marketplace path are visibly available and understandable, even though their full downstream workflows will be built in later batches.

============================================================
FINAL INSTRUCTION
============================================================

Build this as a cohesive, polished, interactive extension of the EXISTING BringBuddy application.

Do NOT rebuild previous work.

Do NOT stop at static screens.

Prioritize meaningful click-through behavior and connected states.

The goal is not to build the entire backend.

The goal is to make the user experience feel like a real functioning BringBuddy product.

Use your design judgment wherever it improves the result.

STOP AFTER THIS BATCH.