import { memo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { BackspaceIcon, EnterIcon } from './icons';

export type KeyStatus = Record<string, 'correct' | 'present' | 'absent'>;

const SWIPE_THRESHOLD = 30;

interface GameKeyboardProps {
  keyStatus: KeyStatus;
  onKey: (key: string) => void;
  pressedKey?: string;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

function GameKeyboard({ keyStatus, onKey, pressedKey }: GameKeyboardProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return;

    if (absDx > absDy) {
      // Horizontal swipe
      onKey(dx > 0 ? 'ENTER' : 'BACKSPACE');
    } else {
      // Vertical swipe
      onKey(dy > 0 ? 'ENTER' : 'BACKSPACE');
    }
  };

  return (
    <div
      role="group"
      aria-label="On-screen keyboard"
      className="mx-auto flex max-w-[500px] flex-col gap-1.5"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {ROWS.map((row, idx) => (
        <div key={idx} className={cn('flex justify-center gap-1.5 sm:gap-2', idx === 1 && 'pl-4 sm:pl-5', idx === 2 && 'pl-8 sm:pl-10')}>
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            const status = keyStatus[key];
            const isPressed = pressedKey === key;

            let statusStyle: React.CSSProperties | undefined;
            if (status === 'correct') {
              statusStyle = {
                backgroundColor: 'var(--key-correct-bg)',
                color: 'var(--key-correct-text)',
                borderColor: 'var(--key-correct-border)',
              };
            } else if (status === 'present') {
              statusStyle = {
                backgroundColor: 'var(--key-present-bg)',
                color: 'var(--key-present-text)',
                borderColor: 'var(--key-present-border)',
              };
            } else if (status === 'absent') {
              statusStyle = {
                backgroundColor: 'var(--key-absent-bg)',
                color: 'var(--key-absent-text)',
                borderColor: 'var(--key-absent-border)',
                textDecoration: 'line-through',
                textDecorationColor: 'var(--key-absent-text)',
                opacity: 0.65,
              };
            }

            const ariaLabel =
              key === 'ENTER' ? 'Submit guess' :
              key === 'BACKSPACE' ? 'Delete letter' :
              `Letter ${key}`;

            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                style={statusStyle}
                className={cn(
                  // Base marshmallow shape
                  'key-marshmallow',
                  'flex items-center justify-center uppercase select-none',
                  isWide ? 'min-w-[52px] sm:min-w-[62px] px-2 sm:px-3 text-[12px]' : 'min-w-0 w-full max-w-[54px]',
                  'h-14 sm:h-16',
                  // Default marshmallow color (no status)
                  !status && 'key-marshmallow-default',
                  // Pressed glow
                  isPressed && 'key-marshmallow-pressed',
                  // Visible focus ring for keyboard navigation
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-950 focus-visible:ring-surface-500',
                )}
                aria-label={ariaLabel}
                aria-pressed={status ? true : undefined}
              >
                {key === 'BACKSPACE' ? (
                  <BackspaceIcon className="size-5" aria-hidden="true" />
                ) : key === 'ENTER' ? (
                  <EnterIcon className="size-5" aria-hidden="true" />
                ) : (
                  key
                )}
            </button>
            );
          })}
      </div>
      ))}
  </div>
  );
}

export default memo(GameKeyboard);
