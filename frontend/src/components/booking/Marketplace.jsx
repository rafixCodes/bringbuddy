import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Loader2,
  MapPin,
  Package,
  Plane,
  ShoppingBag,
  Weight,
} from 'lucide-react';

import { AuthNavbar } from '../AuthNavbar';
import { Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../lib/toast';
import { getMyTrips } from '../../services/tripService';
import { getMarketplaceOrders } from '../../services/marketplaceService';
import { applyToOrder } from '../../services/applicationService';

function formatDate(value) {
  if (!value) return 'Date unavailable';

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MarketplaceOrderCard({
  order,
  selectedTripId,
  busyOrderId,
  onApply,
}) {
  const [proposedFee, setProposedFee] = useState('');
  const [message, setMessage] = useState('');

  const isBusy = busyOrderId === order._id;

  return (
    <div className="rounded-[18px] border border-border bg-white p-5 shadow-[var(--shadow-e1)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-primary-light text-primary">
            {order.orderType === 'shopping' ? (
              <ShoppingBag size={20} />
            ) : (
              <Package size={20} />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[16px] font-bold text-ink">
                {order.orderType === 'shopping'
                  ? 'Shopping Request'
                  : 'Parcel Delivery'}
              </h2>

              <span className="rounded-full bg-success-light px-2.5 py-1 text-[10px] font-semibold text-success">
                Open
              </span>
            </div>

            <p className="mt-1 text-[12px] text-ink-muted">
              Posted by {order.sender?.name || 'Sender'} on{' '}
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-[12px] bg-divider p-4 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <MapPin
              size={15}
              className="mt-0.5 shrink-0 text-primary"
            />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Pickup
              </p>

              <p className="text-[13px] font-medium text-ink">
                {order.pickup?.city}, {order.pickup?.country}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin
              size={15}
              className="mt-0.5 shrink-0 text-coral"
            />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Destination
              </p>

              <p className="text-[13px] font-medium text-ink">
                {order.destination?.city},{' '}
                {order.destination?.country}
              </p>
            </div>
          </div>
        </div>

        {order.orderType === 'parcel' && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-[12px] text-ink-secondary">
              <Weight size={14} />

              <span>
                Total weight:{' '}
                <strong>{order.totalWeightKg || 0} kg</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(order.items || []).map((item, index) => (
                <span
                  key={`${item.name}-${index}`}
                  className="rounded-full border border-border bg-white px-3 py-1 text-[11px] text-ink-secondary"
                >
                  {item.name || `Item ${index + 1}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {order.orderType === 'shopping' && (
          <div className="rounded-[10px] border border-border p-3">
            <p className="text-[12px] text-ink-secondary">
              Quantity:{' '}
              <strong>
                {order.shoppingDetails?.quantity || 1}
              </strong>
            </p>

            <p className="mt-1 text-[12px] text-ink-secondary">
              Budget:{' '}
              <strong>
                ৳
                {Number(
                  order.shoppingDetails?.budget || 0
                ).toLocaleString()}
              </strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-ink">
              Your carrying fee
            </label>

            <input
              type="number"
              min="1"
              value={proposedFee}
              onChange={(event) =>
                setProposedFee(event.target.value)
              }
              placeholder="Enter total fee"
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[13px] text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-ink">
              Message to sender
            </label>

            <input
              type="text"
              maxLength="500"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Optional message"
              className="w-full rounded-[10px] border border-border bg-white px-3 py-2.5 text-[13px] text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          disabled={
            isBusy || !selectedTripId || !proposedFee
          }
          leadingIcon={
            isBusy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plane size={16} />
            )
          }
          onClick={() =>
            onApply(order._id, {
              tripId: selectedTripId,
              proposedFee: Number(proposedFee),
              message,
            })
          }
        >
          {isBusy ? 'Submitting…' : 'Apply to Carry'}
        </Button>
      </div>
    </div>
  );
}

export function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();

  const mode = user?.currentMode;

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [orders, setOrders] = useState([]);

  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      if (mode !== 'traveler') {
        setTrips([]);
        setSelectedTripId('');
        setOrders([]);
        setPageError('');
        setLoadingTrips(false);
        return;
      }

      try {
        setLoadingTrips(true);
        setPageError('');

        const data = await getMyTrips();

        const publishedTrips = (data.trips || []).filter(
          (trip) => trip.status === 'published'
        );

        if (!cancelled) {
          setTrips(publishedTrips);
          setSelectedTripId(
            publishedTrips.length > 0
              ? publishedTrips[0]._id
              : ''
          );
        }
      } catch (error) {
        if (!cancelled) {
          setTrips([]);
          setSelectedTripId('');
          setOrders([]);

          setPageError(
            error.response?.data?.message ||
              'Could not load your trips.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTrips(false);
        }
      }
    }

    loadTrips();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      if (mode !== 'traveler' || !selectedTripId) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }

      try {
        setLoadingOrders(true);
        setPageError('');

        const data = await getMarketplaceOrders(
          selectedTripId
        );

        if (!cancelled) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        if (!cancelled) {
          setOrders([]);

          setPageError(
            error.response?.data?.message ||
              'Could not load marketplace orders.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOrders(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [mode, selectedTripId]);

  async function handleApply(orderId, payload) {
    try {
      setBusyOrderId(orderId);

      await applyToOrder(orderId, payload);

      toast({
        tone: 'success',
        title: 'Application submitted',
        message:
          'The sender can now review your application.',
      });

      setOrders((currentOrders) =>
        currentOrders.filter(
          (order) => order._id !== orderId
        )
      );
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Application failed',
        message:
          error.response?.data?.message ||
          'Could not submit the application.',
      });
    } finally {
      setBusyOrderId(null);
    }
  }

  if (mode !== 'traveler') {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />

        <main className="mx-auto max-w-[720px] px-6 pb-20 pt-28">
          <div className="rounded-[20px] border border-border bg-white p-10 text-center shadow-[var(--shadow-e1)]">
            <Plane
              size={34}
              className="mx-auto mb-4 text-primary"
            />

            <h1 className="text-[24px] font-bold text-ink">
              Traveler Marketplace
            </h1>

            <p className="mx-auto mt-2 max-w-[480px] text-[14px] text-ink-secondary">
              Senders publish delivery requests here. Switch to
              Traveler mode to browse matching orders and apply to
              carry them.
            </p>

            <p className="mt-5 text-[12px] font-medium text-ink-muted">
              Use the Sender/Traveler switch in the navigation bar.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-28">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-ink">
            Public Delivery Marketplace
          </h1>

          <p className="mt-1 text-[14px] text-ink-secondary">
            Select one of your published trips to find matching
            delivery requests.
          </p>
        </div>

        {pageError && (
          <div className="mb-5 flex items-start gap-3 rounded-[14px] border border-danger/20 bg-danger-light p-4">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-danger"
            />

            <p className="text-[13px] text-danger">
              {pageError}
            </p>
          </div>
        )}

        {loadingTrips ? (
          <div className="flex items-center justify-center gap-2 rounded-[18px] border border-border bg-white p-10 text-ink-muted">
            <Loader2 size={20} className="animate-spin" />
            Loading your trips…
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-border bg-white p-10 text-center">
            <Plane
              size={30}
              className="mx-auto mb-3 text-ink-muted"
            />

            <h2 className="text-[17px] font-bold text-ink">
              No published trip found
            </h2>

            <p className="mt-1 text-[13px] text-ink-secondary">
              Publish a trip before applying to marketplace
              orders.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-[16px] border border-border bg-white p-5">
              <label className="mb-2 block text-[12px] font-semibold text-ink">
                Select your trip
              </label>

              <div className="relative">
                <Calendar
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />

                <select
                  value={selectedTripId}
                  onChange={(event) =>
                    setSelectedTripId(event.target.value)
                  }
                  className="w-full appearance-none rounded-[10px] border border-border bg-white py-3 pl-9 pr-3 text-[13px] text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {trips.map((trip) => (
                    <option key={trip._id} value={trip._id}>
                      {trip.departureCity} →{' '}
                      {trip.destinationCity} ·{' '}
                      {formatDate(trip.travelDate)} ·{' '}
                      {trip.remainingCapacityKg} kg available
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center gap-2 rounded-[18px] border border-border bg-white p-10 text-ink-muted">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Finding matching orders…
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-border bg-white p-10 text-center">
                <Package
                  size={30}
                  className="mx-auto mb-3 text-ink-muted"
                />

                <h2 className="text-[17px] font-bold text-ink">
                  No matching public orders
                </h2>

                <p className="mt-1 text-[13px] text-ink-secondary">
                  There are currently no open orders matching
                  this trip.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {orders.map((order) => (
                  <MarketplaceOrderCard
                    key={order._id}
                    order={order}
                    selectedTripId={selectedTripId}
                    busyOrderId={busyOrderId}
                    onApply={handleApply}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}