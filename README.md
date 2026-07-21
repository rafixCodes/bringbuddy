# 🌍 BringBuddy

**BringBuddy** is a MERN-stack web application that connects international travelers with people who need to send parcels or purchase products across countries. Instead of relying on expensive international courier services, travelers can utilize their unused luggage space to carry parcels or purchase requested products while earning additional income.

The platform acts as a trusted marketplace by providing user authentication, traveler verification, notifications, booking management, order tracking, and administrative controls.

---

# 👥 Group Information

**Course:** CSE470 – Software Engineering

**Project Title:** BringBuddy – Cross-Border Traveler Marketplace

## Team Members

| Student ID | Name |
|------------|---------------------------|
| 23101536   | Sheikh Mohammad Omor |
| 22201863   | Dilshad Mehrin Diba |
| 24141264   | Dipta Mazumder |
| 21201791   | Fahim Ahmad |

---

# 🚀 Technology Stack

## Frontend
- React.js
- React Router
- Axios
- HTML5
- CSS3

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JSON Web Token (JWT)
- Bcrypt.js

## Development Tools
- Git
- GitHub
- Visual Studio Code
- Postman

---

# 🏗️ Architecture

The project follows the **MVC (Model–View–Controller)** architecture.

```
React Frontend
      │
      ▼
Express REST API
      │
      ▼
Controllers
      │
      ▼
Models (Mongoose)
      │
      ▼
MongoDB
```

---

# 📂 Project Structure

```
BringBuddy
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── .env
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/rafixCodes/bringbuddy.git
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

# 📌 Planned Features

- Traveler Verification & Trust Onboarding
- Traveler Profile & Reputation Card
- Trip Management
- Parcel Delivery Orders
- Shopping Request Orders
- Smart Traveler Search
- Public Marketplace
- Booking & Application Management
- Order Hub
- Dummy Escrow Payment
- Luggage Capacity Management
- Order Tracking
- OTP Delivery Confirmation
- Ratings & Reviews
- Cancellation & Recovery Management
- Earnings Dashboard
- Admin Control Center
- Dispute Resolution System

---

# 📖 Project Overview

BringBuddy provides a secure and transparent marketplace where:

- Travelers publish upcoming trips.
- Senders search for travelers or publish delivery requests.
- Travelers earn money by utilizing unused luggage space.
- Users receive real-time notifications.
- Restricted items are managed for platform safety.
- The platform aims to provide an affordable alternative to traditional international courier services.

---

# 📜 License

This project is developed for academic purposes as part of **CSE470 – Software Engineering** at **BRAC University**.
