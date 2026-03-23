import React, { useEffect } from 'react';

export default function LoadingBar({ duration = 2500, onComplete }) {
  useEffect(() => {
    if (!duration || !onComplete) return;
    const id = setTimeout(onComplete, duration);
    return () => clearTimeout(id);
  }, [duration, onComplete]);

  return (
    <div className="mt-4 w-full overflow-hidden rounded-full bg-green-100">
      <div
        className="striped-loading-bar h-3 w-full rounded-full bg-primary"
        style={{ animationDuration: '1s' }}
      />
    </div>
  );
}

