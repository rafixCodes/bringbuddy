const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const travelerRoutes = require('./routes/travelerRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tripRoutes = require('./routes/tripRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic API health check
app.get('/', (req, res) => {
  res.send('BringBuddy API is running');
});

// Routes
app.use('/api/travelers', travelerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});