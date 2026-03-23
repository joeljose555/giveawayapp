/**
 * playwrightScraper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Instagram comment scraper with a 3-tier strategy:
 *
 *  STRATEGY 1 (Best)  — Direct Instagram Private API calls with sessionid cookie
 *                        Uses cursor-based pagination to fetch ALL comments.
 *                        Fast, reliable, no browser needed.
 *
 *  STRATEGY 2         — Playwright browser automation (headless Chromium)
 *                        Intercepts GraphQL/API network responses while navigating.
 *                        Falls back to DOM extraction + scroll if network yields nothing.
 *
 *  STRATEGY 3 (Last)  — Playwright scroll & DOM text harvest
 *                        Expands the comment section and scrapes visible text.
 *                        Limited to what is visually rendered (~20–50 comments).
 *
 * When a sessionid is provided, Strategy 1 is always tried first and will
 * fetch every single comment via pagination before falling back to browser.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { chromium } = require('playwright');

// ─── Logging ─────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[Scraper] ${msg}`);
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

/**
 * Count @mentions in a comment string.
 */
function countMentions(text) {
  if (!text) return 0;
  const matches = text.match(/@[a-zA-Z0-9._]+/g);
  return matches ? matches.length : 0;
}

/**
 * Deduplicate by username (keep first occurrence) and attach mentionCount.
 * @param {Array<{username:string, comment:string}>} rawComments
 * @returns {Array<{username:string, comment:string, mentionCount:number}>}
 */
function normalizeComments(rawComments) {
  const seen = new Set();
  const result = [];

  for (const c of rawComments) {
    const username = (c.username || '').trim().replace(/^@/, '');
    const comment = (c.comment || c.text || '').trim();
    if (!username || !comment) continue;
    if (seen.has(username)) continue;
    seen.add(username);
    result.push({ username, comment, mentionCount: countMentions(comment) });
  }

  return result;
}

/**
 * Extract a shortcode from any Instagram post/reel/tv URL.
 * e.g. https://www.instagram.com/p/ABC123xyz/ → "ABC123xyz"
 */
function extractShortcode(url) {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Convert an Instagram shortcode to a numeric media ID.
 * Instagram uses a base-64-like encoding with a custom alphabet.
 */
function shortcodeToMediaId(shortcode) {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = BigInt(0);
  for (const char of shortcode) {
    id = id * BigInt(64) + BigInt(ALPHABET.indexOf(char));
  }
  return id.toString();
}

// ─── Strategy 1: Direct Instagram Private API (no browser) ────────────────────
//
// Instagram's internal mobile/web API endpoint:
//   GET https://i.instagram.com/api/v1/media/{mediaId}/comments/
//       ?can_support_threading=true
//       &permalink_enabled=false
//       &min_id={cursor}          ← pagination cursor for next page
//
// This API:
//   • Returns up to 20 comments per page
//   • Includes `next_min_id` in the response for the next page
//   • Works with a valid sessionid cookie (same one your browser uses)
//   • Does NOT require Playwright — just a regular HTTP fetch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the HTTP headers Instagram expects for its private API.
 * Without these headers the API returns 400 or redirects to login.
 */
function buildApiHeaders(sessionid, csrftoken) {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'X-IG-App-ID': '936619743392459',       // Instagram Web app ID (stable public value)
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://www.instagram.com/',
    'Origin': 'https://www.instagram.com',
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
  };

  // Build cookie header
  const cookieParts = [`sessionid=${sessionid}`];
  if (csrftoken) {
    cookieParts.push(`csrftoken=${csrftoken}`);
    headers['X-CSRFToken'] = csrftoken;
  }
  cookieParts.push('ig_did=1'); // minimal required cookie
  headers['Cookie'] = cookieParts.join('; ');

  return headers;
}

/**
 * Fetch ALL comments for a post using Instagram's paginated private API.
 *
 * @param {string} mediaId   - Numeric Instagram media ID
 * @param {string} sessionid - Valid Instagram sessionid cookie value
 * @param {string} [csrftoken]
 * @returns {Promise<Array<{username, comment}>>}
 */
