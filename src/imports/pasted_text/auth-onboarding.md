BATCH 2 — AUTHENTICATION + ACCOUNT ONBOARDING

Continue from the existing BringBuddy implementation.

IMPORTANT:
DO NOT create a new Figma project.
DO NOT rebuild the landing page.
DO NOT replace the existing design system.
DO NOT regenerate existing working components unnecessarily.

Extend the existing BringBuddy implementation using the design system, components, typography, colors, spacing, interaction patterns, animation language, and code structure already established in Batch 1.

This is BATCH 2 ONLY.

============================================================
CORE PRODUCT RULE — VERY IMPORTANT
============================================================

BringBuddy uses ONE USER ACCOUNT that can participate in TWO MODES:

SENDER MODE
A user who needs to send something.

TRAVELER MODE
A user who has luggage capacity while traveling and wants to earn.

These are NOT two separate accounts.

A user may begin using BringBuddy primarily as a Sender and later become a Traveler, or vice versa.

The interface must communicate:

"One account. Two ways to participate."

Role selection during registration must therefore NOT permanently lock the user into one identity.

If role selection is needed during onboarding, treat it as:
- the user's initial mode
- a starting preference
- a way to personalize the first dashboard experience

NOT as:
- a permanent account type
- an exclusive account category
- a second account

The user must be able to switch modes later.

Preserve the shared identity, profile, verification, reputation, notifications, settings, and account concept.

============================================================
SOURCE-OF-TRUTH CONSTRAINT
============================================================

The BringBuddy specification establishes Authentication as mandatory and includes:

- Registration
- Login
- Logout
- Forgot Password
- JWT Authentication
- Role Selection

Traveler Verification requires:
- Passport/NID
- Profile photo
- Verified phone number
- Emergency contact

A traveler must be verified by the admin before they can publish trips or accept orders.

Do not invent additional mandatory verification requirements that are not specified in the project documents.

If the existing implementation already contains specific authentication fields, preserve those fields and improve their visual presentation rather than replacing the underlying logic.

============================================================
BATCH 2 SCOPE
============================================================

Build the complete authentication and initial onboarding experience.

Create these states/screens:

1. Login
2. Registration
3. Forgot Password
4. Password Reset / Reset Confirmation state
5. Initial onboarding / mode selection
6. Sender-first onboarding state
7. Traveler-first onboarding state
8. Traveler verification introduction
9. Verification submission flow / UI
10. Verification pending state
11. Verification approved state
12. Verification rejected / needs correction state
13. Authentication success / redirect states
14. Relevant modal, toast, validation, loading and error states

Connect all of these to the existing BringBuddy landing page.

Do not build the full dashboard yet.

Do not build Trip Management yet.

Do not build the full Profile page yet.

Do not build Marketplace yet.

Those belong to later batches.

============================================================
PART 1 — LOGIN
============================================================

Create a polished BringBuddy Login screen.

The design should immediately feel like the same product as the landing page.

Suggested structure:

LEFT SIDE:
Brand / product message or tasteful travel-related visual.

RIGHT SIDE:
Login form.

Heading:

"Welcome back"

Supporting text:

"Log in to continue with BringBuddy."

Include the authentication fields already established by the existing implementation.

At minimum, provide:
- email/identifier field
- password field

Password:
- show/hide control
- appropriate validation state

Primary CTA:

"Log In"

Additional actions:

"Forgot password?"

"Don't have an account? Create one"

Provide an appropriate route back to the landing page.

If the existing authentication implementation uses different field labels, preserve its working logic and use the existing fields.

Do not invent unnecessary social-login systems.

============================================================
PART 2 — LOGIN STATES
============================================================

Create component/state variants for:

Default
Focused
Filled
Invalid
Loading
Success
Authentication Error

Example error:

"Invalid email or password. Please try again."

Loading state:

"Signing you in..."

Success state:

"Login successful"

Use subtle motion.

Do not use aggressive loading animations.

