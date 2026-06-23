import { useState } from 'react';
import GamePage from '@/pages/GamePage';
import DitherShaderDemo from '@/components/dither-shader-demo';
import { LogoIcon, MoonIcon, SunIcon, GithubIcon } from '@/components/ui/icons';

export default function App() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState<'game' | 'demo'>('game');

  if (page === 'demo') {
    return (
      <div className={dark ? 'dark' : ''}>
        <div className="min-h-screen bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100 font-sans transition-colors">
          <header className="sticky top-0 z-50 border-b border-surface-200 dark:border-surface-800 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-lg">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
              <button onClick={() => setPage('game')} className="flex items-center gap-3 font-medium">
                <LogoIcon className="size-8 text-surface-700 dark:text-surface-300" />
                <span className="text-lg font-display tracking-wide">TrailWord</span>
              </button>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl p-2.5 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-800 transition"
                  aria-label="GitHub"
                >
                  <GithubIcon className="size-5" />
                </a>
                <button
                  onClick={() => setDark(!dark)}
                  className="rounded-xl p-2.5 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-800 transition"
                  aria-label="Toggle theme"
                >
                  {dark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
                </button>
              </div>
            </div>
          </header>

          <section className="mx-auto max-w-5xl px-4 pt-20 pb-12 text-center sm:px-8">
            <span className="inline-block rounded-full border border-surface-300 dark:border-surface-700 bg-surface-200/50 dark:bg-surface-800/50 px-4 py-1 text-sm text-surface-600 dark:text-surface-300">
              Image dithering in real-time
            </span>
            <h1 className="mt-6 text-5xl font-medium tracking-tight sm:text-7xl">
              Dither{' '}
              <span className="font-serif italic text-surface-400 dark:text-surface-500">anything</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-surface-500 dark:text-surface-400">
              Canvas-based dither shader in pure React. Bayer, halftone, noise,
              crosshatch — all rendered in browser.
            </p>
          </section>

          <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-8">
            <DitherShaderDemo />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <GamePage dark={dark} onToggleDark={() => setDark(!dark)} />
    </div>
  );
}
