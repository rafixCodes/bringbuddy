import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { AuthNavbar } from '../AuthNavbar';
import { getDisputeById } from '../../services/disputeService';

export function DisputeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDispute() {
      try {
        const data = await getDisputeById(id);
        setDispute(data.dispute);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
          'Unable to load dispute.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDispute();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavbar />

        <div className="pt-40 flex justify-center">
          <Loader2
            size={26}
            className="animate-spin text-primary"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[850px] mx-auto px-6 pt-28 pb-20">
        <button
          type="button"
          onClick={() => navigate('/disputes/my')}
          className="flex items-center gap-2 text-[13px] text-ink-muted mb-6"
        >
          <ArrowLeft size={15} />
          My Disputes
        </button>

        {error || !dispute ? (
          <div className="rounded-[14px] bg-danger-light p-5 text-danger">
            {error || 'Dispute not found.'}
          </div>
        ) : (
          <div className="rounded-[18px] border border-border bg-white p-6">
            <div className="flex justify-between gap-4 mb-6">
              <div>
                <p className="text-[12px] text-ink-muted">
                  Dispute
                </p>

                <h1 className="text-[25px] font-bold text-ink capitalize">
                  {dispute.reason.replaceAll('_', ' ')}
                </h1>
              </div>

              <span className="text-[12px] font-semibold text-primary capitalize">
                {dispute.status.replaceAll('_', ' ')}
              </span>
            </div>

            <div className="mb-5">
              <p className="text-[12px] text-ink-muted">
                Route
              </p>

              <p className="font-semibold text-ink">
                {dispute.order?.pickup?.city}
                {' → '}
                {dispute.order?.destination?.city}
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[12px] text-ink-muted">
                Description
              </p>

              <p className="text-[14px] text-ink-secondary">
                {dispute.description}
              </p>
            </div>

            {dispute.evidenceUrls?.length > 0 && (
              <div className="mb-5">
                <p className="text-[12px] text-ink-muted mb-1">
                  Evidence
                </p>

                {dispute.evidenceUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-primary hover:underline"
                  >
                    {url}
                  </a>
                ))}
              </div>
            )}

            {dispute.status === 'resolved' && (
              <div className="rounded-[14px] bg-success-light p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2
                    size={17}
                    className="text-success"
                  />

                  <p className="font-semibold text-ink">
                    Resolution
                  </p>
                </div>

                <p className="text-[13px] text-ink-secondary">
                  {dispute.adminNotes ||
                    'This dispute has been resolved.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