============================================================
PART 3 — REGISTRATION
============================================================

Create the registration experience.

Heading:

"Create your BringBuddy account"

Supporting message:

"One account. Two ways to participate."

Use the fields supported by the existing implementation.

Do not invent a large registration form with unnecessary information.

Keep registration friction low.

Primary CTA:

"Create Account"

Include:

"Already have an account? Log in"

============================================================
PART 4 — REGISTRATION VALIDATION
============================================================

Create clear validation states.

Examples:

Required field
Invalid email
Weak password
Password mismatch
Already registered account
Server error
Loading
Successful registration

Use inline validation rather than relying exclusively on toast messages.

Use accessible error messaging.

Do not make errors visually aggressive.

============================================================
PART 5 — ROLE / MODE INTRODUCTION
============================================================

After successful registration, introduce the concept of BringBuddy's two modes.

This is a critical UX moment.

Create a screen with:

"How do you want to use BringBuddy?"

Supporting copy:

"You can do both. Choose where you'd like to start."

Show TWO large interactive cards.

CARD 1:

SEND SOMETHING

"I need to send a parcel or request something from abroad."

Icon:
parcel / package

CTA or selection:
"Start as Sender"


CARD 2:

TRAVEL & EARN

"I'm traveling and have spare luggage space."

Icon:
plane / luggage

CTA or selection:
"Start as Traveler"

Then prominently show:

"Don't worry — you can switch modes anytime."

This message is essential.

The UI must NOT imply that choosing one mode prevents the user from using the other later.

============================================================
PART 6 — DUAL-MODE EXPLANATION
============================================================

Add a subtle visual explanation:

ONE ACCOUNT

        ↓

SENDER MODE ←→ TRAVELER MODE

        ↓

Shared:
Profile
Identity
Notifications
Settings
Account

Make this visually simple.

Do not over-explain it.

The goal is to eliminate the confusion that a new user might have about whether Sender and Traveler require separate accounts.

============================================================
PART 7 — SENDER-FIRST ONBOARDING
============================================================

Create a lightweight Sender onboarding state.

The user should understand what happens next.

Heading:

"Ready to send?"

Explain:

"Find travelers already going your way, create a delivery request, and track the journey securely."

Show a short 3-step preview:

1. Find a Traveler
2. Create Your Delivery
3. Track & Confirm

Primary CTA:

"Continue to Sender Dashboard"

Secondary option:

"Switch to Traveler"

Do not build the actual Sender Dashboard yet.

Connect the CTA to a dashboard placeholder for the next batch.

============================================================
PART 8 — TRAVELER-FIRST ONBOARDING
============================================================

Create a lightweight Traveler onboarding state.

Heading:

"Turn spare luggage space into income."

Supporting message:

"Verify yourself, publish your trip, and start carrying deliveries along routes you're already traveling."

Show:

1. Verify Yourself
2. Post Your Trip
3. Carry & Earn

Primary CTA:

"Start Verification"

Secondary:

"Continue as Sender"

Again, do not make this an irreversible role choice.

============================================================
PART 9 — TRAVELER VERIFICATION INTRODUCTION
============================================================

The project requires traveler verification before a traveler can publish trips or accept orders.

Create a polished verification introduction page.

Heading:

"Become a verified traveler"

Supporting copy:

"Verification helps keep BringBuddy safe and trustworthy for everyone."

Show the required verification information:

Passport / NID
Profile Photo
Verified Phone Number
Emergency Contact

Use a clean checklist or step-based presentation.

Add a trust/security visual.

Primary CTA:

"Begin Verification"

Secondary:

"Do This Later"

If the user chooses "Do This Later", they should remain able to use the account as a Sender.

This is important.

Verification is required for Traveler functionality, but should not prevent the user from using Sender functionality.

============================================================
PART 10 — VERIFICATION SUBMISSION
============================================================

Create the verification submission interface.

Required information from the specification:

