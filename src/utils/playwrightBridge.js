export class PlaywrightUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PlaywrightUnavailableError';
    this.type = 'PlaywrightUnavailableError';
  }
}

export class PlaywrightScrapingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PlaywrightScrapingError';
    this.type = 'PlaywrightScrapingError';
  }
}

export async function scrapeViaPlaywright(postUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch('http://localhost:3001/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: postUrl }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new PlaywrightScrapingError(
        data.error || `Playwright server returned HTTP ${res.status}`
      );
    }

    return data.comments || [];
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new PlaywrightUnavailableError(
        'Playwright server did not respond within 60 seconds.'
      );
    }

    if (
      err instanceof PlaywrightScrapingError ||
      (err && err.type === 'PlaywrightScrapingError')
    ) {
      throw err;
    }

    throw new PlaywrightUnavailableError(
      'Unable to reach Playwright scraper server at http://localhost:3001.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

