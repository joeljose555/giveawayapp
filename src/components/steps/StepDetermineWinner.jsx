import React, { useEffect, useState } from 'react';
import WinnerCard from '../WinnerCard.jsx';
import LoadingBar from '../LoadingBar.jsx';
import { pickRandomWinners } from '../../utils/commentParser.js';

const STORAGE_KEYS = {
  winners: 'igCommentPicker_winners',
  step: 'igCommentPicker_step',
};

export default function StepDetermineWinner({
  comments,
  winners,
  setWinners,
  onStartOver,
}) {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setShowLoading(false), 2500);
    return () => clearTimeout(id);
  }, []);

  const handlePickAgain = () => {
    const newWinners = pickRandomWinners(
      comments,
      winners?.length || 1
    );
    setWinners(newWinners);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        STORAGE_KEYS.winners,
        JSON.stringify(newWinners)
      );
      window.sessionStorage.setItem(STORAGE_KEYS.step, '3');
    }
  };

  if (showLoading) {
    return (
      <div className="fade-slide-enter fade-slide-enter-active rounded-2xl bg-card-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary">
          Winners are determining...
        </h2>
        <p className="mt-1 text-sm text-text-secondary">Please wait!</p>
        <LoadingBar duration={2500} onComplete={() => setShowLoading(false)} />
      </div>
    );
  }

  return (
    <div className="fade-slide-enter fade-slide-enter-active rounded-2xl bg-card-white p-6 shadow-sm">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary">
          Congratulations!
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Here are the winners selected from your giveaway.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {winners?.map((winner, index) => (
          <div
            key={`${winner.username}-${winner.rank}-${index}`}
            style={{
              transition: 'opacity 300ms ease, transform 300ms ease',
              transitionDelay: `${index * 150}ms`,
            }}
            className="opacity-100"
          >
            <WinnerCard winner={winner} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handlePickAgain}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:scale-[1.02] hover:bg-[#00A87A]"
        >
          Pick Again
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-border-grey bg-white px-5 py-3 text-sm font-semibold text-text-primary shadow-sm transition-transform duration-150 hover:scale-[1.02] hover:bg-page-bg"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

