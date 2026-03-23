import React, { useMemo, useState } from 'react';
import { useInstagramScraper } from '../../hooks/useInstagramScraper.js';

const INSTAGRAM_POST_REGEX = /instagram\.com\/p\//i;

function getStatusLabel(status) {
  if (status === 'trying_playwright') {
    return 'Launching browser automation...';
  }
  if (status === 'trying_cors') {
    return 'Trying alternative scrape method...';
  }
  return 'SCAN';
}

export default function StepScanPost({
  postUrl,
  setPostUrl,
  setComments,
  setScrapeMethod,
  setCurrentStep,
  onError,
}) {
  const [localError, setLocalError] = useState(null);
  const { status, method, comments, error, fetchComments } =
    useInstagramScraper();

  const isLoading =
    status === 'trying_playwright' || status === 'trying_cors';

  const statusLabel = useMemo(
    () => getStatusLabel(status),
    [status]
  );

  const handleScan = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const url = postUrl.trim();
    // if (!url || !INSTAGRAM_POST_REGEX.test(url)) {
    //   setLocalError(
    //     'Please enter a valid Instagram post URL containing /p/.'
    //   );
    //   return;
    // }

    try {
      const fetched = await fetchComments(url);
      if (!Array.isArray(fetched) || fetched.length === 0) {
        throw new Error('No comments were returned from the scraper.');
      }

      setComments(fetched);
      setScrapeMethod(method || 'playwright');
      setCurrentStep(2);
    } catch (err) {
      const structuredError =
        err && err.type
          ? err
          : {
              type: 'ScrapingFailed',
              message:
                'Both scraping methods failed. Unable to fetch comments for this Instagram post.',
              suggestions: [
                'Make sure the Playwright server is running: cd scraper-server && npm install && npx playwright install chromium && npm start',
                'Ensure the Instagram post is public.',
                'Check your internet connection.',
                'Instagram may be rate-limiting requests — try again in a few minutes.',
              ],
            };
      onError(structuredError);
    }
  };

  return (
    <div className="fade-slide-enter fade-slide-enter-active rounded-2xl bg-card-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
          <div className="h-9 w-9 rounded-xl border-4 border-white" />
        </div>
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
          Free Instagram Comment Picker and Giveaways Tool
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Automatically collect comments from your public Instagram giveaway
          post and randomly pick fair winners in just a few clicks.
        </p>
      </div>

      <form
        onSubmit={handleScan}
        className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row"
      >
        <input
          type="url"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          placeholder="Enter Your Instagram Post Url"
          className="flex-1 rounded-full border border-border-grey px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:scale-[1.02] hover:bg-[#00A87A] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading && (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          <span className="mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </span>
          <span>{statusLabel}</span>
        </button>
      </form>

      {localError && (
        <p className="mt-3 text-xs text-error-red">{localError}</p>
      )}
      {error && !localError && (
        <p className="mt-3 text-xs text-error-red">
          {error.message ||
            'Something went wrong while fetching comments.'}
        </p>
      )}

      {comments?.length > 0 && (
        <p className="mt-4 text-xs text-text-secondary">
          Loaded <span className="font-semibold">{comments.length}</span>{' '}
          comments via{' '}
          <span className="font-semibold">
            {method === 'cors_proxy'
              ? 'CORS Proxy'
              : 'Browser Automation (Playwright)'}
          </span>
          .
        </p>
      )}
    </div>
  );
}

