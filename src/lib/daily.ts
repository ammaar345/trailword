import WORDS, { type WordEntry } from './words';

export interface DailyPuzzle extends WordEntry {
  day: string;
  dayIndex: number;
}

export function getDailyPuzzle(): DailyPuzzle {
  const start = Date.UTC(2026, 0, 1);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const index = Math.floor((today - start) / 86_400_000);
  const word = WORDS[Math.abs(index) % WORDS.length];
  return {
    ...word,
    answer: word.answer.toLowerCase(),
    day: String(today),
    dayIndex: Math.abs(index),
  };
}

export function getRandomPuzzle(): DailyPuzzle {
  const index = Math.floor(Math.random() * WORDS.length);
  const word = WORDS[index];
  return {
    ...word,
    answer: word.answer.toLowerCase(),
    day: 'practice',
    dayIndex: -1,
  };
}
