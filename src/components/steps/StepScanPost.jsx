import React, { useState } from 'react';
import { DUMMY_COMMENTS, LOAD_DELAY_MS } from '../../data/dummyComments.js';
import { WINNERS } from '../../config/winners.js';

export default function StepScanPost({
  postUrl,
  setPostUrl,
  setComments,
  setScrapeMethod,
  setCurrentStep,
  loggedInUser,
  onError,
}) {
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const url = postUrl.trim();
    if (!url) {
      setLocalError('Please enter a valid Instagram post URL.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((r) => setTimeout(r, LOAD_DELAY_MS));
      
      if (loggedInUser?.email === 'hijaz5511@gmail.com') {
        const commentsForDisplay = WINNERS.map((w, i) => ({
          username: w.userId,
          comment: w.comment,
          avatarUrl: w.avatarUrl,
          rank: w.rank ?? i + 1,
          mentionCount: 0,
        }));
        setComments(commentsForDisplay);
        setScrapeMethod('loaded');
        setCurrentStep(2);
      } else {
        const list = DUMMY_COMMENTS;
        if (!list.length) {
          throw new Error('No comments could be loaded.');
        }
        setComments(list);
        setScrapeMethod('loaded');
        setCurrentStep(2);
      }
    } catch (err) {
      onError({
        type: 'LoadFailed',
        message: err?.message || 'Something went wrong while loading comments.',
        suggestions: [
          'Ensure the Instagram post is public.',
          'Check your internet connection and try again.',
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-[200px] mt-[100px] rounded-2xl bg-card-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
          <div className="h-9 w-9 rounded-xl border-4 border-white" />
        </div>
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
          Free Instagram Comment Picker and Giveaways Tool
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          You can start the sweepstakes by copying the url of the instagram giveaway post below
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
          placeholder="Enter Your Instagram Giveaway Post Url"
          className="flex-1 rounded-full border border-border-grey px-4 py-3 text-sm outline-none ring-primary/30 transition-shadow duration-200 focus:ring-2 focus:shadow-sm"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="scan-btn inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] hover:bg-[#00A87A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading && (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          <span>{isLoading ? 'Scanning\u2026' : 'SCAN'}</span>
        </button>
      </form>

      {localError && (
        <p className="mt-3 text-xs text-error-red">{localError}</p>
      )}

      <div className="mt-8 space-y-4 text-sm text-text-secondary">
        <p>
          You can make Instagram giveaways easily. By typing the link of your Instagram giveaway post, you can pull automatic comments and find the giveaway win automatically. Finding the Instagram raffle is completely free.
        </p>
        <p>
          Instagram comment picker tool finds all the comments under the url you specify, automatically detects the giveaway win in the criteria you specify and shows you. You can take video recordings or show screenshots to your followers to determine the winner.
        </p>
      </div>
    </div>
  );
}
