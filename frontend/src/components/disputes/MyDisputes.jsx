import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import { AuthNavbar } from '../AuthNavbar';
import { getMyDisputes } from '../../services/disputeService';

const STATUS = {
  open: {
    label: 'Open',
    className: 'bg-warning-light text-warning',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-info-light text-info',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-success-light text-success',
  },
};

const REASONS = {
  damaged_item: 'Damaged Item',
  payment_issue: 'Payment Issue',
  misconduct: 'Misconduct',
  other: 'Other',
};

export function MyDisputes() {
  const navigate = useNavigate();

  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDisputes() {
      try {
        const data = await getMyDisputes();
        setDisputes(data.disputes || []);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
          'Could not load disputes.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDisputes();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[1000px] mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <p className="text-[13px] text-ink-muted">
            Support & Safety
          </p>

          <h1 className="text-[30px] font-bold text-ink">
            My Disputes
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2
              size={24}
              className="animate-spin text-primary"
            />
          </div>
        ) : error ? (
          <div className="rounded-[14px] bg-danger-light p-5 text-danger">
            {error}
          </div>
        ) : disputes.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-border bg-white p-12 text-center">
            <AlertTriangle
              size={32}
              className="mx-auto mb-3 text-ink-muted"
            />

            <p className="font-semibold text-ink">
              No disputes
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {disputes.map((dispute) => {
              const status =
                STATUS[dispute.status] || STATUS.open;

              return (
                <button
                  key={dispute._id}
                  type="button"
                  onClick={() =>
                    navigate(`/disputes/${dispute._id}`)
                  }
                  className="text-left rounded-[16px] border border-border bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">
                        {REASONS[dispute.reason] ||
                          dispute.reason}
                      </p>

                      <p className="text-[16px] font-bold text-ink mt-1">
                        {dispute.order?.pickup?.city}
                        {' → '}
                        {dispute.order?.destination?.city}
                      </p>

                      <p className="text-[13px] text-ink-secondary mt-1">
                        {dispute.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>

                      <ChevronRight
                        size={16}
                        className="text-ink-muted"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
