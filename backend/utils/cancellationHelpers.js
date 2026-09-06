const CANCELLABLE_ORDER_STATUSES = [
  'created',
  'pending',
  'accepted',
  'payment_held',
  'pickup_scheduled',
];

function isOrderCancellable(status) {
  return CANCELLABLE_ORDER_STATUSES.includes(status);
}

function restoreTripCapacity(trip, order) {
  if (
    !trip ||
    order.orderType !== 'parcel' ||
    !order.totalWeightKg
  ) {
    return false;
  }

  const weight = Number(order.totalWeightKg);
  const currentCapacity = Number(trip.remainingCapacityKg);
  const maximumCapacity = Number(trip.luggageCapacityKg);

  if (
    !Number.isFinite(weight) ||
    weight <= 0 ||
    !Number.isFinite(currentCapacity) ||
    !Number.isFinite(maximumCapacity)
  ) {
    return false;
  }

  trip.remainingCapacityKg = Math.min(
    maximumCapacity,
    currentCapacity + weight
  );

  if (
    trip.status === 'full' &&
    trip.remainingCapacityKg > 0
  ) {
    trip.status = 'published';
  }

  return true;
}

function calculateCancellationRate(
  completedDeliveries,
  cancellationCount
) {
  const completed = Math.max(
    0,
    Number(completedDeliveries) || 0
  );

  const cancelled = Math.max(
    0,
    Number(cancellationCount) || 0
  );

  const total = completed + cancelled;

  if (total === 0) {
    return 0;
  }

  return Number(
    ((cancelled / total) * 100).toFixed(2)
  );
}

module.exports = {
  CANCELLABLE_ORDER_STATUSES,
  isOrderCancellable,
  restoreTripCapacity,
  calculateCancellationRate,
};
