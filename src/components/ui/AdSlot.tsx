'use client';
import { useEffect, useRef } from 'react';

/**
 * Google AdSense ad slot.
 *
 * The loader script lives in index.html <head> (needed on first paint for
 * AdSense approval + verification). This component only registers the unit
 * by pushing to the adsbygoogle queue on mount. Renders nothing while the
 * IDs are empty, so it is safe to ship disabled.
 */
const ADSENSE_CLIENT = 'ca-pub-4302153561917574';
const ADSENSE_SLOT = '6526378886';

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
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ad blocker or loader not ready — slot stays empty, game unaffected
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
