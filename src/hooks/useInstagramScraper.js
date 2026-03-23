import { useCallback, useState } from 'react';
import {
  scrapeViaPlaywright,
  PlaywrightScrapingError,
  PlaywrightUnavailableError,
} from '../utils/playwrightBridge.js';
import {
  scrapeViaCorsProxy,
  CorsProxyNetworkError,
  CorsProxyScrapingError,
} from '../utils/corsProxyScraper.js';

const STORAGE_KEYS = {
  method: 'igCommentPicker_scrapeMethod',
  comments: 'igCommentPicker_comments',
};

function saveToSession(method, comments) {
  if (typeof window === 'undefined') return;
  if (method) window.sessionStorage.setItem(STORAGE_KEYS.method, method);
  if (comments)
    window.sessionStorage.setItem(
      STORAGE_KEYS.comments,
      JSON.stringify(comments)
    );
}

export function useInstagramScraper() {
  const [state, setState] = useState({
    status: 'idle',
    method: null,
    comments: [],
    error: null,
  });

  const fetchComments = useCallback(async (postUrl) => {
    setState((prev) => ({
      ...prev,
      status: 'trying_playwright',
      error: null,
    }));

    try {
      const comments = await scrapeViaPlaywright(postUrl);
      saveToSession('playwright', comments);
      setState({
        status: 'success',
        method: 'playwright',
        comments,
        error: null,
      });
      return comments;
    } catch (err) {
      if (
        err instanceof PlaywrightUnavailableError ||
        err instanceof PlaywrightScrapingError ||
        (err && (err.type === 'PlaywrightUnavailableError' || err.type === 'PlaywrightScrapingError'))
      ) {
        // fall through to CORS proxy
      } else {
        // unexpected error, still fall back
      }
    }

    setState((prev) => ({
      ...prev,
      status: 'trying_cors',
    }));

    try {
      const comments = await scrapeViaCorsProxy(postUrl);
      saveToSession('cors_proxy', comments);
      setState({
        status: 'success',
        method: 'cors_proxy',
        comments,
        error: null,
      });
      return comments;
    } catch (err) {
      const suggestions = [
        'Make sure the Playwright server is running: cd scraper-server && npm install && npx playwright install chromium && npm start',
        'Ensure the Instagram post is public and accessible without logging in.',
        'Check your internet connection.',
        'Instagram may be rate-limiting requests — try again in a few minutes.',
      ];

      let type = 'UnknownError';
      let message =
        'Both scraping methods failed. Unable to fetch comments for this post.';

      if (
        err instanceof CorsProxyNetworkError ||
        (err && err.type === 'CorsProxyNetworkError')
      ) {
        type = 'PlaywrightAndCorsProxyNetworkError';
        message =
          'Playwright could not be used and the CORS proxy request failed due to a network issue.';
      } else if (
        err instanceof CorsProxyScrapingError ||
        (err && err.type === 'CorsProxyScrapingError')
      ) {
        type = 'PlaywrightUnavailableAndCorsProxyScrapingError';
        message =
          'Playwright could not be used and the CORS proxy could not extract comments from the Instagram HTML.';
      }

      const error = {
        type,
        message,
        suggestions,
      };

      setState({
        status: 'error',
        method: null,
        comments: [],
        error,
      });

      throw error;
    }
  }, []);

  return {
    ...state,
    fetchComments,
  };
}

