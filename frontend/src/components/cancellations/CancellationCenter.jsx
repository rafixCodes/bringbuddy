import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Loader2,
  Package,
  RefreshCw,
  RotateCcw,
  XCircle,
} from 'lucide-react'

import { AuthNavbar } from '../AuthNavbar'
import { Button } from '../ui'
import { useAuth } from '../../context/AuthContext'
import {
  getMyCancellationOrders,
  cancelOrder,
  recoverOrder,
} from '../../services/cancellationService'

const CANCELLABLE = [
  'created',
  'pending',
  'accepted',
  'payment_held',
  'pickup_scheduled',
]

function getId(value) {
  return String(value?._id || value || '')
}

function label(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function CancellationCenter() {
  const { user } = useAuth()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const userId = getId(user)

  async function load() {
    try {
      setLoading(true)
      setError('')

      const data = await getMyCancellationOrders()
      setOrders(data.orders || [])
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not load orders.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCancel(orderId) {
    if (reason.trim().length < 5) {
      setError('Enter a reason containing at least 5 characters.')
      return
    }

    try {
      setBusyId(orderId)
      setError('')

      const data = await cancelOrder(
        orderId,
        reason.trim()
      )

      setMessage(data.message)
      setSelectedId('')
      setReason('')
      await load()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Cancellation failed.'
      )
    } finally {
      setBusyId('')
    }
  }

  async function handleRecovery(orderId, action) {
    try {
      setBusyId(orderId)
      setError('')

      const data = await recoverOrder(orderId, action)

      setMessage(data.message)
      await load()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Recovery action failed.'
      )
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="mx-auto max-w-[960px] px-6 pb-20 pt-28">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-danger">
              Feature 16
            </p>

            <h1 className="text-[30px] font-bold text-ink">
              Cancellation & Recovery
            </h1>

            <p className="mt-1 text-[14px] text-ink-secondary">
              Cancel eligible orders or recover from traveler cancellation.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={load}
            disabled={loading}
            leadingIcon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
        </div>

        <div className="mb-5 flex gap-3 rounded-[14px] border border-warning/30 bg-warning-light p-4">
          <AlertTriangle
            size={18}
            className="shrink-0 text-warning"
          />

          <p className="text-[12px] text-ink-secondary">
            Cancellation is blocked after collection. Traveler
            cancellation restores capacity and affects trust.
          </p>
        </div>

        {message && (
          <p className="mb-4 rounded-[10px] bg-success-light p-3 text-[13px] text-success">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-[10px] bg-danger-light p-3 text-[13px] text-danger">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center rounded-[18px] border border-border bg-white p-12">
            <Loader2
              size={24}
              className="animate-spin text-primary"
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-border bg-white p-12 text-center">
            <Package
              size={28}
              className="mx-auto mb-3 text-ink-muted"
            />
            <p className="font-bold text-ink">
              No eligible orders
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const isSender =
                getId(order.sender) === userId

              const isTraveler =
                getId(order.traveler) === userId

              const awaitingRecovery =
                isSender &&
                order.cancellation?.recoveryStatus ===
                  'awaiting_sender'

              const canCancel =
                CANCELLABLE.includes(order.status) &&
                (isSender || isTraveler) &&
                !awaitingRecovery

              return (
                <article
                  key={order._id}
                  className="rounded-[18px] border border-border bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                        {order.orderType === 'parcel'
                          ? 'Parcel'
                          : 'Shopping request'}
                      </p>

                      <h2 className="mt-1 text-[17px] font-bold text-ink">
                        {order.pickup?.city} →{' '}
                        {order.destination?.city}
                      </h2>

                      <p className="mt-1 text-[12px] text-ink-muted">
                        Traveler:{' '}
                        {order.traveler?.name ||
                          order.cancellation
                            ?.originalTraveler?.name ||
                          'Not assigned'}
                      </p>
                    </div>

                    <span className="rounded-full bg-divider px-3 py-1 text-[11px] font-semibold">
                      {label(order.status)}
                    </span>
                  </div>

                  {order.cancellation?.reason && (
                    <div className="mt-4 rounded-[10px] bg-danger-light p-3">
                      <p className="text-[12px] font-semibold text-danger">
                        {order.cancellation.reason}
                      </p>

                      <p className="mt-1 text-[11px] text-ink-muted">
                        Cancelled by{' '}
                        {order.cancellation.cancelledByRole}
                        {order.cancellation.capacityRestored
                          ? ' · Capacity restored'
                          : ''}
                      </p>
                    </div>
                  )}

                  {selectedId === order._id ? (
                    <div className="mt-4 border-t border-border pt-4">
                      <textarea
                        value={reason}
                        onChange={(event) =>
                          setReason(event.target.value)
                        }
                        maxLength={500}
                        rows={3}
                        placeholder="Cancellation reason..."
                        className="w-full rounded-[9px] border border-border p-3 text-[13px] outline-none focus:border-danger"
                      />

                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="danger"
                          size="md"
                          disabled={busyId === order._id}
                          onClick={() =>
                            handleCancel(order._id)
                          }
                        >
                          Confirm
                        </Button>

                        <Button
                          variant="ghost"
                          size="md"
                          onClick={() => {
                            setSelectedId('')
                            setReason('')
                          }}
                        >
                          Keep order
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                      {canCancel && (
                        <Button
                          variant="danger"
                          size="md"
                          leadingIcon={<XCircle size={14} />}
                          onClick={() =>
                            setSelectedId(order._id)
                          }
                        >
                          Cancel order
                        </Button>
                      )}

                      {awaitingRecovery && (
                        <>
                          <Button
                            variant="primary"
                            size="md"
                            disabled={busyId === order._id}
                            leadingIcon={
                              <RotateCcw size={14} />
                            }
                            onClick={() =>
                              handleRecovery(
                                order._id,
                                'repost'
                              )
                            }
                          >
                            Repost order
                          </Button>

                          <Button
                            variant="danger"
                            size="md"
                            disabled={busyId === order._id}
                            onClick={() =>
                              handleRecovery(
                                order._id,
                                'cancel'
                              )
                            }
                          >
                            Close permanently
                          </Button>
                        </>
                      )}

                      {!canCancel && !awaitingRecovery && (
                        <p className="text-[12px] text-ink-muted">
                          No action currently required.
                        </p>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
