import React, { useState } from 'react';

export default function WinnerCard({ winner }) {
  if (!winner) return null;
  const initial = (winner.username || '?')[0]?.toUpperCase?.() || '?';
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative flex gap-4 rounded-xl border-l-4 border-primary bg-card-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      {winner.avatarUrl && !imgError ? (
        <img
          src={winner.avatarUrl}
          alt={winner.username}
          className="h-12 w-12 rounded-full bg-page-bg object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-lg font-bold text-white">
          {initial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-primary">
          @{winner.username}
        </div>
        <div className="mt-1 line-clamp-2 text-sm text-text-secondary">
          {winner.comment}
        </div>
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        Winner #{winner.rank}
      </div>
    </div>
  );
}
