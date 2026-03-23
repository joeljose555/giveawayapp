import { normalizeComments } from './commentParser.js';

export class CorsProxyScrapingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CorsProxyScrapingError';
    this.type = 'CorsProxyScrapingError';
  }
}

export class CorsProxyNetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CorsProxyNetworkError';
    this.type = 'CorsProxyNetworkError';
  }
}

export async function scrapeViaCorsProxy(postUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const proxiedUrl =
      'https://corsproxy.io/?' + encodeURIComponent(postUrl || '');

    const res = await fetch(proxiedUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new CorsProxyNetworkError(
        `CORS proxy responded with HTTP ${res.status}`
      );
    }

    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const scripts = Array.from(
      doc.querySelectorAll('script[type="application/json"]')
    );

    const rawComments = [];

    const walk = (obj) => {
      if (!obj || typeof obj !== 'object') return;

      if (obj.edge_media_to_comment && obj.edge_media_to_comment.edges) {
        for (const edge of obj.edge_media_to_comment.edges) {
          const node = edge.node || {};
          const username = node.owner?.username || node.owner?.user?.username;
          const text = node.text || node.caption || '';
          if (username && text) {
            rawComments.push({ username, comment: text });
          }
        }
      }

      if (Array.isArray(obj)) {
        for (const item of obj) walk(item);
      } else {
        for (const key of Object.keys(obj)) {
          walk(obj[key]);
        }
      }
    };

    for (const script of scripts) {
      try {
        const json = JSON.parse(script.textContent || '{}');
        walk(json);
      } catch {
        // ignore parse errors
      }
    }

    const normalized = normalizeComments(rawComments);

    if (!normalized.length) {
      throw new CorsProxyScrapingError(
        'Unable to extract comments from Instagram HTML via CORS proxy.'
      );
    }

    return normalized;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new CorsProxyNetworkError(
        'CORS proxy request timed out after 30 seconds.'
      );
    }

    if (
      err instanceof CorsProxyScrapingError ||
      (err && err.type === 'CorsProxyScrapingError') ||
      err instanceof CorsProxyNetworkError ||
      (err && err.type === 'CorsProxyNetworkError')
    ) {
      throw err;
    }

    throw new CorsProxyNetworkError(
      'Network error while fetching Instagram HTML via CORS proxy.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