async function fetchAllCommentsViaApi(mediaId, sessionid, csrftoken) {
  const allComments = [];
  let cursor = null;       // min_id for next page
  let pageCount = 0;
  const MAX_PAGES = 500;   // safety cap — 500 pages × 20 = up to 10,000 comments

  const headers = buildApiHeaders(sessionid, csrftoken);

  log(`Strategy 1: fetching comments via Instagram private API for media ${mediaId}`);

  while (pageCount < MAX_PAGES) {
    // Build the paginated URL
    const params = new URLSearchParams({
      can_support_threading: 'true',
      permalink_enabled: 'false',
    });
    if (cursor) {
      params.set('min_id', cursor);
    }

    const url = `https://i.instagram.com/api/v1/media/${mediaId}/comments/?${params}`;
    log(`  Page ${pageCount + 1}: GET ${url}`);

    let response;
    try {
      // Use node-fetch style (works in Node.js 18+ with global fetch, else falls back)
      const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
      response = await fetchFn(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(15000), // 15s per request
      });
    } catch (fetchErr) {
      throw new Error(`API fetch failed on page ${pageCount + 1}: ${fetchErr.message}`);
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        'Instagram API returned 401/403 — the sessionid cookie is invalid or expired. ' +
        'Please log into Instagram in Chrome, copy a fresh sessionid from ' +
        'DevTools → Application → Cookies → instagram.com, and update it in server.js.'
      );
    }

    if (response.status === 429) {
      throw new Error(
        'Instagram API rate limit hit (429). Wait 15–30 minutes before trying again.'
      );
    }

    if (!response.ok) {
      throw new Error(
        `Instagram API returned HTTP ${response.status} on page ${pageCount + 1}.`
      );
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Failed to parse JSON from Instagram API on page ${pageCount + 1}.`);
    }

    // Extract comments from this page
    // Instagram returns: { comments: [{pk, text, user: {username}, ...}], next_min_id, ... }
    const pageComments = data.comments || [];
    log(`  Page ${pageCount + 1}: got ${pageComments.length} comments`);

    for (const c of pageComments) {
      const username = c.user?.username || c.owner?.username;
      const text = c.text || '';
      if (username && text) {
        allComments.push({ username, comment: text });
      }
    }

    pageCount++;

    // Check for next page cursor
    // Instagram uses `next_min_id` for forward pagination
    const nextCursor = data.next_min_id || data.next_max_id || null;

    if (!nextCursor || pageComments.length === 0) {
      log(`  Pagination complete after ${pageCount} page(s). Total: ${allComments.length} comments.`);
      break;
    }

    cursor = nextCursor;

    // Polite delay between pages to avoid rate limiting (300–700ms)
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
  }

  if (pageCount >= MAX_PAGES) {
    log(`  Warning: hit MAX_PAGES cap (${MAX_PAGES}). Returning ${allComments.length} comments collected so far.`);
  }

  return allComments;
}

// ─── Strategy 2: Playwright network interception ──────────────────────────────
//
// Launch a real (headless) browser, inject session cookies, navigate to the
// post, and intercept all Instagram API/GraphQL JSON responses containing
// comment data. This catches both old GraphQL shapes and new API v1 shapes.
// ─────────────────────────────────────────────────────────────────────────────

const STEALTH_SCRIPT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US','en'] });
  const ua = navigator.userAgent;
  Object.defineProperty(navigator, 'userAgent', {
    get: () => ua.replace('HeadlessChrome', 'Chrome'),
  });
  if (!window.chrome) window.chrome = { runtime: {} };
`;

/**
 * Recursively walk any JSON object and extract Instagram comment data,
 * handling all known response shapes across API versions.
 */
function extractFromJson(obj, results = []) {
  if (!obj || typeof obj !== 'object') return results;

  // Shape 1 — GraphQL: edge_media_to_parent_comment / edge_media_to_comment
  for (const key of ['edge_media_to_comment', 'edge_media_to_parent_comment']) {
    if (obj[key]?.edges) {
      for (const edge of obj[key].edges) {
        const node = edge.node || {};
        const username = node.owner?.username || node.owner?.user?.username;
        const text = node.text || '';
        if (username && text) results.push({ username, comment: text });
      }
    }
  }

  // Shape 2 — API v1: { comments: [{user: {username}, text}] }
  if (Array.isArray(obj.comments)) {
    for (const c of obj.comments) {
      const username = c.user?.username || c.owner?.username;
      const text = c.text || '';
      if (username && text) results.push({ username, comment: text });
    }
  }

  // Shape 3 — xdt wrapper
  if (obj.xdt_api__v1__media__comments?.comments) {
    for (const c of obj.xdt_api__v1__media__comments.comments) {
      const username = c.user?.username;
      if (username && c.text) results.push({ username, comment: c.text });
    }
  }

  // Shape 4 — nested data wrapper
  if (obj.data?.xdt_shortcode_media) extractFromJson(obj.data.xdt_shortcode_media, results);
  if (obj.data?.shortcode_media) extractFromJson(obj.data.shortcode_media, results);

  // Recurse
  if (Array.isArray(obj)) {
    for (const item of obj) extractFromJson(item, results);
  } else {
    for (const key of Object.keys(obj)) {
      if (['__typename', 'src', 'config', 'rollout', 'define'].includes(key)) continue;
      try { extractFromJson(obj[key], results); } catch { /* skip */ }
    }
  }

  return results;
}

/**
 * Use Playwright to navigate to the post and intercept API comment responses.
 * Also tries DOM script tag extraction and scroll-based harvesting as fallbacks.
 */
async function scrapeViaPlaywright(postUrl, sessionid, csrftoken, scrollRounds = 6) {
  const networkComments = [];

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1920,1080',
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-US',
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    });

    // Inject session cookies if provided
    if (sessionid) {
      const cookies = [
        { name: 'sessionid', value: sessionid, domain: '.instagram.com', path: '/', httpOnly: true, secure: true },
      ];
      if (csrftoken) {
        cookies.push({ name: 'csrftoken', value: csrftoken, domain: '.instagram.com', path: '/', secure: true });
      }
      await context.addCookies(cookies);
    }

    const page = await context.newPage();
    await page.addInitScript(STEALTH_SCRIPT);

    // Intercept all Instagram API / GraphQL responses
    page.on('response', async (response) => {
      try {
        const url = response.url();
        const isRelevant =
          (url.includes('/api/v1/media/') && url.includes('/comments')) ||
          url.includes('graphql/query') ||
          url.includes('api/graphql');
        if (!isRelevant) return;

        const ct = response.headers()['content-type'] || '';
        if (!ct.includes('application/json') && !ct.includes('text/javascript')) return;

        const json = await response.json().catch(() => null);
        if (!json) return;

        const extracted = extractFromJson(json);
        if (extracted.length) {
          log(`  Playwright intercepted ${extracted.length} comments from: ${url.substring(0, 80)}...`);
          networkComments.push(...extracted);
        }
      } catch { /* swallow */ }
    });

    log('Strategy 2: launching Playwright browser...');
    try {
      await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (navErr) {
      log(`  Navigation warning: ${navErr.message} — continuing`);
    }

    await page.waitForTimeout(4000);

    // Check for login redirect
    const currentUrl = page.url();
    if (currentUrl.includes('/accounts/login') || currentUrl.includes('/challenge/')) {
      throw new Error(
        'Instagram requires login to view this post. ' +
        'Provide a valid sessionid cookie in server.js to proceed.'
      );
    }

    if (networkComments.length > 0) {
      log(`  Playwright network interception succeeded: ${networkComments.length} comments`);
      return networkComments;
    }

    // ── DOM extraction fallback ────────────────────────────────────────────
    log('  Network interception found 0. Trying DOM script tag extraction...');
    const domComments = await page.evaluate(() => {
      const results = [];
      function walk(obj) {
        if (!obj || typeof obj !== 'object') return;
        if (obj.edge_media_to_comment?.edges || obj.edge_media_to_parent_comment?.edges) {
          const edges = (obj.edge_media_to_comment || obj.edge_media_to_parent_comment).edges;
          for (const edge of edges) {
            const node = edge.node || {};
            const username = node.owner?.username;
            const text = node.text || '';
            if (username && text) results.push({ username, comment: text });
          }
        }
        if (Array.isArray(obj.comments)) {
          for (const c of obj.comments) {
            const username = c.user?.username;
            if (username && c.text) results.push({ username, comment: c.text });
          }
        }
        if (Array.isArray(obj)) {
          for (const item of obj) walk(item);
        } else {
          for (const key of Object.keys(obj)) {
            if (['__typename', 'src'].includes(key)) continue;
            try { walk(obj[key]); } catch { /* skip */ }
          }
        }
      }
      const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
      for (const s of scripts) {
        try { walk(JSON.parse(s.textContent || '{}')); } catch { /* skip */ }
      }
      for (const src of [window.__additionalData, window._sharedData].filter(Boolean)) {
        try { walk(src); } catch { /* skip */ }
      }
      return results;
    });

    if (domComments?.length > 0) {
      log(`  DOM extraction found ${domComments.length} comments`);
      return domComments;
    }

    // ── Scroll + text harvest fallback ────────────────────────────────────
    log(`  DOM extraction found 0. Trying scroll-based harvest (${scrollRounds} rounds)...`);

    try {
      await page.click('a[href*="/comments/"], span:has-text("View all")', { timeout: 3000 });
      await page.waitForTimeout(2000);
    } catch { /* no "view all" button — that's fine */ }

    const scrollComments = await page.evaluate(async (rounds) => {
      const collected = new Map();
      function harvest() {
        const selectors = ['ul li', 'article div > ul > li', 'div[role="presentation"] span'];
        for (const sel of selectors) {
          for (const el of Array.from(document.querySelectorAll(sel))) {
            const text = (el.innerText || el.textContent || '').trim();
            if (!text || text.length < 2) continue;
            const match = text.match(/^@?([a-zA-Z0-9._]{1,30})\s+(.+)/s);
            if (!match) continue;
            const username = match[1];
            const comment = match[2].replace(/\n.*/s, '').trim();
            if (!username || !comment) continue;
            const key = `${username}:${comment.slice(0, 40)}`;
            if (!collected.has(key)) collected.set(key, { username, comment });
          }
        }
      }
      harvest();
      for (let i = 0; i < rounds; i++) {
        window.scrollBy(0, window.innerHeight * 1.5);
        await new Promise((r) => setTimeout(r, 1200));
        harvest();
      }
      return Array.from(collected.values());
    }, scrollRounds);

    if (scrollComments?.length > 0) {
      log(`  Scroll harvest found ${scrollComments.length} comments`);
    } else {
      log(`  All Playwright methods returned 0 comments`);
      try {
        await page.screenshot({ path: 'debug_screenshot.png', fullPage: false });
        log('  Debug screenshot saved → debug_screenshot.png');
      } catch { /* ignore */ }
    }

    return scrollComments || [];

  } finally {
    await browser.close();
  }
}

