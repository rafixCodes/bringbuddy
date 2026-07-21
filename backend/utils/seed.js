const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const password = await bcrypt.hash('password123', 10);

    const testUsers = [
      // Travelers
      {
        name: 'John Doe',
        email: 'john.traveler@example.com',
        password,
        phone: '+8801711111111',
        role: 'traveler',
        profilePhoto: '',
        travelerInfo: {
          isVerified: true,
          verificationStatus: 'approved',
          trustScore: 85,
          completedDeliveries: 12,
          cancellationRate: 5,
          averageRating: 4.7,
          totalReviews: 8,
          responseTime: 15,
          defaultCarryingFeePerKg: 8,
          maxActiveOrders: 5
        }
      },
      {
        name: 'Sarah Smith',
        email: 'sarah.traveler@example.com',
        password,
        phone: '+8801722222222',
        role: 'traveler',
        profilePhoto: '',
        travelerInfo: {
          isVerified: true,
          verificationStatus: 'approved',
          trustScore: 72,
          completedDeliveries: 5,
          cancellationRate: 10,
          averageRating: 4.2,
          totalReviews: 4,
          responseTime: 30,
          defaultCarryingFeePerKg: 12,
          maxActiveOrders: 1
        }
      },
      {
        name: 'Mike Chen',
        email: 'mike.traveler@example.com',
        password,
        phone: '+8801733333333',
        role: 'traveler',
        profilePhoto: '',
        travelerInfo: {
          isVerified: false,
          verificationStatus: 'pending',
          trustScore: 0,
          completedDeliveries: 0,
          cancellationRate: 0,
          averageRating: 0,
          totalReviews: 0,
          responseTime: 0,
          defaultCarryingFeePerKg: 10,
          maxActiveOrders: 1
        }
      },
      // Senders
      {
        name: 'Alice Brown',
        email: 'alice.sender@example.com',
        password,
        phone: '+8801744444444',
        role: 'sender',
        profilePhoto: ''
      },
      {
        name: 'Bob Wilson',
        email: 'bob.sender@example.com',
        password,
        phone: '+8801755555555',
        role: 'sender',
        profilePhoto: ''
      },
      // Admin
      {
        name: 'Admin User',
        email: 'admin@bringbuddy.com',
        password,
        phone: '+8801766666666',
        role: 'admin',
        profilePhoto: ''
      }
    ];

    const createdUsers = [];

    for (const userData of testUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`Skipped (already exists): ${userData.email}`);
        createdUsers.push(exists);
      } else {
        const user = await User.create(userData);
        console.log(`Created: ${user.role} — ${user.name} (${user.email})`);
        createdUsers.push(user);
      }
    }

    console.log('\n=== TEST USERS READY ===');
    console.log('All passwords: password123');
    console.log('\nTravelers:');
    createdUsers
      .filter(u => u.role === 'traveler')
      .forEach(u => console.log(`  ${u.name} — ID: ${u._id} — Email: ${u.email}`));

    console.log('\nSenders:');
    createdUsers
      .filter(u => u.role === 'sender')
      .forEach(u => console.log(`  ${u.name} — ID: ${u._id} — Email: ${u.email}`));

    console.log('\nAdmin:');
    createdUsers
      .filter(u => u.role === 'admin')
      .forEach(u => console.log(`  ${u.name} — ID: ${u._id} — Email: ${u.email}`));

    console.log('\nTest your Feature 2 endpoint:');
    const firstTraveler = createdUsers.find(u => u.role === 'traveler');
    console.log(`GET http://localhost:5000/api/travelers/${firstTraveler._id}`);

    await mongoose.disconnect();
    console.log('\nDone. Disconnected from MongoDB.');

  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedData();