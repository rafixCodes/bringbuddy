import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { AuthNavbar } from '../AuthNavbar';
import { Button } from '../ui';
import { createDispute } from '../../services/disputeService';

export function RaiseDispute() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [reason, setReason] = useState('damaged_item');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!description.trim()) {
      setError('Please describe the problem.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await createDispute({
        orderId,
        reason,
        description: description.trim(),
        evidenceUrls: evidenceUrl.trim()
          ? [evidenceUrl.trim()]
          : [],
      });

      navigate('/disputes/my');
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        'Failed to raise dispute.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <main className="max-w-[760px] mx-auto px-6 pt-28 pb-20">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink mb-6"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[12px] bg-danger-light flex items-center justify-center">
              <AlertTriangle size={20} className="text-danger" />
            </div>

            <div>
              <h1 className="text-[28px] font-bold text-ink">
                Raise a Dispute
              </h1>

              <p className="text-[12px] text-ink-muted">
                Order {orderId}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[18px] border border-border bg-white p-6 flex flex-col gap-6"
        >
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-2">
              Problem type
            </label>

            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-[10px] border border-border px-4 py-3"
            >
              <option value="damaged_item">Damaged item</option>
              <option value="payment_issue">Payment issue</option>
              <option value="misconduct">Misconduct</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-ink mb-2">
              Description
            </label>

            <textarea
              rows={6}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Explain what happened..."
              className="w-full rounded-[10px] border border-border px-4 py-3 resize-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-ink mb-2">
              Evidence URL (optional)
            </label>

            <input
              type="url"
              value={evidenceUrl}
              onChange={(event) =>
                setEvidenceUrl(event.target.value)
              }
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-[10px] border border-border px-4 py-3"
            />
          </div>

          {error && (
            <div className="rounded-[10px] bg-danger-light p-3 text-[13px] text-danger">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </form>
      </main>
    </div>
  );
}
