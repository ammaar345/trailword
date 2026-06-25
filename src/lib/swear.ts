// 5-letter swear/offensive words filter
// Also validates guess is a known English word

import { VALID_GUESSES } from './words';

const SWEAR_WORDS = new Set([
  'shit', 'fuck', 'damn', 'piss', 'cunt', 'dick', 'prick', 'whore',
  'arse', 'slut', 'twat',
  'nigga', 'niger',
]);

export function isAllowedGuess(word: string): boolean {
  return word.length === 5
    && /^[a-z]+$/.test(word)
    && !SWEAR_WORDS.has(word)
    && VALID_GUESSES.has(word);
}
