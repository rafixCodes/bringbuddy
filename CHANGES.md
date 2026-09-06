# Ki ki korlam

Feature 7 (Traveler Search) ar Feature 8 (Public Marketplace) - ei duita.

## Feature 7 - Traveler Search

- trip search e from/to/date select korle age kichui hoto na. je kono route
  diyei ekoi 5ta Dhaka-London trip dekhato. Dhaka theke Sydney diyeo tai.
  ekhon thik moto filter hoy.
- trip data te departISO field add korlam, karon '28 Aug 2026' erokom string
  ar date picker er '2026-08-28' compare kora jachhilo na.
- traveler 5 theke 10 korlam, trip 5 theke 17. Dubai, New York, Toronto,
  Sydney, Paris, Frankfurt route gula add korlam. age sudhu Dhaka-London
  chilo tai route filter kore kichui bojha jeto na.
- trust level filter add korlam (High Trust / Trusted / New). PDF te chawa
  chilo kintu chilo na.
- sort add korlam - best match, kom dam, beshi rating, sobar age flight,
  beshi jayga.
- best match er jonno chhoto ekta scoring likhlam - rating, trust level,
  verified kina, koto kg khali ache, dam, ar date koto kachhe. egula mile
  score hoy.
- "View Profile" button e click korle trip detail page e chole jeto.
  ekhon thik profile page e jay.
- ek e city theke ek e city te search korle ekhon warning dey.

## Feature 8 - Public Marketplace

- min/max fee filter box e number lekha jeto kintu kono kaj e lagto na.
  ekhon kaj kore.
- sort e sudhu "highest fee" kaj korto. baki tinta (newest, travel date,
  closest match) kichui korto na. sob thik korlam.
- newest sort er jonno "2 hours ago" string ta number banalam. string diye
  to sort kora jay na.
- closest match mane ekhon traveler er nijer je trip gula ache tar route ar
  date er sathe mile. card e "matches your trip" badge o dekhay.
- boro bug chilo: je kono request er applications dekhle ekoi 3 jon
  applicant dekhato, karon hardcoded demo data boshano chilo. mane mr3 er
  applications khulleo mr1 er lok dekhato. oita fele diye protita request e
  nijer alada application boshalam.
- apply korle applicant hishebe sob somoy Aisha Rahman (4.9 rating, 42
  delivery) hardcoded hoye jeto, je e login thakuk na keno. ekhon je login
  ache tar asol profile theke ashe.
- application withdraw korar option add korlam. age ekbar apply kore fella
  ar kichui kora jeto na.
- nijer post kora request e nije apply kora jeto. seta bondho korlam.
- sender er jonno "My Requests" / "All Requests" tab korlam. age nijer ar
  onner request ekshathe mishe thakto.
- sob cheye boro jinish: "Post a Request" e post korle marketplace e kichui
  add e hoto na! sudhu ekta order banato. ekhon asholei publish hoy, ar
  route/date/fee o select kora jay.
- marketplace e request 4 theke 9 korlam. age traveler er chokhe matro 3ta
  porto, tate filter/tab/sort er kono mane e thakto na.

## Pore test kore je bug gula paisi

- marketplace e traveler theke sender e switch korle sort dropdown ta faka
  hoye jeto. thik korlam.
- "Post a Request" button ta item details skip kore soja post page e
  pathato, fole "Parcel" name e faka request toiri hoto. ekhon order form
  diye jay.
- ekta purano state (myApplications) ar kono kaje lagchilo na, fele dilam.
- September er date "5 Sept 2026" dekhato, baki sob jaygay "5 Sep 2026".
  barota mash test kore thik korlam.

## Feature 9 - Direct Booking

- order id 'BB-1048' hardcoded chilo, mane protita direct order er ekoi
  number. ekhon protibar alada id generate hoy.
- sob cheye kharap ta: traveler na beche o booking hoye jeto! dashboard theke
  "New delivery request" e gele kono traveler select hoto na, ar tokhon chup
  chap Aisha Rahman ar tr1 trip e book hoye jeto. ekhon traveler na thakle
  "pick a traveler first" screen dekhay ar search e pathay. parcel details
  save thake.
- capacity check chilo na - 2 kg khali ache emon trip e 10 kg pathano jeto.
  ekhon block kore, ar koto kg khali seta review page eo dekhay.
- traveler er dike capacity bar ta puro bhua chilo. CAPACITY_TOTAL = 6 ar
  used = 0 hardcoded chilo, asol trip er sathe kono somporko nai. ekhon asol
  trip theke ashe.
- sender hishebe sob somoy "Alex Johnson, 4.7 star, 8 orders" hardcoded
  dekhato, je e pathak na keno. ekhon asol sender er nam ashe. bhua rating ta
  fele dilam, karon oi data ta asole kothao nai.
- special instructions o hardcoded chilo ("Handle with care. Fragile items
  inside."), sender ki likhse tar sathe kono somporko nai. ekhon asol ta
  dekhay.
- accept korle order ta notun kore banato, fole senderName, special
  instructions, receiver phone, product url, quantity, budget - sob muche
  jeto. ekhon sudhu status ta update hoy, kono data hare na.
- decline ekta dead end chilo. order ta chup chap null hoye jeto, sender
  kichui janto na. ekhon karon jigges kore, order ta "cancelled" hoy ar
  sender er dashboard e lal e dekhay, sathe notification o jay.
- send / accept / decline - tinta teii ekhon notification jay ar timestamp
  boshe.

## Je file gula change korsi

- src/data/prototype.ts
- src/lib/router.tsx
- src/components/trips/TripSearch.tsx
- src/components/marketplace/Marketplace.tsx
- src/components/marketplace/MarketplaceRequestDetail.tsx
- src/components/marketplace/ApplicationsView.tsx
- src/components/orders/MarketplacePost.tsx
- src/components/orders/OrderSummary.tsx
- src/components/orders/RequestDetail.tsx

baki 53ta file e hat dei nai.
