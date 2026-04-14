import React, { useState } from 'react';
import fallbackImage from '../assets/giveaway-post.png';

/**
 * Static preview for the giveaway post (screenshot-style), loaded from any image URL.
 * Set `VITE_GIVEAWAY_POST_IMAGE_URL` in `.env` or pass `imageUrl` to override the default asset.
 */
function resolveSrc(imageUrlProp) {
  if (imageUrlProp) return imageUrlProp;
  const env = import.meta.env.VITE_GIVEAWAY_POST_IMAGE_URL;
  if (env) return env;
  return fallbackImage;
}

export default function GiveawayPostImage({ imageUrl: imageUrlProp, alt = 'Giveaway post preview' }) {
  const src = resolveSrc(imageUrlProp);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="mx-auto w-full max-w-[400px]">
        <div className="flex aspect-[9/16] max-h-[min(520px,70vh)] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border-grey bg-page-bg px-6 text-center">
          <p className="text-sm font-medium text-text-primary">No preview image</p>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            {'Could not load the image. Check the URL and CORS/hosting settings.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="overflow-hidden rounded-2xl border border-border-grey bg-white shadow-sm">
        <img
          src={src}
          alt={alt}
          className="aspect-[9/16] max-h-[min(520px,70vh)] w-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  );
}
