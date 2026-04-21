import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import WinnerCard from '../WinnerCard.jsx';
import LoadingBar from '../LoadingBar.jsx';
import GiveawayPostImage from '../GiveawayPostImage.jsx';
import { pickRandomWinners } from '../../utils/commentParser.js';
import { postDetails } from '../../config/winners.js';

const STORAGE_KEYS = {
  winners: 'igCommentPicker_winners',
  step: 'igCommentPicker_step',
};

const STATS = [
  { key: 'likesCount', label: 'Likes', icon: '❤️' },
  { key: 'commentsCount', label: 'Comments', icon: '💬' },
  { key: 'repostsCount', label: 'Reposts', icon: '🔁' },
  { key: 'viewsCount', label: 'Views', icon: '👁️' },
];

function useCountUp(target, duration = 1400, startDelay = 0) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    let startTime = null;
    const delayId = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      clearTimeout(delayId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, startDelay]);

  return count;
}

function StatCard({ icon, label, target, delay }) {
  const count = useCountUp(target, 1400, delay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.4, ease: 'easeOut' }}
      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-border-grey bg-page-bg px-4 py-5 min-w-[110px]"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xl font-bold text-text-primary tabular-nums">
        {count.toLocaleString()}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </span>
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
};

function fireConfetti() {
  const defaults = { spread: 60, ticks: 80, gravity: 1.2, decay: 0.94, startVelocity: 30 };
  confetti({ ...defaults, particleCount: 40, origin: { x: 0.25, y: 0.6 } });
  confetti({ ...defaults, particleCount: 40, origin: { x: 0.75, y: 0.6 } });
}

export default function StepDetermineWinner({
  comments,
  winners,
  setWinners,
  onStartOver,
  giveawayPostDetails,
}) {
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingDone = useCallback(() => {
    setShowLoading(false);
    setTimeout(fireConfetti, 200);
  }, []);

  useEffect(() => {
    const id = setTimeout(handleLoadingDone, 2500);
    return () => clearTimeout(id);
  }, [handleLoadingDone]);

  const handlePickAgain = () => {
    const newWinners = pickRandomWinners(comments, winners?.length || 1);
    setWinners(newWinners);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEYS.winners, JSON.stringify(newWinners));
      window.sessionStorage.setItem(STORAGE_KEYS.step, '3');
    }
    fireConfetti();
  };

  if (showLoading) {
    return (
      <div className="rounded-2xl bg-card-white p-6 shadow-sm">
        <div className="text-center">
          <motion.h2
            className="text-lg font-semibold text-text-primary"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Analyzing your giveaway&hellip;
          </motion.h2>
          <motion.p
            className="mt-1 text-sm text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            Counting engagement before picking the lucky winners.
          </motion.p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.key}
              icon={stat.icon}
              label={stat.label}
              target={postDetails[stat.key] ?? 0}
              delay={200 + i * 250}
            />
          ))}
        </div>

        <div className="mt-6">
          <LoadingBar duration={2500} onComplete={handleLoadingDone} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Winners column */}
      <div className="rounded-2xl bg-card-white p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">
            Congratulations!
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Here are the winners selected from your giveaway.
          </p>
        </div>

        <motion.div
          className="mt-5 space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {winners?.map((winner, index) => (
            <motion.div
              key={`${winner.username}-${winner.rank}-${index}`}
              variants={cardVariants}
            >
              <WinnerCard winner={winner} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handlePickAgain}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] hover:bg-[#00A87A] hover:shadow-md"
          >
            Pick Again
          </button>
          <button
            type="button"
            onClick={onStartOver}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-border-grey bg-white px-5 py-3 text-sm font-semibold text-text-primary shadow-sm transition-all duration-150 hover:scale-[1.02] hover:bg-page-bg hover:shadow-md"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Static post preview (image URL from env, prop, or GiveawayPostImage fallback) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="self-start"
      >
        <GiveawayPostImage postDetails={giveawayPostDetails} />
      </motion.div>
    </div>
  );
}
