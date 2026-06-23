import { useState } from 'react';
import { DitherShader } from '@/components/ui/dither-shader';
import { BayerIcon, HalftoneIcon, NoiseIcon, CrosshatchIcon, GrayscaleIcon, DuotoneIcon, PaletteIcon, ShareIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type DitherMode = 'bayer' | 'halftone' | 'noise' | 'crosshatch';
type ColorMode = 'grayscale' | 'duotone' | 'custom' | 'original';

const DITHER_MODES: { key: DitherMode; label: string; icon: typeof BayerIcon }[] = [
  { key: 'bayer', label: 'Bayer', icon: BayerIcon },
  { key: 'halftone', label: 'Halftone', icon: HalftoneIcon },
  { key: 'noise', label: 'Noise', icon: NoiseIcon },
  { key: 'crosshatch', label: 'Crosshatch', icon: CrosshatchIcon },
];

const COLOR_MODES: { key: ColorMode; label: string; icon: typeof GrayscaleIcon }[] = [
  { key: 'grayscale', label: 'Grayscale', icon: GrayscaleIcon },
  { key: 'duotone', label: 'Duotone', icon: DuotoneIcon },
  { key: 'original', label: 'Original', icon: PaletteIcon },
];

const IMAGES = [
  { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2670&auto=format&fit=crop', label: 'Mountain' },
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop', label: 'River' },
  { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2670&auto=format&fit=crop', label: 'Ocean' },
];

export default function DitherShaderDemo() {
  const [ditherMode, setDitherMode] = useState<DitherMode>('bayer');
  const [colorMode, setColorMode] = useState<ColorMode>('grayscale');
  const [imageIndex, setImageIndex] = useState(0);
  const [gridSize, setGridSize] = useState(3);
  const [animated, setAnimated] = useState(false);

  const currentImage = IMAGES[imageIndex];

  return (
    <div className="space-y-8">
      {/* Shader card */}
      <div className="overflow-hidden rounded-3xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-xl shadow-surface-200/50 dark:shadow-black/30">
        <div className="relative">
          <DitherShader
            src={currentImage.url}
            key={`${currentImage.url}-${ditherMode}-${colorMode}-${gridSize}`}
            gridSize={gridSize}
            ditherMode={ditherMode}
            colorMode={colorMode}
            animated={animated}
            animationSpeed={0.02}
            className="h-80 w-full sm:h-[32rem]"
          />
          {/* Overlay label */}
          <span className="absolute bottom-3 left-3 rounded-xl bg-black/60 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
            {currentImage.label} &middot; {ditherMode} &middot; {colorMode}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        {/* Dither mode */}
        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-widest text-surface-400 dark:text-surface-500 uppercase">Pattern</legend>
          <div className="flex flex-wrap gap-2">
            {DITHER_MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setDitherMode(key)}
                className={cn(
                  'flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all',
                  ditherMode === key
                    ? 'border-surface-400 dark:border-surface-500 bg-surface-200 dark:bg-surface-800 text-surface-800 dark:text-surface-200 shadow-sm'
                    : 'border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Color mode */}
        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-widest text-surface-400 dark:text-surface-500 uppercase">Color</legend>
          <div className="flex flex-wrap gap-2">
            {COLOR_MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setColorMode(key)}
                className={cn(
                  'flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all',
                  colorMode === key
                    ? 'border-surface-400 dark:border-surface-500 bg-surface-200 dark:bg-surface-800 text-surface-800 dark:text-surface-200 shadow-sm'
                    : 'border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Slider row */}
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 text-sm text-surface-500 dark:text-surface-400">
            <span className="font-medium">Grid</span>
            <input
              type="range"
              min="1"
              max="8"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-surface-200 dark:bg-surface-800 accent-surface-600 dark:accent-surface-400"
            />
            <span className="tabular-nums">{gridSize}px</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <input
              type="checkbox"
              checked={animated}
              onChange={() => setAnimated((p) => !p)}
              className="size-4 rounded border-surface-300 dark:border-surface-700 accent-surface-600 dark:accent-surface-400"
            />
            Animate
          </label>

          {/* Image cycle */}
          <div className="flex items-center gap-2">
            {IMAGES.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setImageIndex(i)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                  i === imageIndex
                    ? 'bg-surface-200 dark:bg-surface-800 text-surface-800 dark:text-surface-200'
                    : 'text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300',
                )}
              >
                {img.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const canvas = document.querySelector('canvas');
              if (canvas) {
                const link = document.createElement('a');
                link.download = `trailword-${ditherMode}-${colorMode}.png`;
                link.href = canvas.toDataURL();
                link.click();
              }
            }}
            className="ml-auto flex items-center gap-2 rounded-2xl border border-surface-200 dark:border-surface-800 px-4 py-2.5 text-sm text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition"
          >
            <ShareIcon className="size-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
