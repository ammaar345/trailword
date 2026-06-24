'use client';
import { useEffect, useRef } from 'react';

/**
 * Carbon Ads embed component.
 *
 * To activate:
 * 1. Sign up at https://carbonads.net
 * 2. Get your script URL (looks like: //cdn.carbonads.com/carbon.js?serve=...&placement=...)
 * 3. Update CARBON_SCRIPT_SRC below with your URL
 */
const CARBON_SCRIPT_SRC = ''; // Set this to your Carbon Ads script URL

export default function CarbonAds() {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!CARBON_SCRIPT_SRC || loaded.current) return;
    loaded.current = true;

    const script = document.createElement('script');
    script.src = CARBON_SCRIPT_SRC;
    script.async = true;
    script.type = 'text/javascript';
    script.id = '_carbonads_js';
    ref.current?.appendChild(script);
  }, []);

  if (!CARBON_SCRIPT_SRC) return null;

  return (
    <div
      ref={ref}
      className="min-w-[130px] min-h-[100px] flex items-center justify-center"
    />
  );
}
