const STORAGE_KEY = 'trailword:v2';
const PRACTICE_KEY = 'trailword:practice-v2';

export interface GameStats {
  played: number;
  wins: number;
  losses: number;
  streak: number;
  maxStreak: number;
  distribution: number[];
  lastPlayed: string;
}

export function defaultStats(): GameStats {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    streak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    lastPlayed: '',
  };
}

export function loadStats(): GameStats {
  try {
    return { ...defaultStats(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: GameStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordWin(stats: GameStats, guesses: number): GameStats {
  return {
    ...stats,
    played: stats.played + 1,
    wins: stats.wins + 1,
    streak: stats.streak + 1,
    maxStreak: Math.max(stats.streak + 1, stats.maxStreak),
    distribution: stats.distribution.map((count, i) =>
      i === guesses - 1 ? count + 1 : count,
    ),
  };
}

export function recordLoss(stats: GameStats, day: string): GameStats {
  return {
    ...stats,
    played: stats.played + 1,
    losses: stats.losses + 1,
    streak: 0,
    lastPlayed: day,
  };
}

export function loadPracticeStats(): GameStats {
  try {
    return { ...defaultStats(), ...JSON.parse(localStorage.getItem(PRACTICE_KEY) || '{}') };
  } catch {
    return defaultStats();
  }
}

export function savePracticeStats(stats: GameStats): void {
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(stats));
}
