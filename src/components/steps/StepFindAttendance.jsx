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
  const [numWinners, setNumWinners] = useState(0);

  const totalComments = loadedCommentsCount;

  const handleDetermine = () => {
    const filtered = filterByMinMentions(comments, Number(minMentions) || 0);
    const winnerCount = Math.min(
      Math.max(0, Number(numWinners) || 0),
      filtered.length
    );
    const winners = pickRandomWinners(filtered, winnerCount);

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
    <div className="space-y-6">
      <h2 className="text-center text-xl font-semibold text-text-primary">
        Set Sweepstakes Condition
      </h2>

      <div className="grid gap-6 rounded-2xl bg-card-white p-6 shadow-sm sm:grid-cols-2">
        <motion.div
          className="flex flex-col items-center justify-center rounded-2xl bg-gray-100 px-4 py-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <div className="mb-3 flex h-16 w-16 items-center justify-center">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
              <path
                d="M52 16H12C9.79086 16 8 17.7909 8 20V40C8 42.2091 9.79086 44 12 44H20L26 52L32 44H52C54.2091 44 56 42.2091 56 40V20C56 17.7909 54.2091 16 52 16Z"
                fill="#00C896"
              />
              <circle cx="22" cy="30" r="3" fill="white" />
              <circle cx="32" cy="30" r="3" fill="white" />
              <circle cx="42" cy="30" r="3" fill="white" />
            </svg>
          </div>
          <p className="text-center text-xs font-medium text-text-secondary">
            Number of People Attending the Sweepstakes
          </p>
          <p className="mt-2 text-4xl font-bold text-text-primary tabular-nums">
            {attendanceDisplayCount.toLocaleString()}
          </p>
        </motion.div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary">
              Number of Minimum Mention
            </label>
            <input
              type="number"
              min={0}
              value={minMentions}
              onChange={(e) => setMinMentions(Number(e.target.value) || 0)}
              className="mt-2 w-full rounded-xl border border-border-grey px-4 py-2.5 text-center text-sm outline-none ring-primary/30 transition-shadow duration-200 focus:ring-2 focus:shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary">
              Number of Winner
            </label>
            <input
              type="number"
              min={0}
              max={totalComments > 0 ? totalComments : maxAttendees}
              value={numWinners}
              onChange={(e) => {
                const raw = Number(e.target.value);
                const v = Number.isFinite(raw) ? raw : 0;
                const cap = totalComments > 0 ? totalComments : maxAttendees;
                setNumWinners(Math.min(Math.max(0, v), cap));
              }}
              className="mt-2 w-full rounded-xl border border-border-grey px-4 py-2.5 text-center text-sm outline-none ring-primary/30 transition-shadow duration-200 focus:ring-2 focus:shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleDetermine}
            disabled={!totalComments || numWinners < 1}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] hover:bg-[#00A87A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            Find Winners
          </button>
        </div>
      </div>
    </div>
  );
}
