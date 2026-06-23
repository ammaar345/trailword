# TrailWord

Static daily word puzzle for GitHub Pages.

## Run local

PowerShell:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy

Push this folder to GitHub Pages, or copy these files to the Pages root:

- `index.html`
- `styles.css`
- `app.js`
- `words.js`
- `sw.js`
- `manifest.webmanifest`
- `assets/icon.svg`

## Monetization setup

In `app.js`, replace:

- `GUMROAD_HINT_PACK_URL` with your Gumroad hint pack URL
- `CARBON_AD_TAG` with your Carbon Ads tag

## Hint pack idea

Sell a $3 one-time hint pack with:

- reveal first letter
- reveal one correct tile
- definition clue
- category clue
