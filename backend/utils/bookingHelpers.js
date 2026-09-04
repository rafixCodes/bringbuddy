const Order = require('../models/Order');

const ACTIVE_ORDER_STATUSES = [
  'accepted',
  'payment_held',
  'pickup_scheduled',
  'collected',
  'in_transit',
  'arrived',
  'delivered',
  'payment_released',
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function doesTripMatchOrder(trip, order) {
  const departureMatches =
    normalizeText(trip.departureCity) ===
      normalizeText(order.pickup?.city) &&
    normalizeText(trip.departureCountry) ===
      normalizeText(order.pickup?.country);

  const destinationMatches =
    normalizeText(trip.destinationCity) ===
      normalizeText(order.destination?.city) &&
    normalizeText(trip.destinationCountry) ===
      normalizeText(order.destination?.country);

  return departureMatches && destinationMatches;
}

function getActiveOrderLimit(traveler) {
  const completedDeliveries = Number(
    traveler.travelerInfo?.completedDeliveries || 0
  );

  return completedDeliveries >= 5 ? 5 : 1;
}

async function countActiveOrders(travelerId, session = null) {
  let query = Order.countDocuments({
    traveler: travelerId,
    status: { $in: ACTIVE_ORDER_STATUSES },
  });

  if (session) {
    query = query.session(session);
  }

  return query;
}

function validateTripCapacity(trip, order) {
  if (order.orderType !== 'parcel' || !order.totalWeightKg) {
    return;
  }

  const requiredWeight = Number(order.totalWeightKg);
  const remainingCapacity = Number(trip.remainingCapacityKg);

  if (
    !Number.isFinite(requiredWeight) ||
    requiredWeight <= 0
  ) {
    const error = new Error('Order weight is invalid');
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isFinite(remainingCapacity) ||
    remainingCapacity < requiredWeight
  ) {
    const error = new Error(
      'Traveler does not have enough remaining luggage capacity'
    );
    error.statusCode = 409;
    throw error;
  }
}

function deductTripCapacity(trip, order) {
  if (order.orderType !== 'parcel' || !order.totalWeightKg) {
    return;
  }

  validateTripCapacity(trip, order);

  const updatedCapacity =
    Number(trip.remainingCapacityKg) -
    Number(order.totalWeightKg);

  trip.remainingCapacityKg = Math.max(0, updatedCapacity);

  if (trip.remainingCapacityKg === 0) {
    trip.status = 'full';
  }
}

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  ACTIVE_ORDER_STATUSES,
  normalizeText,
  doesTripMatchOrder,
  getActiveOrderLimit,
  countActiveOrders,
  validateTripCapacity,
  deductTripCapacity,
  createHttpError,
};