1. Passport/NID
2. Profile photo
3. Verified phone number
4. Emergency contact

Design this as a manageable multi-step flow rather than one intimidating form if you believe that provides a better UX.

Suggested structure:

STEP 1
Identity Document

STEP 2
Profile Photo

STEP 3
Phone Verification

STEP 4
Emergency Contact

STEP 5
Review & Submit

Show a progress indicator.

Allow users to move backward without losing completed information.

Use clear privacy/security reassurance.

Do not invent extra identity requirements.

============================================================
PART 11 — DOCUMENT UPLOAD
============================================================

Create a realistic document-upload UI.

States:

Default
Drag / Upload
Uploading
Uploaded
Invalid
Replace

Example:

"Passport / NID"

"Upload a clear photo or scan of your document."

Button:

"Upload Document"

After upload:

✓ Document uploaded

Use appropriate icons.

Do not create fake sensitive document details.

Use a neutral placeholder/obscured preview.

============================================================
PART 12 — PROFILE PHOTO
============================================================

Create a profile photo upload state.

Heading:

"Add your profile photo"

Supporting text:

"Use a clear photo so other BringBuddy users know who they're dealing with."

States:

Upload
Preview
Replace
Invalid

Do not use real people's photos unless already present in the existing project.

Use a neutral avatar placeholder.

============================================================
PART 13 — PHONE VERIFICATION
============================================================

Create phone verification UI.

Show:

Phone number input
Send OTP
OTP entry
Verification success
Invalid OTP
Resend OTP
Timer state

Example:

"Verify your phone"

"Enter the code we sent to your phone."

OTP should use separate digit inputs if appropriate.

Success:

✓ Phone verified

Use subtle success animation.

Do not confuse this with the DELIVERY OTP feature.

This is ACCOUNT PHONE VERIFICATION.

The delivery OTP belongs to a later order workflow.

============================================================
PART 14 — EMERGENCY CONTACT
============================================================

Create the emergency contact step.

Use the appropriate fields required by the existing implementation.

Keep it simple and clearly explain why the information is requested.

Use a small trust/security explanation.

Do not invent unnecessary fields.

============================================================
PART 15 — REVIEW BEFORE SUBMIT
============================================================

Before submitting verification, show a summary.

Example:

Verification Checklist

✓ Passport / NID
✓ Profile Photo
✓ Phone Number
✓ Emergency Contact

Status:

"Ready to submit"

CTA:

"Submit for Verification"

Secondary:

"Back"

============================================================
PART 16 — VERIFICATION PENDING
============================================================

Create a polished pending state.

Heading:

"Verification submitted"

Supporting message:

"Your information has been submitted for review. We'll let you know when your traveler verification is complete."

Show:

Pending Verification

Do NOT falsely claim that verification happens instantly.

Clearly explain:

"Traveler features that require verification will remain locked until approval."

But make clear that the user's Sender functionality remains available.

CTA:

"Continue to Sender Mode"

Secondary:

"View Verification Status"

============================================================
PART 17 — VERIFICATION APPROVED
============================================================

Create the approved state.

Example:

✓ You're verified

"Your traveler profile is now verified."

Show verification badge.

Explain that the user can now access traveler functionality that requires verification.

Primary:

"Continue as Traveler"

Secondary:

"Switch to Sender"

Use a subtle success animation.

============================================================
PART 18 — VERIFICATION NEEDS CORRECTION
============================================================

Create a rejection / correction state.

Heading:

"Some information needs attention"

Explain clearly that the user needs to correct and resubmit the affected information.

Show which item needs correction.

Example:

⚠ Identity document
"Please upload a clearer document."

CTA:

"Review & Resubmit"

Do not use language that feels punitive.

============================================================
PART 19 — AUTHENTICATION NAVIGATION
============================================================

Connect all relevant routes.

Landing Page:

Log In
→ Login

Get Started
→ Registration

Login:

Create Account
→ Registration

Forgot Password
→ Forgot Password

Registration:

