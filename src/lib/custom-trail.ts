// Custom trail generator — turn any valid 5-letter word into a playable puzzle
import WORDS from './words';
import type { DailyPuzzle } from './daily';

type Category =
  | 'Ideas' | 'Traits' | 'Objects' | 'Science' | 'People' | 'Nature'
  | 'Place' | 'Life' | 'Food' | 'Arts' | 'Body' | 'Mind' | 'Animals'
  | 'Time' | 'Travel' | 'Tech' | 'Stories' | 'Colors' | 'Sports';

const POS_MAP: Record<string, Category> = {
  noun: 'Objects',
  verb: 'Ideas',
  adjective: 'Traits',
  adverb: 'Mind',
  preposition: 'Place',
  conjunction: 'Ideas',
  pronoun: 'People',
  interjection: 'Mind',
};

function deriveCategory(pos: string): Category {
  return POS_MAP[pos?.toLowerCase()] ?? 'Custom' as Category;
}

export async function buildCustomPuzzle(word: string): Promise<DailyPuzzle> {
  const lower = word.toLowerCase().trim();

  // Check if already a known answer word
  const known = WORDS.find(w => w.answer === lower);
  if (known) {
    return {
      ...known,
      answer: lower,
      day: 'custom',
      dayIndex: -1,
    };
  }

  // Try dictionary API for definition + part of speech
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lower)}`,
    );
    if (res.ok) {
      const data = await res.json();
      const entry = data[0];
      const meaning = entry?.meanings?.[0];
      if (meaning) {
        const pos = meaning.partOfSpeech;
        const def = meaning.definitions?.[0]?.definition;
        return {
          answer: lower,
          category: deriveCategory(pos),
          hint: def
            ? `A 5-letter word meaning: ${def.charAt(0).toLowerCase()}${def.slice(1)}`
            : `Trail starts with ${lower.charAt(0)}.`,
          day: 'custom',
          dayIndex: -1,
        };
      }
    }
  } catch {
    // API unavailable — fall through
  }

  // Fallback: generic hint
  return {
    answer: lower,
    category: 'Custom' as Category,
    hint: `Trail starts with ${lower.charAt(0).toUpperCase()}.`,
    day: 'custom',
    dayIndex: -1,
  };
}
