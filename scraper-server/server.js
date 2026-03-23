const express = require('express');
const cors = require('cors');
const { scrapeComments } = require('./playwrightScraper');

const app = express();
const PORT = 3001;

app.use(express.json({ limit: '1mb' }));

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'OPTIONS'],
  })
);

app.post('/scrape', async (req, res) => {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid "url" in request body.',
    });
  }

  console.log('[Playwright] Incoming scrape request for URL:', url);

  try {
    const comments = await scrapeComments(url, {
      sessionid: "2131459030%3A6FzjcElHS1curU%3A7%3AAYiexSAB_EvREzWqVjZUffrza9iaLAPD_QsXY56Nhw"
    });    console.log(
      `[Playwright] Successfully scraped ${comments.length} comments from ${url}`
    );
    return res.json({
      success: true,
      comments,
    });
  } catch (err) {
    console.error(
      '[Playwright] Error while scraping:',
      err && err.stack ? err.stack : err
    );
    return res.status(500).json({
      success: false,
      error:
        err && err.message
          ? err.message
          : 'Unknown scraping error occurred in Playwright.',
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
  });
});

app.listen(PORT, () => {
  console.log(
    `[Playwright] Instagram scraper server listening on http://localhost:${PORT}`
  );
});

