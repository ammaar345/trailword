'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard, { type TileStatus } from './GameBoard';
import GameKeyboard, { type KeyStatus } from './GameKeyboard';
import StatsDialog from './StatsDialog';
import SettingsDialog, { type ContrastVariant, type FontSize } from './SettingsDialog';
import { cn } from '@/lib/utils';
import { isAllowedGuess } from '@/lib/swear';
import { getDailyPuzzle, getRandomPuzzle, type DailyPuzzle } from '@/lib/daily';
import { loadStats, saveStats, recordWin, recordLoss, loadPracticeStats, savePracticeStats, type GameStats, defaultStats } from '@/lib/stats';
import sounds from '@/lib/sounds';
import { ShareIcon, HintIcon, SettingsGearIcon } from './icons';
import { TrophyIcon } from './icons';

const ROW_COUNT = 6;
const COL_COUNT = 5;
const BOARD_STATE_KEY = 'trailword:board';
const GUMROAD_HINTS_URL = 'https://ammaar345.gumroad.com/l/trailword-hints';
const HINTS_PURCHASED_KEY = 'trailword:hints-purchased';

interface Row {
  letters: string[];
  statuses?: TileStatus[];
}

interface BoardState {
  day: string;
  mode: 'daily' | 'practice';
  rows: Row[];
  currentRow: number;
  currentGuess: string;
  gameOver: boolean;
  solved: boolean;
  freeHintUsed?: boolean; // legacy
  hintLevel: number;
  keyStatus: KeyStatus;
}

function loadBoardState(): BoardState | null {
  try {
    const saved = JSON.parse(localStorage.getItem(BOARD_STATE_KEY) || 'null');
    if (!saved || saved.day !== getDailyPuzzle().day || saved.mode !== 'daily') return null;
    // Migrate legacy freeHintUsed boolean to hintLevel
    if (typeof saved.hintLevel !== 'number') {
      saved.hintLevel = saved.freeHintUsed ? 1 : 0;
    }
    return saved;
  } catch {
    return null;
  }
}

