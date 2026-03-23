import React from 'react';

export default function ErrorScreen({ error, onTryAgain, postUrl }) {
  const suggestions = error?.suggestions || [];

  return (
    <div className="mt-6 rounded-2xl border border-error-red/20 bg-red-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-red/10 text-error-red">
          !
        </div>
        <div>
          <h2 className="text-lg font-semibold text-error-red">
            Unable to Fetch Comments
          </h2>
          {error?.type && (
            <p className="text-xs font-medium uppercase tracking-wide text-error-red/80">
              {error.type}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-text-primary">
        {error?.message ||
          'Something went wrong while trying to load comments for this Instagram post.'}
      </p>

      {postUrl && (
        <p className="mt-2 rounded-md bg-white px-3 py-2 text-xs text-text-secondary">
          URL: <span className="break-all">{postUrl}</span>
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-text-primary">
            Suggestions:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-text-secondary">
            {suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onTryAgain}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:scale-[1.02] hover:bg-[#00A87A]"
      >
        Try Again
      </button>
    </div>
  );
}

