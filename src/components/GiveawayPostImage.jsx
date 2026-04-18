import React, { useState } from 'react';
import fallbackImage from '../assets/giveaway-post.png';

function resolveSrc(imageUrlProp) {
  if (imageUrlProp) return imageUrlProp;
  const env = import.meta.env.VITE_GIVEAWAY_POST_IMAGE_URL;
  if (env) return env;
  return fallbackImage;
}

function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

export default function GiveawayPostImage({
  imageUrl: imageUrlProp,
  alt = 'Giveaway post preview',
  postDetails,
}) {
  const src = resolveSrc(imageUrlProp);
  const [imgFailed, setImgFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const DESCRIPTION_LIMIT = 120;
  const description = postDetails?.description || '';
  const isLong = description.length > DESCRIPTION_LIMIT;
  const displayedDescription = expanded || !isLong
    ? description
    : description.slice(0, DESCRIPTION_LIMIT) + '…';

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="overflow-hidden rounded-2xl border border-border-grey bg-white shadow-sm">

        {/* Post image */}
        {src && !imgFailed ? (
          <img
            src={src}
            alt={alt}
            className="aspect-[4/5] w-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex aspect-[4/5] w-full flex-col items-center justify-center bg-page-bg px-6 text-center">
            <p className="text-sm font-medium text-text-primary">No preview image</p>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Could not load the image. Check the URL and hosting settings.
            </p>
          </div>
        )}

        {postDetails && (
          <div className="px-4 pb-4 pt-3">
            {/* Stats row */}
            <div className="flex items-center gap-4 text-text-primary">
              <button type="button" className="flex items-center gap-1.5 transition hover:text-red-500">
                <HeartIcon />
              </button>
              <button type="button" className="flex items-center gap-1.5 transition hover:text-primary">
                <CommentIcon />
              </button>
              <button type="button" className="flex items-center gap-1.5 transition hover:text-primary">
                <ShareIcon />
              </button>
            </div>

            {/* Likes count */}
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {formatCount(postDetails.likesCount)} likes
            </p>

            {/* Author + description */}
            <p className="mt-1 text-sm text-text-primary leading-relaxed">
              <span className="font-semibold">@{postDetails.authorId}</span>
              {' '}
              <span className="text-text-secondary">{displayedDescription}</span>
              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="ml-1 text-text-secondary font-medium hover:text-text-primary"
                >
                  {expanded ? 'less' : 'more'}
                </button>
              )}
            </p>

            {/* Comments + Shares counts */}
            <div className="mt-2 flex items-center gap-4">
              <button type="button" className="text-xs text-text-secondary hover:text-text-primary transition">
                View all {formatCount(postDetails.commentsCount)} comments
              </button>
              <span className="text-xs text-text-secondary">
                {formatCount(postDetails.repostsCount)} shares
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
