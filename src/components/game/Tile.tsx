import { memo } from 'react';
import { cn } from '@/lib/utils';
import { bayerPatternDataUri } from '@/lib/dither-pattern';

interface TileProps {
  letter?: string;
  status?: 'correct' | 'present' | 'absent' | 'empty' | 'filled';
  delay?: number;
  /** If true, tile glows softly — used on current typing row */
  active?: boolean;
  /** If true, tile bounces (winning row) */
  win?: boolean;
}

const bayerBg = bayerPatternDataUri(2);

/** Maps status to CSS variable keys (with hardcoded fallbacks) */
const varMap: Record<string, { bg: string; border: string; text: string }> = {
  correct: { bg: 'var(--tile-correct-bg, #171717)', border: 'var(--tile-correct-border, #171717)', text: 'var(--tile-correct-text, #ffffff)' },
  present: { bg: 'var(--tile-present-bg, #525252)', border: 'var(--tile-present-border, #525252)', text: 'var(--tile-present-text, #ffffff)' },
  absent: { bg: 'var(--tile-absent-bg, #d4d4d4)', border: 'var(--tile-absent-border, #d4d4d4)', text: 'var(--tile-absent-text, #171717)' },
};

function Tile({ letter, status = 'empty', delay = 0, active = false, win = false }: TileProps) {
  const v = varMap[status];
  const showTexture = status === 'correct' || status === 'present' || status === 'absent';
  const isFilled = status === 'filled';
  const isEmpty = status === 'empty';

  const tileStyle: React.CSSProperties = {
    animationDelay: `${delay}ms`,
    animationDuration: '400ms',
  };
  if (v) {
    tileStyle.backgroundColor = v.bg;
    tileStyle.borderColor = v.border;
    tileStyle.color = v.text;
  }
  if (win) {
    // shorthand set last so it overrides the flip delay/duration above
    tileStyle.animation = `win-bounce 480ms ease ${delay}ms`;
  }

  // Screen-reader label describes tile state — reads "Letter E, not in word" etc.
  const ariaLabel = (() => {
    if (isEmpty) return 'empty';
    if (isFilled && letter) return `Letter ${letter.toUpperCase()}`;
    if (letter) {
      const verdict =
        status === 'correct' ? 'in the right place' :
        status === 'present' ? 'in the word, wrong place' :
        'not in the word';
      return `Letter ${letter.toUpperCase()}, ${verdict}`;
    }
    return '';
  })();

  return (
    <div
      role="gridcell"
      aria-label={ariaLabel}
      className={cn(
        'tile-marshmallow',
        'relative flex aspect-square items-center justify-center text-xl font-bold uppercase select-none overflow-hidden',
        'md:text-2xl',
        'transition-all duration-100',
        isEmpty && 'tile-marshmallow-empty',
        isFilled && 'tile-marshmallow-filled',
        showTexture && 'tile-marshmallow-status animate-flip shadow-sm',
        active && isFilled && 'animate-[glow_1.2s_ease-in-out_infinite]',
        active && 'hover:scale-[1.04] hover:z-10',
        status !== 'empty' && status !== 'filled' && `tile-status-${status}`,
      )}
      style={tileStyle}
    >
      {showTexture && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: bayerBg, backgroundRepeat: 'repeat', backgroundSize: '6px 6px' }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 font-bold tracking-wider" aria-hidden="true">
        {letter || ''}
     </span>
   </div>
  );
}

export default memo(Tile);
