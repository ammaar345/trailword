import { cn } from '@/lib/utils';
import { bayerPatternDataUri } from '@/lib/dither-pattern';

interface TileProps {
  letter?: string;
  status?: 'correct' | 'present' | 'absent' | 'empty' | 'filled';
  delay?: number;
  /** If true, tile glows softly — used on current typing row */
  active?: boolean;
}

const bayerBg = bayerPatternDataUri(2);

/** Maps status to CSS variable keys (with hardcoded fallbacks) */
const varMap: Record<string, { bg: string; border: string; text: string }> = {
  correct: { bg: 'var(--tile-correct-bg, #171717)', border: 'var(--tile-correct-border, #171717)', text: 'var(--tile-correct-text, #ffffff)' },
  present: { bg: 'var(--tile-present-bg, #525252)', border: 'var(--tile-present-border, #525252)', text: 'var(--tile-present-text, #ffffff)' },
  absent: { bg: 'var(--tile-absent-bg, #d4d4d4)', border: 'var(--tile-absent-border, #d4d4d4)', text: 'var(--tile-absent-text, #171717)' },
};

export default function Tile({ letter, status = 'empty', delay = 0, active = false }: TileProps) {
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

  return (
    <div
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
      )}
      style={tileStyle}
    >
      {showTexture && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: bayerBg, backgroundRepeat: 'repeat', backgroundSize: '6px 6px' }}
        />
      )}
      <span className="relative z-10 font-bold tracking-wider">
        {letter || ''}
      </span>
    </div>
  );
}
