## Instagram Giveaway Comment Picker

Single-page React web application for picking random winners from an Instagram giveaway post using either a local Playwright bridge or a CORS proxy–based HTML scraper. All state is managed in-memory and persisted via `sessionStorage` in the browser.

### 1. Prerequisites

- Node.js 18+ recommended
- npm

### 2. Install and Run the Playwright Scraper Server

The scraper server is a **local-only** Express app that exposes a `/scrape` endpoint backed by Playwright.

From the project root:

```bash
cd scraper-server
npm install
npx playwright install chromium
npm start
```

This starts the scraper server on `http://localhost:3001`.

### 3. Install and Run the React App

From the project root:

```bash
npm install
npm run dev
```

This starts the React app (Vite) on `http://localhost:3000`.

Both the React app and the scraper server should be running simultaneously for full functionality. The frontend will first attempt to fetch comments via the Playwright bridge and fall back to a CORS proxy HTML scrape if the bridge is unavailable.

### 4. How Scraping Works

1. **Playwright (Primary Method)**  
   - The frontend calls `http://localhost:3001/scrape` via a small bridge utility.  
   - The server launches headless Chromium and tries multiple strategies:
     - Network interception of Instagram GraphQL responses.
     - Parsing embedded JSON in `<script type="application/json">` tags.
     - Scrolling the page and scraping visible comment elements from the DOM.
   - Results are normalized to `{ username, comment, mentionCount }`.

2. **CORS Proxy Fallback**  
   - If the Playwright bridge is unreachable or scraping fails, the frontend fetches the raw HTML via `https://corsproxy.io/?<encoded-post-url>`.  
   - It parses embedded JSON from `<script type="application/json">` tags and extracts the same normalized comment format.

If both methods fail, the app shows an error screen and **does not** fall back to any mock/demo data.

### 5. Using the App

1. Open `http://localhost:3000` in your browser.
2. **Step 1 – Scan Sweepstakes Post**
   - Enter a valid public Instagram post URL that contains `instagram.com/p/`.
   - Click **SCAN**.  
   - The app first tries **Playwright browser automation**, then falls back to the **CORS proxy** method if needed.
3. **Step 2 – Find Attendance**
   - See the total number of collected comments.
   - Configure:
     - **Number of Minimum Mention** (minimum `@username` mentions in a comment).
     - **Number of Winner**.
   - Click **Determine Winner** to filter and randomly select winners.
4. **Step 3 – Determine Winner**
   - Watch the loading state as winners are “determined”.
   - View the list of winners in styled winner cards.
   - Use **Pick Again** to reshuffle winners from the same comment pool.
   - Use **Start Over** to clear session state and return to Step 1.

### 6. Session Storage Schema

The app persists state in `sessionStorage` using the following keys:

```json
{
  "igCommentPicker_url": "https://www.instagram.com/p/...",
  "igCommentPicker_scrapeMethod": "playwright | cors_proxy",
  "igCommentPicker_comments": "[{\"username\":\"u1\",\"comment\":\"text\",\"mentionCount\":1}]",
  "igCommentPicker_winners": "[{\"username\":\"u1\",\"comment\":\"text\",\"rank\":1}]",
  "igCommentPicker_step": "3"
}
```

### 7. Important Notes & Limitations

- Instagram posts **must be public**; private or restricted accounts cannot be scraped.
- Instagram may **rate-limit or block scraping**, especially under heavy use. If scraping fails, wait a few minutes and try again.
- If only the React app is running, the CORS proxy fallback will be attempted automatically, but this can also fail if Instagram blocks or changes its HTML structure.
- There is **no remote backend** and **no use of the official Instagram API**; everything runs locally using scraping only.