// ─── Main exported function ───────────────────────────────────────────────────

/**
 * Scrape all comments from an Instagram post.
 *
 * Priority order:
 *   1. Instagram Private API (direct HTTP, cursor-paginated) — if sessionid provided
 *   2. Playwright browser automation (headless) — with session cookies if available
 *   3. Playwright scroll + DOM text harvest — last resort
 *
 * @param {string} postUrl
 * @param {object} [options]
 * @param {string} [options.sessionid]    Instagram sessionid cookie value
 * @param {string} [options.csrftoken]    Instagram csrftoken cookie value (optional)
 * @param {number} [options.scrollRounds] Scroll iterations for Method 3 (default 6)
 *
 * @returns {Promise<Array<{username:string, comment:string, mentionCount:number}>>}
 */
async function scrapeComments(postUrl, options = {}) {
  if (!postUrl || typeof postUrl !== 'string') {
    throw new Error('A valid Instagram post URL is required.');
  }

  const { sessionid, csrftoken, scrollRounds = 6 } = options;

  log(`\n${'─'.repeat(60)}`);
  log(`Post URL:         ${postUrl}`);
  log(`Session provided: ${!!sessionid}`);
  log(`${'─'.repeat(60)}`);

  const shortcode = extractShortcode(postUrl);
  if (!shortcode) {
    throw new Error(
      'Could not extract a shortcode from the URL. ' +
      'Expected format: https://www.instagram.com/p/{shortcode}/'
    );
  }

  const mediaId = shortcodeToMediaId(shortcode);
  log(`Shortcode: ${shortcode} → Media ID: ${mediaId}`);

  let rawComments = [];
  let strategyUsed = 'none';

  // ── Strategy 1: Direct API with pagination (only if sessionid provided) ──
  if (sessionid) {
    log('\n[Strategy 1] Direct Instagram Private API with cursor pagination...');
    try {
      rawComments = await fetchAllCommentsViaApi(mediaId, sessionid, csrftoken);
      if (rawComments.length > 0) {
        strategyUsed = 'private_api';
        log(`[Strategy 1] ✓ Success — ${rawComments.length} raw comments collected`);
      } else {
        log('[Strategy 1] ✗ API returned 0 comments — falling back to Strategy 2');
      }
    } catch (apiErr) {
      log(`[Strategy 1] ✗ Failed: ${apiErr.message}`);
      log('[Strategy 1] Falling back to Strategy 2 (Playwright)...');
    }
  } else {
    log('[Strategy 1] Skipped — no sessionid provided');
  }

  // ── Strategy 2 & 3: Playwright browser ───────────────────────────────────
  if (rawComments.length === 0) {
    log('\n[Strategy 2/3] Playwright browser automation...');
    try {
      rawComments = await scrapeViaPlaywright(postUrl, sessionid, csrftoken, scrollRounds);
      if (rawComments.length > 0) {
        strategyUsed = 'playwright';
        log(`[Strategy 2/3] ✓ Playwright collected ${rawComments.length} raw comments`);
      }
    } catch (pwErr) {
      log(`[Strategy 2/3] ✗ Playwright failed: ${pwErr.message}`);
      throw new Error(
        `All scraping strategies failed.\n\nPlaywright error: ${pwErr.message}\n\n` +
        'Suggestions:\n' +
        '  1. Ensure the post is public (open the URL in an incognito window to verify).\n' +
        '  2. Provide a valid sessionid cookie for authenticated access.\n' +
        '  3. Instagram may be rate-limiting — wait 15–30 minutes and try again.\n' +
        '  4. Check debug_screenshot.png in the scraper-server folder for clues.'
      );
    }
  }

  // ── Final check ───────────────────────────────────────────────────────────
  if (rawComments.length === 0) {
    throw new Error(
      'All scraping strategies returned 0 comments.\n\n' +
      'Possible causes:\n' +
      '  1. The post is private or comments are disabled.\n' +
      '  2. Your sessionid cookie has expired — get a fresh one from Chrome DevTools.\n' +
      '  3. Instagram is rate-limiting this IP — wait 15–30 minutes.\n' +
      '  4. Check debug_screenshot.png in the scraper-server folder.\n\n' +
      `Strategy attempted: ${sessionid ? 'Private API + Playwright' : 'Playwright only'}`
    );
  }

  const normalized = normalizeComments(rawComments);
  log(`\n✓ Done. Strategy: ${strategyUsed} | Raw: ${rawComments.length} | Unique: ${normalized.length}`);

  return normalized;
}

module.exports = { scrapeComments };
