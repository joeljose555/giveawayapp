import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  filterByMinMentions,
  pickRandomWinners,
} from '../../utils/commentParser.js';
import { maxAttendees } from '../../config/config.js';

const STORAGE_KEYS = {
  winners: 'igCommentPicker_winners',
  step: 'igCommentPicker_step',
};

export default function StepFindAttendance({
  comments,
  setWinners,
  setCurrentStep,
  giveawayPostDetails,
}) {
  const loadedCommentsCount = comments?.length || 0;
  const attendanceDisplayCount =
    giveawayPostDetails?.commentsCount ?? loadedCommentsCount;

  const [minMentions, setMinMentions] = useState(0);
  const [numWinners, setNumWinners] = useState(
    Math.min(3, Math.max(1, loadedCommentsCount || 1), maxAttendees)
  );

  const totalComments = loadedCommentsCount;

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

  return (
    <div className="grid gap-6 rounded-2xl bg-card-white p-6 shadow-sm sm:grid-cols-2">
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

        <motion.div
          className="mt-6 rounded-2xl border border-border-grey bg-page-bg px-4 py-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-lg">
              💬
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Number of People Attending the Sweepstakes
              </p>
              <p className="mt-1 text-2xl font-bold text-text-primary tabular-nums">
                {attendanceDisplayCount.toLocaleString()}
              </p>
            </div>
          </div>
          {/* <span className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {giveawayPostDetails?.commentsCount != null
              ? `${loadedCommentsCount.toLocaleString()} loaded for winner draw`
              : 'Comments loaded'}
          </span> */}
        </motion.div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Minimum Mentions Required
          </label>
          <input
            type="number"
            min={0}
            value={minMentions}
            onChange={(e) => setMinMentions(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-xl border border-border-grey px-3 py-2 text-sm outline-none ring-primary/30 transition-shadow duration-200 focus:ring-2 focus:shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Number of Winners
          </label>
          <input
            type="number"
            min={1}
            max={Math.min(Math.max(1, totalComments), maxAttendees)}
            value={numWinners}
            onChange={(e) =>
              setNumWinners(
                Math.min(
                  Math.max(1, Number(e.target.value) || 1),
                  Math.max(1, totalComments),
                  maxAttendees
                )
              )
            }
            className="mt-1 w-full rounded-xl border border-border-grey px-3 py-2 text-sm outline-none ring-primary/30 transition-shadow duration-200 focus:ring-2 focus:shadow-sm"
          />
          <p className="mt-1 text-xs text-text-secondary">
            You can pick up to {Math.min(totalComments || 1, maxAttendees)} winners.{' '}
            <span className="text-primary font-medium">Max allowed: {maxAttendees}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetermine}
          disabled={!totalComments}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] hover:bg-[#00A87A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        >
          Determine Winner
        </button>
      </div>
    </div>
  );
}