Log In
→ Login

Successful Registration
→ Initial Mode Selection

Mode Selection:

Start as Sender
→ Sender-first onboarding

Start as Traveler
→ Traveler-first onboarding

Traveler:

Start Verification
→ Verification

Do This Later
→ Sender Mode / appropriate dashboard placeholder

Login Success:

If the user has an existing preferred mode:
→ appropriate dashboard placeholder

If mode selection is needed:
→ mode selection

Verification:

Submit
→ Pending

Approved
→ Traveler dashboard placeholder

============================================================
PART 20 — FORGOT PASSWORD
============================================================

Create:

Forgot Password

Heading:

"Reset your password"

Supporting text:

"Enter your account email and we'll guide you through resetting your password."

Field:
Email

CTA:
"Send Reset Link"

States:

Default
Loading
Success
Email not found
Server error

Success:

"Check your email"

Then create the reset-password state:

New Password
Confirm Password

CTA:

"Reset Password"

Success:

"Password updated"

CTA:

"Return to Login"

Use subtle transitions.

============================================================
PART 21 — AUTHENTICATION MOTION
============================================================

BringBuddy should remain alive and polished.

Use motion thoughtfully.

LOGIN / REGISTER:

- form entrance
- input focus transitions
- button hover
- button pressed
- loading state
- success state

MODE SELECTION:

Cards should have a clear hover state.

On selection:
- subtle elevation
- border transition
- icon/state transition
- smooth transition to next step

VERIFICATION:

Progress indicator should transition smoothly between steps.

Upload:
- upload progress
- success check animation

Phone verification:
- OTP entry transition
- verified state

Verification approval:
- subtle success animation

Use approximately:
200–300ms for micro interactions
300–500ms for screen/overlay transitions
500–800ms for larger success/entrance moments

Use Smart Animate or equivalent where appropriate.

Do not use:
- excessive bouncing
- flashing
- aggressive scaling
- unnecessary spinning
- distracting parallax

Motion should feel like the same product as Batch 1.

============================================================
PART 22 — MODALS / TOASTS
============================================================

Create appropriate reusable states for:

Authentication error
Registration success
Verification submitted
Phone verified
Password reset
Session expired

Use tasteful toast notifications where appropriate.

Example:

✓ Verification submitted
Your documents are now under review.

Example:

✓ Phone verified
Your phone number has been successfully verified.

Use actual UI components, not decorative bubbles.

============================================================
PART 23 — AUTHENTICATED NAVIGATION FOUNDATION
============================================================

The existing landing navbar is for logged-out users.

Begin establishing the logged-in navigation system without building the full dashboard.

According to the site architecture, logged-in users will eventually have navigation toward:

My Trips / Orders
Marketplace
Notifications
Profile dropdown

The profile dropdown will eventually contain:
Profile
Earnings if traveler
Logout

Admin users will eventually receive:
Admin Center

For this batch, create the reusable authenticated navbar/profile-dropdown components and appropriate placeholder destinations.

Do not build the full destinations yet.

Keep the navbar visually consistent with Batch 1.

============================================================
PART 24 — ACCOUNT SWITCHING FOUNDATION
============================================================

Create a reusable mode switch component that can later be placed in the authenticated navbar/profile menu/dashboard.

Example:

Current Mode:

SENDER

Switch to:

TRAVELER

And vice versa.

The interaction should clearly communicate:

"Switching mode does not create another account."

Potential UI:

Mode
● Sender
○ Traveler

or:

Sender Mode
↔
Traveler Mode

Use whichever solution is more elegant.

Do not implement complex dashboard behavior yet.

This is the foundation for later role-aware dashboards.

============================================================
PART 25 — ACCESSIBILITY
============================================================

Maintain:

- clear labels
- strong contrast
- visible focus states
- accessible form errors
- keyboard-friendly interaction where supported
- sufficient click/tap target sizes
- icon + text where necessary
- no color-only communication

