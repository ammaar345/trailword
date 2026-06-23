import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="6" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
      <rect x="12" y="6" width="8" height="8" rx="2" fill="currentColor" opacity="0.8"/>
      <rect x="22" y="6" width="8" height="8" rx="2" fill="currentColor"/>
      <path d="M6 16v4a4 4 0 004 4h12a4 4 0 004-4v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 10v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function BayerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"/>
      <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"/>
    </svg>
  );
}

export function HalftoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="7" cy="7" r="3" fill="currentColor"/>
      <circle cx="17" cy="7" r="1.5" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.8"/>
      <circle cx="7" cy="17" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="17" cy="17" r="3" fill="currentColor"/>
    </svg>
  );
}

export function NoiseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="4" width="3" height="3" rx="0.5" fill="currentColor"/>
      <rect x="10" y="4" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5"/>
      <rect x="16" y="4" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
      <rect x="7" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
      <rect x="13" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.9"/>
      <rect x="4" y="16" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6"/>
      <rect x="10" y="16" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.2"/>
      <rect x="16" y="16" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}

export function CrosshatchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M6 4v16M12 4v16M18 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

export function GrayscaleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 4a8 8 0 000 16V4z" fill="currentColor"/>
    </svg>
  );
}

export function DuotoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 4a6 6 0 000 12V4z" fill="currentColor" opacity="0.7"/>
      <path d="M12 16a6 6 0 000-8v8z" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

export function PaletteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="9" r="1.5" fill="currentColor" opacity="0.6"/>
      <circle cx="12" cy="15" r="1.5" fill="currentColor" opacity="0.3"/>
      <path d="M16 12l4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.544 1.377.201 2.394.098 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
    </svg>
  );
}
