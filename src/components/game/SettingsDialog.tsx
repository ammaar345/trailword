import { cn } from '@/lib/utils';

type ContrastVariant = 'medium' | 'high' | 'soft' | 'dark' | 'colorblind';
type FontSize = 'sm' | 'md' | 'lg';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onSoundToggle: (v: boolean) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  contrast: ContrastVariant;
  onContrastChange: (v: ContrastVariant) => void;
  reducedMotion: boolean;
  onReducedMotionToggle: (v: boolean) => void;
  fontSize: FontSize;
  onFontSizeChange: (v: FontSize) => void;
  hintsPurchased?: boolean;
  onActivateHints?: () => void;
}

const CONTRAST_OPTIONS: { value: ContrastVariant; label: string; colors: [string, string, string] }[] = [
  { value: 'medium', label: 'Medium', colors: ['#171717', '#525252', '#d4d4d4'] },
  { value: 'high', label: 'High', colors: ['#000000', '#333333', '#999999'] },
  { value: 'soft', label: 'Soft', colors: ['#666666', '#999999', '#e5e5e5'] },
  { value: 'dark', label: 'Dark', colors: ['#0a0a0a', '#2a2a2a', '#555555'] },
  { value: 'colorblind', label: 'Colorblind', colors: ['#3b82f6', '#f59e0b', '#d4d4d4'] },
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export type { ContrastVariant, FontSize };

export default function SettingsDialog({
  open,
  onClose,
  soundEnabled,
  onSoundToggle,
  volume,
  onVolumeChange,
  contrast,
  onContrastChange,
  reducedMotion,
  onReducedMotionToggle,
  fontSize,
  onFontSizeChange,
  hintsPurchased = false,
  onActivateHints,
}: SettingsDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-2xl">
        <h2 className="mb-5 text-center text-lg font-display">Settings</h2>

        {/* Sound toggle */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-display">Sound effects</span>
            <button
              onClick={() => onSoundToggle(!soundEnabled)}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                soundEnabled ? 'bg-surface-900 dark:bg-surface-100' : 'bg-surface-300 dark:bg-surface-700',
              )}
              aria-label="Toggle sound effects"
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-surface-900 shadow transition-transform',
                  soundEnabled ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          {soundEnabled && (
            <div className="flex items-center gap-3 pl-1">
              <span className="text-xs text-surface-400">Volume</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-200 dark:bg-surface-800 accent-surface-900 dark:accent-surface-100"
                aria-label="Volume"
              />
              <span className="w-8 text-right text-xs text-surface-400">{Math.round(volume * 100)}</span>
            </div>
          )}
        </div>

        {/* Contrast selector */}
        <div className="mb-6">
          <span className="mb-2 block text-sm font-display">Contrast</span>
          <div className="grid grid-cols-4 gap-2">
            {CONTRAST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onContrastChange(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition',
                  contrast === opt.value
                    ? 'border-surface-900 dark:border-surface-100 bg-surface-100 dark:bg-surface-800'
                    : 'border-transparent hover:bg-surface-100 dark:hover:bg-surface-800',
                )}
                aria-label={opt.label}
              >
                <div className="flex gap-0.5">
                  {opt.colors.map((c, i) => (
                    <div
                      key={i}
                      className="h-4 w-3 rounded-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-surface-500">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="mb-5">
          <span className="mb-2 block text-sm font-display">Font size</span>
          <div className="flex gap-2">
            {FONT_SIZES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFontSizeChange(opt.value)}
                className={cn(
                  'flex-1 rounded-xl border-2 py-2 text-sm font-display transition',
                  fontSize === opt.value
                    ? 'border-surface-900 dark:border-surface-100 bg-surface-100 dark:bg-surface-800'
                    : 'border-transparent hover:bg-surface-100 dark:hover:bg-surface-800',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reduced motion */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-display">Reduced motion</span>
            <button
              onClick={() => onReducedMotionToggle(!reducedMotion)}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                reducedMotion ? 'bg-surface-900 dark:bg-surface-100' : 'bg-surface-300 dark:bg-surface-700',
              )}
              aria-label="Toggle reduced motion"
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-surface-900 shadow transition-transform',
                  reducedMotion ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </div>
          <p className="mt-1 text-[11px] text-surface-400 font-sans">Disable flip animations and transitions</p>
        </div>

        {/* Hint packs */}
        {!hintsPurchased && onActivateHints && (
          <div className="mb-5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
              Purchased hint packs? Click below to activate unlimited hints.
            </p>
            <button
              onClick={onActivateHints}
              className="w-full rounded-lg bg-amber-500 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition"
            >
              I've purchased — activate hints
            </button>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full rounded-xl border border-surface-200 dark:border-surface-800 py-2.5 text-sm font-display hover:bg-surface-100 dark:hover:bg-surface-800 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
