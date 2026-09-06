BringBuddy – Cross-Border Parcel
Sharing Marketplace
Idea Summary
BringBuddy is a web-based marketplace that connects international travelers
with individuals who need to send or receive parcels between countries. The
platform utilizes travelers' unused luggage capacity to create an affordable and
efficient alternative to traditional international parcel delivery.
Instead of relying solely on expensive courier services, BringBuddy enables
travelers to transport parcels along their existing travel routes while earning
additional income. At the same time, senders benefit from lower delivery costs,
greater flexibility, and access to a wider network of verified travelers.
By combining marketplace functionality with booking management, delivery
tracking, user verification, ratings, and administrative oversight, BringBuddy
provides a secure and transparent environment for cross-border parcel delivery.
Problem Statement
International parcel delivery is often costly, time-consuming, and limited by the
pricing and schedules of traditional courier companies. Many individuals wish
to send personal belongings, gifts, or products purchased from abroad but find
international shipping charges prohibitively expensive.
At the same time, thousands of international travelers fly between countries
every day with unused luggage allowance that remains unutilized. This
available carrying capacity represents an opportunity to transport parcels safely
and efficiently without requiring additional delivery infrastructure.
Currently, there is no centralized platform that efficiently connects verified
travelers with people who need affordable cross-border parcel delivery while
managing the complete delivery lifecycle through a secure and transparent
system.
BringBuddy addresses this problem by transforming unused luggage space into
a trusted parcel-sharing network.

Proposed Solution
BringBuddy provides a centralized marketplace where travelers publish their
upcoming trips, including their travel route, travel date, and available luggage
capacity. Users who need to send parcels can create delivery orders, and the
system intelligently matches them with suitable travelers based on destination,
schedule, luggage availability, and traveler reputation.
The platform manages the complete delivery process, including booking,
simulated payment, pickup scheduling, parcel tracking, OTP-based delivery
confirmation, ratings, and dispute resolution. This structured workflow ensures
greater transparency, accountability, and trust for both travelers and senders.
Value Proposition
For Senders
● Lower international delivery costs.
● Faster and more flexible delivery options.
● Secure booking and parcel tracking.
● Access to verified travelers.
● Transparent delivery process.
For Travelers
● Earn additional income from unused luggage space.
● Manage multiple parcel deliveries during existing trips.
● Build reputation through successful deliveries and ratings.
● Utilize available luggage capacity efficiently.
For the Platform
● Creates a sustainable cross-border parcel-sharing ecosystem.
● Reduces unused transportation capacity.
● Digitizes an informal delivery process through a secure marketplace.
● Demonstrates real-world marketplace, booking, and logistics workflows
suitable for a scalable software solution.

Feature List
Detailed Functional Feature List
Authentication Module (Registration, Login, Logout, Forgot Password, JWT Authentication
and Role Selection) is mandatory and is NOT counted among the 20 functional features.
Feature 1: Traveler Verification & Trust Onboarding
Users submit Passport/NID, profile photo, verified phone number and emergency contact.
Admin verifies travelers before they can publish trips or accept orders.
Feature 2: Traveler Profile & Reputation Card
Displays verification badge, trust level, completed deliveries, cancellation rate, response
time, rating, member since date and default carrying fee.
Feature 3: Trip Management
Create and manage trips with departure, destination, travel date, luggage capacity, price/kg
and allowed item categories. Trip lifecycle: Draft → Published → Full → Completed.
Feature 4: Parcel Delivery Order
Create Carry Only orders containing multiple items, total weight, pickup city/country,
destination city/country and receiver information.
Feature 5: Shopping Request Order
Create requests for travelers to purchase products abroad with product link, quantity, budget
and special instructions.
Feature 6: Smart Traveler Search & Filtering
Search by route, travel date, capacity, rating, trust level, verification and price.
Feature 7: Public Delivery Marketplace
Publish orders publicly so matching travelers can apply with their carrying fee.
Feature 8: Booking & Application Management
Supports both direct requests and public applications with accept/reject/confirm workflow.
Feature 9: Order Hub
Private workspace for each accepted order containing chat, file sharing, receipt sharing,
timeline, pickup discussion and delivery instructions.
Feature 10: Escrow Dummy Payment System
One dummy payment is held before the trip and released after successful OTP verification.
Platform service fee is included.

Feature 11: Luggage Capacity & Active Order Management
Automatically manages luggage capacity and active order limits. New travelers: 1 active
order. After 5 successful deliveries: up to 5 active orders.
Feature 12: Order Tracking & Timeline
Tracks every stage from Created to Completed with a visual timeline.
Feature 13: OTP Delivery Confirmation
Receiver verifies delivery using a one-time password without creating an account.
Feature 14: Ratings, Reviews & Trust Score
Both parties rate each other. Trust score depends on deliveries, ratings, verification and
cancellations.
Feature 15: Notifications & Activity Center
Notifications for bookings, payments, status changes, reviews, cancellations and refunds.
Feature 16: Cancellation & Recovery Management
If a traveler cancels, sender can choose another traveler or cancel the order. Trust score is
reduced.
Feature 17: Restricted Item Validation
Blocks prohibited items and warns users about restricted categories.
Feature 18: Earnings & Transaction Dashboard
Travelers view earnings and payments; senders monitor orders, payments and refunds.
Feature 19: Admin Control Center
Admin verifies travelers, manages users, monitors trips/orders, suspends accounts and views
analytics.
Feature 20: Dispute Resolution System
Users report damaged items, payment issues or misconduct. Admin reviews evidence stored
in the Order Hub.
Key Business Rules
- Two order types: Carry Only and Shopping Request.
- Two booking methods: Direct Request and Public Marketplace.
- Every accepted order creates an Order Hub.
- Dummy escrow payment with platform service fee.
- Receiver confirms delivery using OTP.
- Trust score and cancellation policy maintain marketplace reliability.

Technology Stack(MERN)
The system follows the Model–View–Controller (MVC) architecture as required by
the course guidelines.
Frontend
● React.js
● HTML5
● CSS3
Backend
● Node.js
● Express.js
Database
● MongoDB
Authentication
● JSON Web Token (JWT)
Development Tools
● Git & GitHub
● Visual Studio Code

