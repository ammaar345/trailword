'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard, { type TileStatus } from './GameBoard';
import GameKeyboard, { type KeyStatus } from './GameKeyboard';
import StatsDialog from './StatsDialog';
import SettingsDialog, { type ContrastVariant } from './SettingsDialog';
import { cn } from '@/lib/utils';
import { isAllowedGuess } from '@/lib/swear';
import { getDailyPuzzle, getRandomPuzzle, type DailyPuzzle } from '@/lib/daily';
import { loadStats, saveStats, recordWin, recordLoss, type GameStats, defaultStats } from '@/lib/stats';
import sounds from '@/lib/sounds';
import { ShareIcon, HintIcon, SettingsGearIcon } from './icons';
import { TrophyIcon } from './icons';

const ROW_COUNT = 6;
const COL_COUNT = 5;

interface Row {
  letters: string[];
  statuses?: TileStatus[];
}

export default function Game() {
  const [puzzle, setPuzzle] = useState<DailyPuzzle>(getDailyPuzzle);
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: ROW_COUNT }, () => ({ letters: [] as string[] })),
  );
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [freeHintUsed, setFreeHintUsed] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<KeyStatus>({});
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [animating, setAnimating] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Physical key sync
  const [pressedKey, setPressedKey] = useState<string>('');
  const pressedKeyTimer = useRef<number | null>(null);

  // Settings state — persisted to localStorage
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try { const p = JSON.parse(localStorage.getItem('trailword:prefs') || '{}'); return p.soundEnabled ?? true; } catch { return true; }
  });
  const [volume, setVolume] = useState<number>(() => {
    try { const p = JSON.parse(localStorage.getItem('trailword:prefs') || '{}'); return p.volume ?? 0.25; } catch { return 0.25; }
  });
  const [contrast, setContrast] = useState<ContrastVariant>(() => {
    try { const p = JSON.parse(localStorage.getItem('trailword:prefs') || '{}'); return p.contrast ?? 'medium'; } catch { return 'medium'; }
  });

  // Sync sound settings
  const soundEnabledRef = useRef(soundEnabled);
  const volumeRef = useRef(volume);
  soundEnabledRef.current = soundEnabled;
  volumeRef.current = volume;

  useEffect(() => { sounds.enabled = soundEnabled; }, [soundEnabled]);
  useEffect(() => { sounds.volume = volume; }, [volume]);

  // Persist preferences to localStorage
  useEffect(() => {
    localStorage.setItem('trailword:prefs', JSON.stringify({ soundEnabled, volume, contrast }));
  }, [soundEnabled, volume, contrast]);

  const today = puzzle.day;

  // Show stats if returning after solving
  useEffect(() => {
    if (stats.lastPlayed === today && (stats.wins > 0 || stats.losses > 0)) {
      setShowStats(true);
    }
  }, [stats, today]);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  }, []);

  const startNewGame = useCallback((newMode: 'daily' | 'practice') => {
    setPuzzle(newMode === 'practice' ? getRandomPuzzle() : getDailyPuzzle());
    setMode(newMode);
    setRows(Array.from({ length: ROW_COUNT }, () => ({ letters: [] as string[] })));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameOver(false);
    setSolved(false);
    setMessage('');
    setFreeHintUsed(false);
    setKeyStatus({});
    setAnimating(false);
  }, []);

  const scoreGuess = useCallback(
    (guess: string, answer: string): TileStatus[] => {
      const result: TileStatus[] = Array(COL_COUNT).fill('absent');
      const remaining = answer.split('');

      for (let i = 0; i < COL_COUNT; i++) {
        if (guess[i] === answer[i]) {
          result[i] = 'correct';
          remaining[i] = '';
        }
      }

      for (let i = 0; i < COL_COUNT; i++) {
        if (result[i] !== 'correct') {
          const found = remaining.indexOf(guess[i]);
          if (found !== -1) {
            result[i] = 'present';
            remaining[found] = '';
          }
        }
      }

      return result;
    },
    [],
  );

  const commitGuess = useCallback(
    (guess: string) => {
      const result = scoreGuess(guess, puzzle.answer);
      const newRows = [...rows];
      newRows[currentRow] = {
        letters: guess.split(''),
        statuses: result,
      };
      setRows(newRows);
      setCurrentGuess('');

      const newKeyStatus = { ...keyStatus };
      const rank = (s: string) => (s === 'correct' ? 3 : s === 'present' ? 2 : 1);
      for (let i = 0; i < COL_COUNT; i++) {
        const letter = guess[i];
        if (!newKeyStatus[letter] || rank(result[i]) > rank(newKeyStatus[letter])) {
          newKeyStatus[letter] = result[i];
        }
      }
      setKeyStatus(newKeyStatus);

      return result;
    },
    [rows, currentRow, keyStatus, scoreGuess, puzzle.answer],
  );

  const handleSubmit = useCallback(() => {
    if (gameOver || animating) return;
    const guess = currentGuess.toLowerCase().trim();
    if (guess.length !== COL_COUNT) {
      sounds.play('click');
      showMessage('Not enough letters');
      return;
    }
    if (!isAllowedGuess(guess)) {
      sounds.play('click');
      showMessage('Invalid word');
      return;
    }

    setAnimating(true);
    const result = commitGuess(guess);

    // Prevent duplicate stat recording if already finished today's daily
    const alreadyPlayedToday = mode === 'daily' && stats.lastPlayed === today;

    setTimeout(() => {
      if (guess === puzzle.answer) {
        sounds.play('win');
        setSolved(true);
        setGameOver(true);
        setMessage(`Solved in ${currentRow + 1}/6!`);
        if (!alreadyPlayedToday) {
          const newStats = recordWin(stats, currentRow + 1);
          setStats({ ...newStats, lastPlayed: today });
          if (mode !== 'practice') saveStats({ ...newStats, lastPlayed: today });
        }
        setShowStats(true);
      } else if (currentRow >= ROW_COUNT - 1) {
        sounds.play('lose');
        setGameOver(true);
        setMessage(`${mode === 'practice' ? 'Word' : "Today's word"} was ${puzzle.answer.toUpperCase()}`);
        if (!alreadyPlayedToday) {
          const newStats = recordLoss(stats, today);
          setStats({ ...newStats, lastPlayed: today });
          if (mode !== 'practice') saveStats({ ...newStats, lastPlayed: today });
        }
        setShowStats(true);
      } else {
        const allCorrect = result.every((s) => s === 'correct');
        if (allCorrect) {
          sounds.play('correct');
        } else {
          // Check if any correct/present letters to play mixed reaction
          const hasAnyCorrect = result.some((s) => s === 'correct' || s === 'present');
          sounds.play(hasAnyCorrect ? 'correct' : 'wrong');
        }
        setCurrentRow((r) => r + 1);
      }
      setAnimating(false);
    }, 500 + COL_COUNT * 100);
  }, [gameOver, animating, currentGuess, puzzle, commitGuess, currentRow, stats, showMessage, today]);

  const addLetter = useCallback(
    (letter: string) => {
      if (gameOver || animating) return;
      if (currentGuess.length >= COL_COUNT) {
        sounds.play('click');
        return;
      }
      sounds.play('key');
      setCurrentGuess((prev) => prev + letter);
    },
    [gameOver, animating, currentGuess],
  );

  const removeLetter = useCallback(() => {
    if (gameOver || animating) return;
    if (currentGuess.length > 0) {
      sounds.play('backspace');
    } else {
      sounds.play('click');
    }
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameOver, animating, currentGuess]);

  // Flash key on keyboard — sync visual
  const flashKey = useCallback((key: string) => {
    setPressedKey(key);
    if (pressedKeyTimer.current) clearTimeout(pressedKeyTimer.current);
    pressedKeyTimer.current = window.setTimeout(() => setPressedKey(''), 300);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      flashKey(key);
      if (key === 'ENTER') { sounds.play('enter'); handleSubmit(); }
      else if (key === 'BACKSPACE') removeLetter();
      else if (/^[A-Z]$/.test(key)) addLetter(key);
    },
    [handleSubmit, removeLetter, addLetter, flashKey],
  );

  // Physical keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mappedKey =
        e.key === 'Enter' ? 'ENTER' :
        e.key === 'Backspace' ? 'BACKSPACE' :
        /^[a-z]$/i.test(e.key) ? e.key.toUpperCase() : null;
      if (mappedKey) flashKey(mappedKey);
      if (e.key === 'Enter') { sounds.play('enter'); handleSubmit(); }
      else if (e.key === 'Backspace') removeLetter();
      else if (/^[a-z]$/i.test(e.key)) addLetter(e.key.toUpperCase());
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSubmit, removeLetter, addLetter, flashKey]);

  // Cleanup pressedKey timer on unmount
  useEffect(() => {
    return () => {
      if (pressedKeyTimer.current) clearTimeout(pressedKeyTimer.current);
    };
  }, []);
  const displayRows = rows.map((row, idx) => {
    if (idx < currentRow) return row;
    if (idx === currentRow) {
      // If row has committed statuses, use stored letters (not currentGuess which was cleared)
      const letters = row.statuses
        ? row.letters
        : currentGuess.split('').concat('').slice(0, COL_COUNT);
      return {
        letters,
        statuses: row.statuses,
      };
    }
    return { letters: [] as string[], statuses: undefined as TileStatus[] | undefined };
  });

  const handleFreeHint = () => {
    sounds.play('click');
    if (gameOver) return;
    if (freeHintUsed) {
      window.open('https://gumroad.com/', '_blank');
      return;
    }
    const pos = currentGuess.length < COL_COUNT ? currentGuess.length : 0;
    const letter = puzzle.answer[pos].toUpperCase();
    setFreeHintUsed(true);
    showMessage(`Hint: position ${pos + 1} is ${letter}`);
    addLetter(puzzle.answer[pos].toUpperCase());
  };

  const handleShare = () => {
    const filledRows = rows.filter((r) => r.statuses);
    const shareRows = solved ? filledRows : filledRows.slice(0, -1);
    const grid = shareRows
      .map((r) =>
        r.statuses
          ?.map((s) =>
            s === 'correct' ? '⬛' : s === 'present' ? '🔲' : '⬜',
          )
          .join(''),
      )
      .join('\n');
    const label = mode === 'practice' ? 'Practice' : `#${puzzle.dayIndex}`;
    const text = `TrailWord ${label} ${solved ? currentRow + 1 : 'X'}/6\n${grid}\n${puzzle.category}`;
    sounds.play('click');
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => showMessage('Copied!')).catch(() => {});
    }
  };

  const handleResetStats = () => {
    sounds.play('click');
    const fresh = defaultStats();
    setStats(fresh);
    saveStats(fresh);
  };

  const handleCloseStats = () => setShowStats(false);

  const handleOpenSettings = () => {
    sounds.play('click');
    setShowSettings(true);
  };
  const handleCloseSettings = () => setShowSettings(false);

  return (
    <div data-contrast={contrast}>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 px-4 pb-8">
        {/* Clue hero */}
        <div className="marshmallow-card w-full rounded-2xl p-4">
          <span className="flex items-center gap-2 text-xs tracking-widest text-surface-500 dark:text-surface-400 uppercase font-display">
            {mode === 'practice' ? 'Practice trail' : "Today's trail"}
            <span className={cn(
              'inline-block rounded-full px-2 py-0.5 text-[10px] font-sans font-medium tracking-normal',
              mode === 'practice'
                ? 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-300'
                : 'bg-surface-800 dark:bg-surface-200 text-white dark:text-surface-800',
            )}>
              {mode === 'practice' ? 'PRACTICE' : 'DAILY'}
            </span>
          </span>
          <p className="mt-1 text-lg text-surface-700 dark:text-surface-300 font-display">
            {puzzle.category}
          </p>
          <p className="mt-0.5 text-sm text-surface-400">{puzzle.hint}</p>
        </div>

        {/* Board */}
        <div className="w-full">
          <GameBoard rows={displayRows} rowCount={ROW_COUNT} activeRow={currentRow} />
        </div>

        {/* Message */}
        <div className={cn(
          'h-6 text-center text-sm font-display transition-opacity',
          message ? 'text-surface-700 dark:text-surface-300' : 'opacity-0',
        )}>
          {message}
        </div>

        {/* Color Legend */}
        {!gameOver && (
          <div className="flex items-center justify-center gap-4 text-xs text-surface-500 dark:text-surface-400">
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-[3px]" style={{ backgroundColor: 'var(--tile-correct-bg)' }} />
              <span className="whitespace-nowrap">Right place</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-[3px]" style={{ backgroundColor: 'var(--tile-present-bg)' }} />
              <span className="whitespace-nowrap">Wrong place</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-[3px]" style={{ backgroundColor: 'var(--tile-absent-bg)' }} />
              <span className="whitespace-nowrap">Not in word</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex w-full gap-2">
          <ActionButton variant="blue"
            label={freeHintUsed ? 'Buy hints' : 'Hint'}
            icon={<HintIcon className="size-4" />}
            onClick={handleFreeHint}
          />
          <ActionButton variant="blue"
            label="Share"
            icon={<ShareIcon className="size-4" />}
            onClick={handleShare}
          />
          <ActionButton variant="blue"
            label="Stats"
            icon={<TrophyIcon className="size-4" />}
            onClick={() => { sounds.play('click'); setShowStats(true); }}
          />
          <ActionButton variant="blue"
            label={mode === 'practice' ? 'Daily' : 'Practice'}
            icon={
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
                {mode === 'practice' ? (
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" fill="currentColor"/>
                )}
              </svg>
            }
            onClick={() => { sounds.play('click'); startNewGame(mode === 'practice' ? 'daily' : 'practice'); }}
          />
          <ActionButton variant="blue"
            label="Settings"
            icon={<SettingsGearIcon className="size-4" />}
            onClick={handleOpenSettings}
          />
        </div>

        {/* Keyboard */}
        <GameKeyboard keyStatus={keyStatus} onKey={handleKey} pressedKey={pressedKey} />
      </div>

      {showStats && (
        <StatsDialog
          stats={stats}
          gameOver={gameOver || stats.played > 0}
          onReset={handleResetStats}
          onClose={handleCloseStats}
        />
      )}

      <SettingsDialog
        open={showSettings}
        onClose={handleCloseSettings}
        soundEnabled={soundEnabled}
        onSoundToggle={(v) => {
          setSoundEnabled(v);
          if (v) sounds.play('click');
        }}
        volume={volume}
        onVolumeChange={(v) => {
          setVolume(v);
          sounds.play('click');
        }}
        contrast={contrast}
        onContrastChange={(v) => {
          setContrast(v);
          sounds.play('click');
        }}
      />
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  variant = 'default',
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'blue';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'marshmallow-btn flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-display',
        variant === 'blue' ? 'marshmallow-btn-blue' : 'marshmallow-btn-default',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
