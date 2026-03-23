import React, { useMemo, useState } from 'react';

function parseInstagramUrl(url) {
  if (!url) return null;
  const match = url.match(
    /instagram\.com\/(?:[\w.]+\/)?(?:p|reel)\/([\w-]+)/i
  );
  if (!match) return null;
  const shortcode = match[1];
  const type = url.includes('/reel/') ? 'reel' : 'p';
  return `https://www.instagram.com/${type}/${shortcode}/embed/`;
}

export default function InstagramEmbed({ url }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const embedUrl = useMemo(() => parseInstagramUrl(url), [url]);

  if (!embedUrl) return null;

  if (errored) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border-grey bg-page-bg p-6 text-center">
        <p className="text-sm text-text-secondary">
          Could not load post preview.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-sm font-medium text-primary underline"
        >
          View on Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-grey bg-white">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-page-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      <iframe
        src={embedUrl}
        title="Instagram post preview"
        className="w-full border-0"
        style={{ minHeight: 480 }}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        loading="lazy"
        allowTransparency
      />
    </div>
  );
}