Do not make form validation dependent only on red/green color.

============================================================
PART 26 — RESPONSIVE BEHAVIOR
============================================================

Prioritize desktop consistent with Batch 1.

However, authentication and onboarding should be designed responsively from the beginning.

Ensure the layouts can adapt to:

Desktop:
1440px

Tablet:
768–1024px

Mobile:
approximately 390px

On mobile:
- forms should become single-column
- decorative visual elements may simplify
- cards may stack
- mode selection cards should stack vertically
- verification steps should remain easy to navigate
- buttons should remain comfortably tappable

Do not create a completely separate mobile design system.

============================================================
PART 27 — CODE / IMPLEMENTATION
============================================================

IMPORTANT:

Preserve the existing generated code structure from Batch 1.

Do not rewrite working components unnecessarily.

Reuse:
- existing color tokens
- typography
- button components
- card components
- input components
- icon style
- navbar
- animation conventions
- spacing
- responsive foundations

Create reusable authentication components rather than duplicating markup.

Where the existing authentication logic already works, preserve the functionality.

Improve the UI without breaking the existing routing or authentication behavior.

Do not create fake backend behavior if actual authentication logic already exists.

For UI-only states that are not yet connected to backend functionality, make them prototype-ready without pretending they are production backend operations.

============================================================
PART 28 — DESIGN QUALITY
============================================================

The authentication experience should feel like a natural continuation of the Batch 1 BringBuddy website.

It should NOT feel like:
- a generic login template
- a corporate banking portal
- a basic university CRUD application
- an unrelated SaaS authentication page

Keep the travel / parcel / trust identity subtle.

The form remains the priority.

Use visual storytelling around the form without distracting from it.

Use whitespace generously.

============================================================
PART 29 — CREATIVE FREEDOM
============================================================

You are allowed to improve the design beyond these instructions.

If you believe a different:
- layout
- illustration
- onboarding structure
- card arrangement
- animation
- transition
- form composition
- mode-switch interaction

would produce a significantly better user experience, use your professional judgment.

However, these product rules are NON-NEGOTIABLE:

1. One account can be both Sender and Traveler.
2. Sender and Traveler are modes, not separate accounts.
3. Traveler verification requires Passport/NID, profile photo, verified phone number, and emergency contact.
4. Traveler verification must be approved before the user can publish trips or accept orders.
5. A user who postpones Traveler verification must still be able to use Sender functionality.
6. Do not invent additional mandatory requirements unsupported by the project documents.
7. Preserve the existing BringBuddy design language.
8. Preserve existing working functionality.

Improve the execution, not the product architecture.

============================================================
PART 30 — FILE ORGANIZATION
============================================================

Keep the existing:

01 — Design System
02 — Landing / Home

Add:

03 — Authentication & Onboarding

Organize it clearly into:

Login
Register
Forgot Password
Reset Password
Mode Selection
Sender Onboarding
Traveler Onboarding
Verification Introduction
Verification Steps
Verification States
Reusable Auth Components

Use meaningful layer names.

Use Auto Layout.

Use reusable components and variants.

============================================================
FINAL INSTRUCTION
============================================================

Build BATCH 2 ONLY.

Extend the existing BringBuddy implementation.

Do not rebuild Batch 1.

Do not proceed to Trip Management, Marketplace, Order Creation, Order Hub, Payment, Tracking, Reviews, Earnings, Notifications, Disputes, or Admin.

At the end of this batch, the user should be able to conceptually experience:

Landing Page
→ Register
→ Choose starting mode
→ Sender onboarding OR Traveler onboarding
→ Traveler verification if desired
→ Verification pending / approved / correction states
→ Login
→ Forgot Password
→ Reset Password
→ Appropriate next destination

The experience must make one idea unmistakable:

"One BringBuddy account. Two ways to participate."

Make the authentication and onboarding experience polished, interactive, animated where useful, and fully consistent with the existing Batch 1 implementation.

STOP AFTER BATCH 2.