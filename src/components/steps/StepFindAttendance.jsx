import React, { useState } from 'react';
import {
  filterByMinMentions,
  pickRandomWinners,
} from '../../utils/commentParser.js';

const STORAGE_KEYS = {
  winners: 'igCommentPicker_winners',
  step: 'igCommentPicker_step',
};

export default function StepFindAttendance({
  comments,
  scrapeMethod,
  setWinners,
  setCurrentStep,
}) {
  const [minMentions, setMinMentions] = useState(1);
  const [numWinners, setNumWinners] = useState(
    Math.min(3, Math.max(1, comments?.length || 1))
  );

  const totalComments = comments?.length || 0;

  const handleDetermine = () => {
    const filtered = filterByMinMentions(comments, Number(minMentions) || 0);
    const winners = pickRandomWinners(
      filtered,
      Math.min(Number(numWinners) || 1, filtered.length || 0)
    );

    setWinners(winners);

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        STORAGE_KEYS.winners,
        JSON.stringify(winners)
      );
      window.sessionStorage.setItem(STORAGE_KEYS.step, '3');
    }

    setCurrentStep(3);
  };

  const methodBadge =
    scrapeMethod === 'cors_proxy'
      ? '🌐 Scraped via CORS Proxy'
      : '🤖 Scraped via Browser Automation';

  const methodClass =
    scrapeMethod === 'cors_proxy'
      ? 'bg-warning-amber/10 text-warning-amber'
      : 'bg-primary/10 text-primary';

  return (
    <div className="fade-slide-enter fade-slide-enter-active grid gap-6 rounded-2xl bg-card-white p-6 shadow-sm sm:grid-cols-2">
      <div className="flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Set Sweepstakes Condition
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Review the number of collected comments and configure the minimum
            mention requirement for valid entries.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-border-grey bg-page-bg px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              💬
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Number of People Attending the Sweepstakes
              </p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {totalComments}
              </p>
            </div>
          </div>
          <span
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${methodClass}`}
          >
            {methodBadge}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Number of Minimum Mention
          </label>
          <input
            type="number"
            min={0}
            value={minMentions}
            onChange={(e) => setMinMentions(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-xl border border-border-grey px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Number of Winner
          </label>
          <input
            type="number"
            min={1}
            max={Math.max(1, totalComments)}
            value={numWinners}
            onChange={(e) =>
              setNumWinners(
                Math.min(
                  Math.max(1, Number(e.target.value) || 1),
                  Math.max(1, totalComments)
                )
              )
            }
            className="mt-1 w-full rounded-xl border border-border-grey px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
          <p className="mt-1 text-xs text-text-secondary">
            You can pick up to {totalComments || 1} winners based on the
            collected comments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetermine}
          disabled={!totalComments}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:scale-[1.02] hover:bg-[#00A87A] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Determine Winner
        </button>
      </div>
    </div>
  );
}

