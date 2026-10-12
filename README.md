# Final Fantasy Guide Overlay

A small always-on-top, transparent, click-through window that shows guide notes over your game, built for **Final Fantasy XIV** (works with any FF game). Set FFXIV to **Borderless Window** in Graphics settings – exclusive fullscreen hides overlays.

It is a separate window: it never reads, hooks or automates the game client. The footer shows live daily (15:00 UTC) and weekly (Tue 08:00 UTC) reset countdowns.

## Run

```bash
npm install
npm start
```

## Hotkeys (global – work while the game has focus)

| Key | Action |
|-----|--------|
| F6 / F7 | Previous / next step |
| F8 | Show / hide overlay |
| F9 | Toggle **locked** (click-through) ↔ **edit** (drag, resize, pick guide, step list) |
| F10 | Cycle opacity |

Your guide, step, position and size are remembered between runs.

## Adding guides

Drop a `.json` file in `guides/`. Format:

```json
{
  "title": "FFX – Zanarkand",
  "steps": [
    {
      "section": "Prologue",
      "title": "Step title (required)",
      "text": "Free text",
      "do": ["Bullet", "Bullet"],
      "items": ["Chest: Potion"],
      "tips": ["Tip"],
      "boss": ["Boss strategy"]
    }
  ]
}
```

Check your files with `npm run validate`.

> The included `ffxiv-a-realm-reborn.json` is only a short starter – replace or extend it with your own walkthrough notes.