export default function Game() {
  const savedBoard = loadBoardState();

  const [puzzle, setPuzzle] = useState<DailyPuzzle>(getDailyPuzzle);
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [rows, setRows] = useState<Row[]>(() =>
    savedBoard ? savedBoard.rows : Array.from({ length: ROW_COUNT }, () => ({ letters: [] as string[] })),
  );
  const [currentGuess, setCurrentGuess] = useState<string>(savedBoard?.currentGuess ?? '');
  const [currentRow, setCurrentRow] = useState<number>(savedBoard?.currentRow ?? 0);
  const [gameOver, setGameOver] = useState<boolean>(savedBoard?.gameOver ?? false);
  const [solved, setSolved] = useState<boolean>(savedBoard?.solved ?? false);
  const [message, setMessage] = useState<string>('');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [hintLevel, setHintLevel] = useState<number>(savedBoard?.hintLevel ?? 0);
  const [hintsPurchased, setHintsPurchased] = useState<boolean>(() => {
    try { return localStorage.getItem(HINTS_PURCHASED_KEY) === 'true'; } catch { return false; }
  });
  const [keyStatus, setKeyStatus] = useState<KeyStatus>(savedBoard?.keyStatus ?? {});
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [practiceStats, setPracticeStats] = useState<GameStats>(loadPracticeStats);
  const [animating, setAnimating] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [definition, setDefinition] = useState<{ word: string; definition: string; example?: string } | null>(null);
  const [definitionLoading, setDefinitionLoading] = useState<boolean>(false);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');

  // Daily puzzle countdown — update every 60s
  useEffect(() => {
    if (mode !== 'daily') { setTimeUntilNext(''); return; }
    const update = () => {
      const now = Date.now();
      const nextMidnight = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1);
      const diff = nextMidnight - now;
      if (diff <= 0) { setTimeUntilNext(''); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setTimeUntilNext(`Next in ${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [mode]);

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
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try { const p = JSON.parse(localStorage.getItem('trailword:prefs') || '{}'); return p.reducedMotion ?? false; } catch { return false; }
  });
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(() => {
    try { const p = JSON.parse(localStorage.getItem('trailword:prefs') || '{}'); return p.fontSize ?? 'md'; } catch { return 'md'; }
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
    localStorage.setItem('trailword:prefs', JSON.stringify({ soundEnabled, volume, contrast, reducedMotion, fontSize }));
  }, [soundEnabled, volume, contrast, reducedMotion, fontSize]);

  // Sync font-size to html element
  useEffect(() => {
    const html = document.documentElement;
    if (fontSize === 'md') html.removeAttribute('data-font-size');
    else html.dataset.fontSize = fontSize;
  }, [fontSize]);

  // Persist board state to localStorage (daily mode only)
  useEffect(() => {
    if (mode !== 'daily') return;
    const state: BoardState = {
      day: puzzle.day,
      mode,
      rows,
      currentRow,
      currentGuess,
      gameOver,
      solved,
      hintLevel,
      keyStatus,
    };
    localStorage.setItem(BOARD_STATE_KEY, JSON.stringify(state));
  }, [rows, currentRow, currentGuess, gameOver, solved, hintLevel, keyStatus, mode, puzzle.day]);

  // Fetch word definition on game end
  useEffect(() => {
    if (gameOver && !definition && !definitionLoading) {
      fetchDefinition(puzzle.answer);
    }
  }, [gameOver, puzzle.answer, definition, definitionLoading, fetchDefinition]);

  const today = puzzle.day;

  // Show stats if returning after solving today's daily
  useEffect(() => {
    if (stats.lastPlayed === today && (stats.wins > 0 || stats.losses > 0)) {
      setShowStats(true);
    }
  }, [stats, today]);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  }, []);

  const fetchDefinition = useCallback(async (word: string) => {
    setDefinitionLoading(true);
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (res.ok) {
        const data = await res.json();
        const entry = data[0];
        if (entry?.meanings?.length) {
          const def = entry.meanings[0].definitions[0];
          setDefinition({ word: entry.word, definition: def.definition, example: def.example });
        }
      }
    } catch {
      // silent — definition is a nice-to-have
    } finally {
      setDefinitionLoading(false);
    }
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
    setHintLevel(0);
    setKeyStatus({});
    setDefinition(null);
    setDefinitionLoading(false);
    setTimeUntilNext('');
    setAnimating(false);
    // Clear saved board state for daily mode
    if (newMode === 'daily') {
      localStorage.removeItem(BOARD_STATE_KEY);
    }
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
          newKeyStatus[letter] = result[i] as 'correct' | 'present' | 'absent';
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
        setMessage(mode === 'practice' ? 'Solved!' : `Solved in ${currentRow + 1}/6!`);
        if (!alreadyPlayedToday) {
          if (mode === 'daily') {
            const newStats = recordWin(stats, currentRow + 1);
            setStats({ ...newStats, lastPlayed: today });
            saveStats({ ...newStats, lastPlayed: today });
          } else {
            const newStats = recordWin(practiceStats, currentRow + 1);
            setPracticeStats({ ...newStats, lastPlayed: today });
            savePracticeStats({ ...newStats, lastPlayed: today });
          }
        }
        setShowStats(true);
      } else if (currentRow >= ROW_COUNT - 1) {
        if (mode === 'practice') {
          // Infinite practice — no lose limit, grow the board
          sounds.play(mode === 'practice' ? 'click' : 'lose');
          setRows(prev => [...prev, { letters: [] as string[] }]);
          setCurrentRow(r => r + 1);
        } else {
          sounds.play('lose');
          setGameOver(true);
          setMessage(`Today's word was ${puzzle.answer.toUpperCase()}`);
          if (!alreadyPlayedToday) {
            const newStats = recordLoss(stats, today);
            setStats({ ...newStats, lastPlayed: today });
            saveStats({ ...newStats, lastPlayed: today });
          }
          setShowStats(true);
        }
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
  }, [gameOver, animating, currentGuess, puzzle, commitGuess, currentRow, stats, practiceStats, showMessage, today]);

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

  const purchaseHints = () => {
    const checkoutUrl = GUMROAD_HINTS_URL + '?checkout=true';
    window.open(checkoutUrl, '_blank');
  };

  const getUniqueAnswerLetter = (): string => {
    // Pick a random unique letter from answer not yet guessed
    const guessed = new Set(rows.flatMap(r => r.statuses ? r.letters : []));
    const available = puzzle.answer.split('').filter(l => !guessed.has(l));
    if (available.length === 0) return puzzle.answer[0];
    return available[Math.floor(Math.random() * available.length)];
  };

  const handleFreeHint = () => {
    sounds.play('click');
    if (gameOver) return;

    // If already purchased, give unlimited hints
    if (hintsPurchased) {
      const pos = currentGuess.length < COL_COUNT ? currentGuess.length : 0;
      const letter = puzzle.answer[pos].toUpperCase();
      showMessage(`Hint: position ${pos + 1} is ${letter}`);
      addLetter(puzzle.answer[pos].toUpperCase());
      return;
    }

    if (hintLevel === 0) {
      // Tier 1: reveal a letter in the word
      const letter = getUniqueAnswerLetter().toUpperCase();
      setHintLevel(1);
      showMessage(`The answer contains "${letter}"`);
      return;
    }

    if (hintLevel === 1) {
      // Tier 2: reveal a specific position
      const pos = currentGuess.length < COL_COUNT ? currentGuess.length : 0;
      const letter = puzzle.answer[pos].toUpperCase();
      setHintLevel(2);
      showMessage(`Hint: position ${pos + 1} is ${letter}`);
      addLetter(puzzle.answer[pos].toUpperCase());
      return;
    }

    // Tier 3+: buy hints
    purchaseHints();
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
    const solvedText = solved ? (mode === 'practice' ? `${currentRow + 1}` : `${currentRow + 1}/6`) : (mode === 'practice' ? '—' : 'X');
    const text = `TrailWord ${label} ${solvedText}\n${grid}\n${puzzle.category}`;
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

  const handleResetPracticeStats = () => {
    sounds.play('click');
    const fresh = defaultStats();
    setPracticeStats(fresh);
    savePracticeStats(fresh);
  };

  const handleCloseStats = () => { sounds.play('click'); setShowStats(false); };

  const handleOpenSettings = () => {
    sounds.play('click');
    setShowSettings(true);
  };
  const handleCloseSettings = () => { sounds.play('click'); setShowSettings(false); };

  const handleActivateHints = () => {
    sounds.play('click');
    localStorage.setItem(HINTS_PURCHASED_KEY, 'true');
    setHintsPurchased(true);
    showMessage('Hints activated!');
  };

  const activeStats = mode === 'practice' ? practiceStats : stats;

  return (
    <div data-contrast={contrast} data-reduced-motion={reducedMotion ? 'true' : undefined}>
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
            {activeStats.played > 0 && (
              <span className="ml-auto text-[10px] text-surface-400 dark:text-surface-500 font-sans tracking-normal">
                Streak {activeStats.streak} &middot; Best {activeStats.maxStreak}
              </span>
            )}
          </span>
          <p className="mt-1 text-lg text-surface-700 dark:text-surface-300 font-display">
            {puzzle.category}
          </p>
          <p className="mt-0.5 text-sm text-surface-400">{puzzle.hint}</p>
          {mode === 'daily' && timeUntilNext && (
            <p className="mt-1.5 text-[10px] text-surface-400 dark:text-surface-500 font-sans tracking-normal">
              {timeUntilNext}
            </p>
          )}
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

        {/* Persistent answer on loss */}
        {gameOver && !solved && (
          <div className="marshmallow-card w-full rounded-2xl p-4 text-center">
            <p className="text-[10px] tracking-widest text-surface-500 dark:text-surface-400 uppercase font-display">
              Answer
            </p>
            <p className="mt-0.5 text-xl font-display font-bold tracking-wide text-surface-700 dark:text-surface-300">
              {puzzle.answer.toUpperCase()}
            </p>
            <p className="mt-0.5 text-xs text-surface-400 font-sans italic">
              {puzzle.category}
            </p>
          </div>
        )}

        {/* Word definition on game end */}
        {gameOver && definition && (
          <div className="marshmallow-card w-full rounded-2xl p-4">
            <span className="text-[10px] tracking-widest text-surface-500 dark:text-surface-400 uppercase font-display">
              Definition
            </span>
            <p className="mt-1 text-sm text-surface-700 dark:text-surface-300 leading-relaxed font-sans">
              {definition.definition.charAt(0).toUpperCase() + definition.definition.slice(1)}
            </p>
            {definition.example && (
              <p className="mt-1.5 text-sm text-surface-500 italic leading-relaxed font-sans">
                &ldquo;{definition.example}&rdquo;
              </p>
            )}
          </div>
        )}

        {definitionLoading && gameOver && !definition && (
          <div className="h-6 text-center">
            <span className="text-xs text-surface-400">Loading definition...</span>
          </div>
        )}

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
            label={hintLevel >= 2 && !hintsPurchased ? 'Buy hints' : 'Hint'}
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
          stats={activeStats}
          mode={mode}
          gameOver={gameOver || activeStats.played > 0}
          onReset={mode === 'practice' ? handleResetPracticeStats : handleResetStats}
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
        reducedMotion={reducedMotion}
        onReducedMotionToggle={(v) => {
          setReducedMotion(v);
          sounds.play('click');
        }}
        fontSize={fontSize}
        onFontSizeChange={(v) => {
          setFontSize(v);
          sounds.play('click');
        }}
        hintsPurchased={hintsPurchased}
        onActivateHints={handleActivateHints}
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
