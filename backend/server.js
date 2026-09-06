const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const travelerRoutes = require('./routes/travelerRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const tripRoutes = require('./routes/tripRoutes');
const adminRoutes = require('./routes/adminRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const otpRoutes = require('./routes/otpRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('BringBuddy API is running');
});

app.use('/api/travelers', travelerRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/verifications', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/tracking', trackingRoutes);

app.use('/api/delivery-otp', otpRoutes);
app.use('/api/reviews', reviewRoutes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
