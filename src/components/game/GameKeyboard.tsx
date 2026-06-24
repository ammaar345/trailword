import { cn } from '@/lib/utils';
import { BackspaceIcon, EnterIcon } from './icons';

export type KeyStatus = Record<string, 'correct' | 'present' | 'absent'>;

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

export default function GameKeyboard({ keyStatus, onKey, pressedKey }: GameKeyboardProps) {
  return (
    <div className="mx-auto flex max-w-[500px] flex-col gap-2">
      {ROWS.map((row, idx) => (
        <div key={idx} className="flex justify-center gap-1.5 sm:gap-2">
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

            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                style={statusStyle}
                className={cn(
                  // Base marshmallow shape
                  'key-marshmallow',
                  'flex items-center justify-center uppercase select-none',
                  isWide ? 'min-w-[62px] px-3 text-[12px]' : 'min-w-0 w-full max-w-[54px]',
                  'h-16 sm:h-[72px]',
                  // Default marshmallow color (no status)
                  !status && 'key-marshmallow-default',
                  // Pressed glow
                  isPressed && 'key-marshmallow-pressed',
                )}
                aria-label={key}
              >
                {key === 'BACKSPACE' ? (
                  <BackspaceIcon className="size-5" />
                ) : key === 'ENTER' ? (
                  <EnterIcon className="size-5" />
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
