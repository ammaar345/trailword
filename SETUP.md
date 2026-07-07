# TrailWord — Publish & Monetization Setup

Everything that must be done **manually by you** to get TrailWord fully
published and earning. Code-side work is done — each section below tells you
exactly what to click, what you'll receive, and what to hand back to Claude
to wire up.

The site itself is already live at **https://trailword.pages.dev** and
auto-deploys from GitHub `master` (Cloudflare Pages). Pushing to master = live
in ~2-5 minutes. Nothing below blocks people from playing — these steps add
income and polish.

---

## 1. Google AdSense (ads in the footer slot)

**Status:** Code is ready and shipped. The ad slot renders nothing until IDs
are set, so the site is clean until you finish this.

### Steps

1. Go to **https://adsense.google.com** → **Get started**
2. Sign in with the Google account you want revenue paid to
3. Enter your site: `trailword.pages.dev`
4. Fill in payment country + address (required before approval)
5. AdSense shows you a **publisher ID** that looks like:
   `ca-pub-1234567890123456`
6. **Send that ID to Claude immediately.** The site must serve your ID while
   Google's crawler reviews it. Claude will put it in
   `src/components/ui/AdSlot.tsx` and push.
7. In AdSense, click **Request review** (if shown). Now wait — approval
   typically takes **2 days to 2 weeks**. You'll get an email.
8. **After approval:** in AdSense go to **Ads → By ad unit → Display ads**
   - Name: `trailword-footer`
   - Shape: Square/Horizontal — leave "Responsive" selected
   - Click **Create** → you get a **slot ID** (a ~10-digit number in
     `data-ad-slot="..."`)
9. **Send the slot ID to Claude.** Ads go live minutes after the push.

### Notes
- The privacy policy AdSense requires is already live:
  https://trailword.pages.dev/privacy
- If rejected ("low value content" is the common one): add the daily archive
  or a how-to-play page, wait 2 weeks, re-request. Ask Claude.
- Expected revenue at launch traffic: $5-30/month. It scales with traffic.

---

## 2. Gumroad Extra Hints ($3, one extra hint per puzzle)

**Status:** The game has the full flow: 2 free hints per puzzle then a "Buy
hints" button that opens your Gumroad page; after buying, the player taps
"activate" in Settings and gets a 3rd hint on every puzzle. Only the Gumroad
product itself is missing. The button links to
`https://sneakylabs.gumroad.com/l/trailword-hints` (username `sneakylabs`).

### The hint model (so the copy matches the game)
- Free: 2 hints per puzzle. Both just say a letter is in the word ("the word
  contains C"), no position, nothing auto-typed.
- Paid: a 3rd hint that reveals ONE position ("position 1 is C"). Never the
  last remaining letter, never auto-solves. The player always types it.
- So the pitch is "one more hint when you're stuck," not "unlimited."

### Steps

1. Go to **https://gumroad.com** → log in as `sneakylabs`
2. **New product** → Type: **Digital product**
   - Name: `TrailWord Extra Hints`
   - Price: **$3** (one-time, pay-what-you-want OFF)
3. **CRITICAL — URL slug must be exactly** `trailword-hints`
   (Product → Settings → URL). Final URL must be
   `https://sneakylabs.gumroad.com/l/trailword-hints`. Any other slug 404s
   the Buy button.
4. Cover + thumbnail (already generated, in the repo `marketing/` folder):
   - Cover → `marketing/gumroad-extra-hints-cover.png` (1280x720)
   - Thumbnail → `marketing/gumroad-extra-hints-thumb.png` (square)
5. Call to action: leave **"I want this!"**
6. Content / receipt text — paste this so buyers know how to activate:
   > Thank you for supporting TrailWord.
   > To activate your extra hints:
   > 1. Go back to https://trailword.pages.dev
   > 2. Tap Settings (the gear button)
   > 3. Tap "I've purchased, activate hints"
   > That's it. An extra hint on every puzzle, on this device. Keep this
   > receipt in case you switch browsers or devices.
7. Publish.
8. **Test end-to-end:** open the game → use 2 free hints → click **Buy hints**
   → confirm your Gumroad page loads at the right price.

### Notes
- Activation is honor-system (a Settings button sets a local flag). Fine at
  this scale; license-key verification can come later if abuse shows up.
- Gumroad takes 10% + processing. No monthly fees.

---

## 3. Tip jar — Ko-fi or Buy Me a Coffee (optional, 15 min)

The only revenue that works from visitor #1. No approval process.

1. Create account at **https://ko-fi.com** (or buymeacoffee.com — either works)
2. Pick a page name, connect PayPal or Stripe for payouts
3. **Send Claude the page URL** (e.g. `https://ko-fi.com/sneaky`)
   → Claude adds a "Tip" link in the footer next to Privacy.

---

## 4. Refresh stale link previews (after sharing once)

The share card (og-image) is live. Chat apps cache previews aggressively:

- **Discord:** picks up the new card within minutes, nothing to do
- **WhatsApp:** caches per-device for days — paste the URL with `?v=2` once
  to force a fresh preview, or just wait
- **X/Twitter:** paste the URL into https://cards-dev.twitter.com/validator
  once to bust the cache
- **Facebook:** https://developers.facebook.com/tools/debug/ → paste URL →
  **Scrape Again**

---

## 5. Optional: analytics (know your traffic — free, 5 min)

Without this you can't see visitor counts (or know when you're big enough
for better ad networks).

1. Cloudflare dashboard → **Analytics & Logs → Web Analytics**
2. **Add a site** → `trailword.pages.dev`
3. It shows a JS snippet with a token like `"token": "abc123..."`
4. **Send Claude the token** → gets added to `index.html` and pushed.
   Cookieless, GDPR-fine, no consent banner needed.

---

## 6. Optional: custom domain (~$10/year, the only non-free item)

`trailword.pages.dev` works fine. If you want `trailword.com`-style branding:

1. Cloudflare dashboard → **Domain Registration → Register domain** (at-cost
   pricing, no markup)
2. Workers & Pages → **trailword** → **Custom domains** → add the domain
3. Tell Claude the domain → og:image URLs, privacy links, and share text get
   updated to match.

---

## Publish checklist (current state)

| Item | Status |
|---|---|
| Game live + auto-deploy | DONE — pushes to master deploy in ~2-5 min |
| Icons, favicons, share card | DONE |
| Privacy policy | DONE — /privacy |
| Mobile friendly | DONE — verified 375px-1440px, short-screen compaction |
| Accessibility + reduced motion | DONE |
| AdSense | YOU: section 1 (send publisher ID, later slot ID) |
| Gumroad hints | YOU: section 2 (create product, slug `trailword-hints`) |
| Tip jar | YOU: section 3 (send page URL) |
| Analytics | YOU: section 5 (send token) — recommended |
| Custom domain | Optional, section 6 |

## Launch quickstart (free traffic)

Once sections 1-2 are done, post the link (the share card sells itself):

- r/WebGames, r/wordgames, r/puzzles (read each sub's self-promo rules first)
- Hacker News "Show HN: TrailWord — a daily word puzzle with ASMR keyboard sounds"
- Product Hunt (weekend launches are less competitive)
- Discord servers for word games / indie web games
- Your own WhatsApp groups — the preview card does the work

Daily-habit games grow by streaks: one post per community, then let the
share button (players posting results) compound.
