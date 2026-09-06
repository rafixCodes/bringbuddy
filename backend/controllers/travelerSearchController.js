const Trip = require('../models/Trip');

function cleanText(value) {
  return String(value || '').trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactTextPattern(value) {
  return new RegExp(`^${escapeRegex(cleanText(value))}$`, 'i');
}

function optionalNumber(value, name, { min = 0, max = Infinity } = {}) {
  if (value === undefined || value === '') return null;

  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    const error = new Error(`${name} must be between ${min} and ${max}`);
    error.statusCode = 400;
    throw error;
  }

  return number;
}

function getDateRange(dateValue) {
  if (!dateValue) return null;

  const start = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(start.getTime())) {
    const error = new Error('Travel date is invalid');
    error.statusCode = 400;
    throw error;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

function compareResults(sortBy) {
  const comparators = {
    soonest: (a, b) => new Date(a.trip.travelDate) - new Date(b.trip.travelDate),
    price_low: (a, b) => a.trip.pricePerKg - b.trip.pricePerKg,
    rating_high: (a, b) => b.traveler.averageRating - a.traveler.averageRating,
    trust_high: (a, b) => b.traveler.trustScore - a.traveler.trustScore,
    capacity_high: (a, b) => b.trip.remainingCapacityKg - a.trip.remainingCapacityKg,
  };

  return comparators[sortBy] || comparators.soonest;
}

// GET /api/traveler-search
const searchTravelerTrips = async (req, res) => {
  try {
    if (req.user.currentMode !== 'sender') {
      return res.status(403).json({
        success: false,
        message: 'Switch to sender mode to search traveler trips',
      });
    }

    const from = cleanText(req.query.from);
    const to = cleanText(req.query.to);

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Departure and destination cities are required',
      });
    }

    const minCapacity = optionalNumber(req.query.minCapacity, 'Minimum capacity', {
      min: 0,
      max: 100,
    });
    const maxPrice = optionalNumber(req.query.maxPrice, 'Maximum price', {
      min: 0,
      max: 1000000,
    });
    const minRating = optionalNumber(req.query.minRating, 'Minimum rating', {
      min: 0,
      max: 5,
    });
    const minTrust = optionalNumber(req.query.minTrust, 'Minimum trust score', {
      min: 0,
      max: 100,
    });
    const dateRange = getDateRange(req.query.date);
    const verifiedOnly = req.query.verifiedOnly !== 'false';
    const sortBy = cleanText(req.query.sort) || 'soonest';

    const now = new Date();
    const tripQuery = {
      status: 'published',
      departureCity: exactTextPattern(from),
      destinationCity: exactTextPattern(to),
      travelDate: dateRange
        ? { $gte: dateRange.start, $lt: dateRange.end }
        : { $gte: now },
    };

    if (minCapacity !== null) {
      tripQuery.remainingCapacityKg = { $gte: minCapacity };
    }

    if (maxPrice !== null) {
      tripQuery.pricePerKg = { $lte: maxPrice };
    }

    const trips = await Trip.find(tripQuery)
      .populate(
        'traveler',
        'name profilePhoto travelerInfo.isVerified travelerInfo.verificationStatus travelerInfo.averageRating travelerInfo.totalReviews travelerInfo.completedDeliveries travelerInfo.trustScore travelerInfo.responseTime travelerInfo.memberSince isActive isSuspended'
      )
      .sort({ travelDate: 1 });

    const results = trips
      .filter((trip) => {
        const traveler = trip.traveler;

        if (!traveler) return false;
        if (traveler._id.toString() === req.user._id.toString()) return false;
        if (!traveler.isActive || traveler.isSuspended) return false;

        const info = traveler.travelerInfo || {};

        if (verifiedOnly && !info.isVerified) return false;
        if (minRating !== null && Number(info.averageRating || 0) < minRating) return false;
        if (minTrust !== null && Number(info.trustScore || 0) < minTrust) return false;

        return true;
      })
      .map((trip) => ({
        trip: {
          _id: trip._id,
          departureCity: trip.departureCity,
          departureCountry: trip.departureCountry,
          destinationCity: trip.destinationCity,
          destinationCountry: trip.destinationCountry,
          travelDate: trip.travelDate,
          luggageCapacityKg: trip.luggageCapacityKg,
          remainingCapacityKg: trip.remainingCapacityKg,
          pricePerKg: trip.pricePerKg,
          allowedCategories: trip.allowedCategories,
          status: trip.status,
        },
        traveler: {
          _id: trip.traveler._id,
          name: trip.traveler.name,
          profilePhoto: trip.traveler.profilePhoto,
          isVerified: Boolean(trip.traveler.travelerInfo?.isVerified),
          verificationStatus: trip.traveler.travelerInfo?.verificationStatus,
          averageRating: Number(trip.traveler.travelerInfo?.averageRating || 0),
          totalReviews: Number(trip.traveler.travelerInfo?.totalReviews || 0),
          completedDeliveries: Number(
            trip.traveler.travelerInfo?.completedDeliveries || 0
          ),
          trustScore: Number(trip.traveler.travelerInfo?.trustScore || 0),
          responseTime: Number(trip.traveler.travelerInfo?.responseTime || 0),
          memberSince: trip.traveler.travelerInfo?.memberSince,
        },
      }))
      .sort(compareResults(sortBy));

    return res.status(200).json({
      success: true,
      count: results.length,
      filters: {
        from,
        to,
        date: req.query.date || null,
        minCapacity,
        maxPrice,
        minRating,
        minTrust,
        verifiedOnly,
        sort: sortBy,
      },
      results,
    });
  } catch (error) {
    console.error('Traveler search error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Could not search traveler trips',
    });
  }
};

module.exports = {
  searchTravelerTrips,
};
