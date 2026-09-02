import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { AuthNavbar } from '../AuthNavbar';
import { Button } from '../ui';

import {
  getAllDisputes,
  markDisputeUnderReview,
  resolveDispute,
} from '../../services/disputeService';

export function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDisputes() {
    try {
      setError('');

      const data = await getAllDisputes();
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

  useEffect(() => {
    loadDisputes();
  }, []);

  async function handleReview(id) {
    try {
      await markDisputeUnderReview(id);
      await loadDisputes();
    } catch (error) {
      window.alert(
        error.response?.data?.message ||
        'Could not update dispute.'
      );
    }
  }

  async function handleResolve(id) {
    const notes = window.prompt(
      'Enter resolution notes:'
    );

    if (!notes?.trim()) {
      return;
    }

    try {
      await resolveDispute(id, notes.trim());
      await loadDisputes();
    } catch (error) {
      window.alert(
        error.response?.data?.message ||
        'Could not resolve dispute.'
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[1100px] mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <p className="text-[13px] text-ink-muted">
            Administration
          </p>

          <h1 className="text-[30px] font-bold text-ink">
            Dispute Management
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
          <div className="bg-danger-light text-danger p-4 rounded-[12px]">
            {error}
          </div>
        ) : disputes.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-border bg-white p-10 text-center text-ink-muted">
            No disputes found.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {disputes.map((dispute) => (
              <div
                key={dispute._id}
                className="rounded-[16px] border border-border bg-white p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase font-bold text-ink-muted">
                      {dispute.reason.replaceAll('_', ' ')}
                    </p>

                    <p className="text-[15px] font-semibold text-ink">
                      {dispute.raisedBy?.name}
                    </p>

                    <p className="text-[13px] text-ink-secondary mt-1">
                      {dispute.description}
                    </p>

                    <p className="text-[12px] text-ink-muted mt-2 capitalize">
                      Status: {dispute.status.replaceAll('_', ' ')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {dispute.status === 'open' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleReview(dispute._id)
                        }
                      >
                        Mark Under Review
                      </Button>
                    )}

                    {dispute.status !== 'resolved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleResolve(dispute._id)
                        }
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
