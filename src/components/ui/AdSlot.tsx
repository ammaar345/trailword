'use client';
import { useEffect, useRef } from 'react';

/**
 * Google AdSense ad slot.
 *
 * To activate:
 * 1. Sign up at https://adsense.google.com (no traffic minimum)
 * 2. Add trailword.pages.dev as a site and wait for approval
 * 3. Set ADSENSE_CLIENT to your publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
 * 4. Create a display ad unit and set ADSENSE_SLOT to its slot ID
 *
 * Renders nothing until both IDs are set, so it is safe to ship disabled.
 * The AdSense loader script is injected once, on first mount.
 */
const ADSENSE_CLIENT = ''; // ca-pub-XXXXXXXXXXXXXXXX
const ADSENSE_SLOT = ''; // numeric slot id from the ad unit

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot() {
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT || pushed.current) return;
    pushed.current = true;

    if (!document.querySelector('script[data-adsense-loader]')) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-adsense-loader', 'true');
      document.head.appendChild(script);
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ad blocker or script failure — slot stays empty, game unaffected
    }
  }, []);

  if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return null;

  return (
    <ins
      className="adsbygoogle block w-full"
      style={{ display: 'block', minHeight: 90 }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={ADSENSE_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
