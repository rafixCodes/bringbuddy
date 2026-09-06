const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isOrderCancellable,
  restoreTripCapacity,
  calculateCancellationRate,
} = require('../utils/cancellationHelpers');

test('allows cancellation only before parcel collection', () => {
  assert.equal(isOrderCancellable('created'), true);
  assert.equal(isOrderCancellable('pending'), true);
  assert.equal(isOrderCancellable('accepted'), true);
  assert.equal(isOrderCancellable('payment_held'), true);
  assert.equal(isOrderCancellable('pickup_scheduled'), true);

  assert.equal(isOrderCancellable('collected'), false);
  assert.equal(isOrderCancellable('in_transit'), false);
  assert.equal(isOrderCancellable('delivered'), false);
  assert.equal(isOrderCancellable('cancelled'), false);
});

test('restores deducted parcel capacity exactly up to trip maximum', () => {
  const trip = {
    luggageCapacityKg: 10,
    remainingCapacityKg: 6,
    status: 'published',
  };

  const order = {
    orderType: 'parcel',
    totalWeightKg: 4,
  };

  assert.equal(restoreTripCapacity(trip, order), true);
  assert.equal(trip.remainingCapacityKg, 10);
});

test('reopens a full trip when capacity is restored', () => {
  const trip = {
    luggageCapacityKg: 5,
    remainingCapacityKg: 0,
    status: 'full',
  };

  const order = {
    orderType: 'parcel',
    totalWeightKg: 3,
  };

  restoreTripCapacity(trip, order);

  assert.equal(trip.remainingCapacityKg, 3);
  assert.equal(trip.status, 'published');
});

test('does not change trip capacity for a shopping request', () => {
  const trip = {
    luggageCapacityKg: 10,
    remainingCapacityKg: 4,
    status: 'published',
  };

  const order = {
    orderType: 'shopping',
  };

  assert.equal(restoreTripCapacity(trip, order), false);
  assert.equal(trip.remainingCapacityKg, 4);
});

test('calculates traveler cancellation rate safely', () => {
  assert.equal(calculateCancellationRate(0, 0), 0);
  assert.equal(calculateCancellationRate(4, 1), 20);
  assert.equal(calculateCancellationRate(5, 2), 28.57);
});
