# TrailWord — Development Notes

## Visual Design

### Marshmallow Palette (Warm Pink Family)
No longer grayscale. Tiles use warm marshmallow-inspired colors:
- `--tile-correct-bg`: `#f7d3d3` (light mode), `#c4a2a2` (dark mode) — soft marshmallow pink
- `--tile-present-bg`: `#edd5d5` (light mode), `#a8888a` (dark mode) — whisper pink
- `--tile-absent-bg`: `#ece8e4` (light mode), `#2a2826` (dark mode) — warm cream / near-black
- Text uses dark `#3a3030` on light tiles, white on dark tiles
- Colors defined as CSS custom properties in `src/index.css`

### Contrast Variants
4 levels selectable via Settings dialog (all use warm marshmallow tones):
- **Medium** (default) — soft pink family (user's color: `#f7d3d3`)
- **High** — slightly deeper pinks, brighter cream absent
- **Soft** — most muted, uses dark text `#4a4238` on light tiles
- **Dark** — deeper muted pinks, near-black absent

### Marshmallow UI Elements
All interactive elements use pillowy marshmallow styling (14px border-radius, soft gradients, layered box-shadows):
- **Keyboard keys**: `key-marshmallow` + `key-marshmallow-default` classes in `src/index.css`
- **Action buttons** (Hint/Share/Stats/Practice/Settings): Blue marshmallow variant `marshmallow-btn-blue` — light blue gradient `#d6e8ff→#c0daff` (light mode), `#2a3d66→#1f3050` (dark mode)
- **Header bar**: `marshmallow-header` class — same blue gradient, sticky, backdrop blur
- **Clue card**: `marshmallow-card` class — blue gradient on the "Today's trail" hint card

### Winning Tile Text
Correct tiles get a special text color via `.tile-marshmallow-correct-text` class:
- Current: `#4a7a9a` (muted warm blue, visible on `#f7d3d3` tile bg)
- Applied to the text `<span>` via conditional class in Tile.tsx

### Dither Texture
Bayer ordered-dither pattern overlays non-empty tiles via `opacity-30` (changed from `mix-blend-overlay`). Generated as SVG data URI in `src/lib/dither-pattern.ts`.

### Fonts
Font stack in `src/index.css`:
- `--font-sans: "Inter"` — body
- `--font-display: "Space Grotesk"` — headings/category
- `--font-serif: "Instrument Serif"` — accent/italic
- No external font files needed (Google Fonts via CSS import)

### Grid
- 1px tile borders
- Gaps: 1 (mobile), 1.5 (desktop)
- Max width: 300px

## Word Validation

### Accepted Guesses
Any 5-letter alphabetic word that isn't a swear word. Validation logic in `src/lib/swear.ts`:
- Checks: length === 5, only a-z letters, not in swear word set
- Replaces the old `VALID_GUESSES` set from `src/lib/valid-guesses.ts` (which had a huge hardcoded word list)
- Swear word filter blocks ~14 common offensive words

### Answer Words
~115 curated words with categories and hints. Defined in `src/lib/words.ts`.

## Sound System

### Web Audio API (ASMR keyboard)
File: `src/lib/sounds.ts`
- **key** — short noise burst + low thump
- **backspace** — slightly different timbre
- **enter** — fuller thunk
- **correct** — ascending two-tone chime
- **wrong** — low descending tone
- **win** — three-note ascending arpeggio
- **lose** — soft descending two-tone
- **click** — very short tick (UI elements)

Settings: enabled toggle + volume slider (persisted in state, not localStorage)

## Project Structure
- `src/components/game/` — game UI components (Tile, GameBoard, GameKeyboard, Game, StatsDialog, SettingsDialog)
- `src/components/ui/` — shared UI (icons, dither shader)
- `src/lib/` — utilities (words, daily puzzle, stats, sounds, dither patterns, swear filter, utils)
- `src/pages/` — page layouts (GamePage, dither demo)

## Bug Fixes

### Invisible Winning Text (resolved)
Root cause: `displayRows` in Game.tsx built current-row letters from `currentGuess.split('')`. After `commitGuess` called `setCurrentGuess('')`, the next render showed empty letters on all correct-status tiles — no text at all, not invisible color. Fix: when row has committed statuses, read letters from `row.letters` instead of `currentGuess`. See `displayRows` in `Game.tsx`.

## Design Decisions

- Colors are CSS variables in `src/index.css` — not Tailwind utility classes — so all 4 contrast variants + dark mode can be swapped without component changes
- Tile status CSS variables use `var(--name, fallback)` pattern for resilience
- No framework for state management — React `useState`/`useCallback` only
- No routing library — simple page components with conditionals
- Daily puzzle seeded from date for deterministic daily rotation

## Monetization (Zero-Cost)

Each option requires $0 upfront (GitHub Pages hosting, Gumroad 10% fee only on sales):

| Method | Setup | Est. Revenue |
|--------|-------|-------------|
| **Gumroad hint packs** — $3 unlimited hints (buy hints link already in UI) | Link existing button to Gumroad product | $30-100/mo |
| **Carbon Ads** — ethical ad network on game page | Paste snippet, free approval | $20-80/mo at current traffic |
| **Premium supporter** — $5 one-time via Gumroad, unlocks stats history + custom trails | Gumroad product, check purchase via localStorage flag | $20-50/mo |
| **Tip jar** — Buy Me a Coffee / Ko-fi link | Free account, add link to footer | ~$10-30/mo |
| **Archive access** — $2 one-time to play past daily puzzles | Gumroad license key unlocks date picker | $10-40/mo |

Priority order: Gumroad hint packs (already wired) → Carbon Ads → Premium supporter → Archive.

## Session Fixes (June 23, 2026)

### Streak stat recording bug
- `Game.tsx:158` — added `alreadyPlayedToday` guard (`mode === 'daily' && stats.lastPlayed === today`). Blocks duplicate `recordWin`/`recordLoss` calls on replay. Streak no longer inflates on page refresh + replay.

### Bigger keyboard keys
- `GameKeyboard.tsx` — `h-14 sm:h-[60px]` → `h-16 sm:h-[72px]`, `min-w-[52px]` → `min-w-[62px]`, `max-w-[46px]` → `max-w-[54px]`, base font `13px → 15px`.

### Colorblind contrast variant
- `index.css` — added `[data-contrast="colorblind"]` with blue (`#3b82f6`, correct), amber (`#f59e0b`, present), gray (`#d4d4d4`, absent) tiles. Distinguishable for all common colorblind types (protanopia, deuteranopia, tritanopia).
- Keyboard keys now use CSS variables (`--key-correct-bg` etc.) so they follow the active contrast mode.
- `Tile.tsx` — removed hardcoded `'#d4a0c0'` correct-tile text override and `tile-marshmallow-correct-text` class. Text color now driven by `--tile-correct-text` per variant.
- `SettingsDialog.tsx` — added `'colorblind'` to `ContrastVariant` type and Colorblind option chip.

### Word validation against dictionary
- `swear.ts` — `isAllowedGuess` now imports `VALID_GUESSES` from `words.ts` (combined 2100-word set). Non-dictionary 5-letter strings show "Invalid word".

### Win sound louder
- `sounds.ts:164` — win jingle gain `0.3→0.55`. About 80% louder at same volume setting.

### Settings persistence
- `Game.tsx` — `soundEnabled`, `volume`, `contrast` now initialized from `localStorage['trailword:prefs']`. Saved on every change via `useEffect`. Colorblind preference survives page refresh.

## What Can Be Better

### Gameplay
- **Board state persistence** — save `rows`, `currentRow`, `gameOver`, `solved` to localStorage so refresh restores completed board (currently only stats persist). Needs restore + prevent replay on solved daily.
- **Tiered hints** (first letter → category hint → position reveal) instead of single free hint
- **Word definitions + example sentences** shown after solving
- **Practice mode stats** — track separate practice stats (currently practice and daily share the same counter)
- **Streak display** — show current streak and max streak in the game header, not just Stats dialog
- **Daily puzzle archive** — $2 one-time to play past daily puzzles (Gumroad license key)
- **Custom trail creation** — user picks 5-letter word, system generates category + hint
- **Infinite practice mode** — no 6-guess limit, just free-form guessing
- **Daily puzzle timer** — countdown showing when next puzzle drops

### UI/UX
- **Colorblind+ mode** — add shapes/patterns on tiles in addition to color (diagonal stripes for correct, dots for present)
- **Mobile swipe keyboard** — swipe up/down for backspace, left for enter
- **Reduced motion setting** — disable flip animation for accessibility
- **Font size options** in settings
- **Sound pack selection** — different ASMR switch profiles (linear/tactile/clicky) choosable by user
- **Share to social media** — proper embeds with card previews (Twitter/X, WhatsApp)
- **Stats distribution bar graph** — improve visual layout of guess distribution
- **Keyboard layout** — split keyboard rows more ergonomically for thumb typing on mobile

### Tech
- **Accessibility audit** — screen reader labels, focus management, ARIA live regions for messages
- **PWA support** — full offline play via service worker (currently service worker exists in `game/` but not in React build)
- **Analytics** — lightweight page view counter (Plausible, Fathom, or CountAPI) — avoided so far to keep zero-cost
- **i18n / multi-language** word lists — English-only currently, 4-billion+ non-native English speakers unserved
- **Multi-device sync** — localStorage only, no account system. Streak dies if browser data cleared.
- **Build optimization** — split CSS chunks, lazy-load SettingsDialog
- **Game loop state machine** — current state is spread across 10+ `useState` hooks. A reducer or state machine would eliminate impossible states (`solved=true, gameOver=false`, etc.)
