import { LogoIcon, MoonIcon, SunIcon } from '@/components/ui/icons';
import Game from '@/components/game/Game';
import AdSlot from '@/components/ui/AdSlot';
import sounds from '@/lib/sounds';

interface GamePageProps {
  dark: boolean;
  onToggleDark: () => void;
}

export default function GamePage({ dark, onToggleDark }: GamePageProps) {
  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100 font-sans transition-colors">
      {/* Header */}
      <header className="marshmallow-header sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="size-7 text-surface-600 dark:text-surface-400" />
            <span className="text-lg font-display tracking-wide">TrailWord</span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="/demo"
              onClick={() => sounds.play('click')}
              className="rounded-lg px-3 py-1.5 text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition"
            >
              Dither
            </a>
            <button
              onClick={() => { sounds.play('click'); onToggleDark(); }}
              className="rounded-lg p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition"
              aria-label="Toggle theme"
            >
              {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Game */}
      <main className="pt-4">
        <Game />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 mt-12">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <AdSlot />
          <div className="flex items-center justify-between text-xs text-surface-400">
            <span>TrailWord &copy; {new Date().getFullYear()}</span>
            <div className="flex items-center gap-3">
              <a href="/privacy.html" className="hover:text-surface-600 dark:hover:text-surface-300 transition">
                Privacy
              </a>
              <a href="/game/" className="hover:text-surface-600 dark:hover:text-surface-300 transition">
                Classic version
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
