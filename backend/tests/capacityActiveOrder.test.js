const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ACTIVE_ORDER_STATUSES,
  getActiveOrderLimit,
  validateTripCapacity,
  deductTripCapacity,
} = require('../utils/bookingHelpers');

test('new traveler can have only 1 active order', () => {
  const traveler = {
    travelerInfo: { completedDeliveries: 0 },
  };

  assert.equal(getActiveOrderLimit(traveler), 1);
});

test('traveler with fewer than 5 deliveries still has limit 1', () => {
  const traveler = {
    travelerInfo: { completedDeliveries: 4 },
  };

  assert.equal(getActiveOrderLimit(traveler), 1);
});

test('traveler with 5 or more deliveries can have 5 active orders', () => {
  const travelerWithFive = {
    travelerInfo: { completedDeliveries: 5 },
  };

  const experiencedTraveler = {
    travelerInfo: { completedDeliveries: 12 },
  };

  assert.equal(getActiveOrderLimit(travelerWithFive), 5);
  assert.equal(getActiveOrderLimit(experiencedTraveler), 5);
});

test('rejects parcel when remaining capacity is insufficient', () => {
  const trip = { remainingCapacityKg: 2 };
  const order = { orderType: 'parcel', totalWeightKg: 3 };

  assert.throws(
    () => validateTripCapacity(trip, order),
    (error) => {
      assert.equal(error.statusCode, 409);
      return true;
    }
  );
});

test('deducts parcel weight from remaining trip capacity', () => {
  const trip = {
    remainingCapacityKg: 10,
    status: 'published',
  };

  const order = {
    orderType: 'parcel',
    totalWeightKg: 3,
  };

  deductTripCapacity(trip, order);

  assert.equal(trip.remainingCapacityKg, 7);
  assert.equal(trip.status, 'published');
});

test('marks trip full when remaining capacity becomes zero', () => {
  const trip = {
    remainingCapacityKg: 5,
    status: 'published',
  };

  const order = {
    orderType: 'parcel',
    totalWeightKg: 5,
  };

  deductTripCapacity(trip, order);

  assert.equal(trip.remainingCapacityKg, 0);
  assert.equal(trip.status, 'full');
});

test('only unfinished delivery statuses count as active', () => {
  assert.deepEqual(ACTIVE_ORDER_STATUSES, [
    'accepted',
    'payment_held',
    'pickup_scheduled',
    'collected',
    'in_transit',
    'arrived',
  ]);

  assert.equal(ACTIVE_ORDER_STATUSES.includes('delivered'), false);
  assert.equal(ACTIVE_ORDER_STATUSES.includes('payment_released'), false);
  assert.equal(ACTIVE_ORDER_STATUSES.includes('completed'), false);
  assert.equal(ACTIVE_ORDER_STATUSES.includes('cancelled'), false);
});
