const test = require('node:test');
const assert = require('node:assert/strict');

const databaseTestEnabled = process.env.ALLOW_REVIEW_DB_TEST === '1';
let mongoose;
let Order;
let Review;
let User;
let createReview;
let getReviewContext;

if (databaseTestEnabled) {
  require('dotenv').config();
  mongoose = require('mongoose');
  Order = require('../models/Order');
  Review = require('../models/Review');
  User = require('../models/User');
  ({ createReview, getReviewContext } = require('../controllers/reviewController'));
}

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

async function call(handler, { userId, body = {}, params = {} }) {
  const response = mockResponse();
  await handler({ user: { id: userId.toString() }, body, params }, response);
  return response;
}

test('completed-order review workflow is secure and updates both reputations', {
  skip: databaseTestEnabled ? false : 'Set ALLOW_REVIEW_DB_TEST=1 to run the self-cleaning database test'
}, async () => {
  assert.ok(process.env.MONGO_URI, 'MONGO_URI is required');

  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const createdUserIds = [];
  let orderId;

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const [sender, traveler, outsider] = await User.create([
      {
        name: `Review Sender ${unique}`,
        email: `review-sender-${unique}@example.com`,
        password: 'temporary-test-password',
        phone: '+8801700000001',
        currentMode: 'sender',
        hasCompletedOnboarding: true
      },
      {
        name: `Review Traveler ${unique}`,
        email: `review-traveler-${unique}@example.com`,
        password: 'temporary-test-password',
        phone: '+8801700000002',
        currentMode: 'traveler',
        hasCompletedOnboarding: true,
        travelerInfo: {
          isVerified: true,
          verificationStatus: 'approved',
          completedDeliveries: 4,
          cancellationRate: 10
        }
      },
      {
        name: `Review Outsider ${unique}`,
        email: `review-outsider-${unique}@example.com`,
        password: 'temporary-test-password',
        phone: '+8801700000003',
        currentMode: 'sender',
        hasCompletedOnboarding: true
      }
    ]);
    createdUserIds.push(sender._id, traveler._id, outsider._id);

    const order = await Order.create({
      sender: sender._id,
      traveler: traveler._id,
      orderType: 'parcel',
      bookingMethod: 'public',
      items: [{ name: 'Review test parcel', weightKg: 1 }],
      totalWeightKg: 1,
      pickup: { city: 'Dhaka', country: 'Bangladesh' },
      destination: { city: 'London', country: 'United Kingdom' },
      receiver: { name: 'Test Receiver', phone: '+441234567890', address: 'Test address' },
      status: 'completed',
      timeline: [{ status: 'completed', note: 'Temporary review integration test' }]
    });
    orderId = order._id;

    const senderReview = await call(createReview, {
      userId: sender._id,
      body: { orderId: order._id.toString(), rating: 5, comment: 'Excellent delivery' }
    });
    assert.equal(senderReview.statusCode, 201);
    assert.equal(senderReview.body.review.reviewer.toString(), sender._id.toString());
    assert.equal(senderReview.body.review.reviewee._id.toString(), traveler._id.toString());
    assert.equal(senderReview.body.review.reviewerRole, 'sender');

    const duplicate = await call(createReview, {
      userId: sender._id,
      body: { orderId: order._id.toString(), rating: 4 }
    });
    assert.equal(duplicate.statusCode, 409);

    const outsiderAttempt = await call(createReview, {
      userId: outsider._id,
      body: { orderId: order._id.toString(), rating: 1 }
    });
    assert.equal(outsiderAttempt.statusCode, 403);

    const travelerReview = await call(createReview, {
      userId: traveler._id,
      body: { orderId: order._id.toString(), rating: 4, comment: 'Clear instructions' }
    });
    assert.equal(travelerReview.statusCode, 201);
    assert.equal(travelerReview.body.review.reviewee._id.toString(), sender._id.toString());
    assert.equal(travelerReview.body.review.reviewerRole, 'traveler');

    const refreshedTraveler = await User.findById(traveler._id);
    const refreshedSender = await User.findById(sender._id);
    assert.equal(refreshedTraveler.travelerInfo.averageRating, 5);
    assert.equal(refreshedTraveler.travelerInfo.totalReviews, 1);
    assert.equal(refreshedTraveler.travelerInfo.trustScore, 83);
    assert.equal(refreshedSender.travelerInfo.averageRating, 4);
    assert.equal(refreshedSender.travelerInfo.totalReviews, 1);

    const context = await call(getReviewContext, {
      userId: sender._id,
      params: { orderId: order._id.toString() }
    });
    assert.equal(context.statusCode, 200);
    assert.equal(context.body.canReview, false);
    assert.equal(context.body.myReview.rating, 5);
    assert.equal(context.body.reviewAboutMe.rating, 4);
  } finally {
    if (orderId) {
      await Review.deleteMany({ order: orderId });
      await Order.deleteOne({ _id: orderId });
    }
    if (createdUserIds.length) await User.deleteMany({ _id: { $in: createdUserIds } });
    await mongoose.disconnect();
  }
});
