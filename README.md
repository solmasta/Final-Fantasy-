# Final Fantasy Guide Overlay

A small always-on-top, transparent, click-through window that shows a step-by-step walkthrough over your game. Works with any Final Fantasy game that runs in **windowed or borderless-windowed** mode (true exclusive fullscreen hides overlays).

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

> The included `ffvii-opening.json` is only a short sample of the format – replace or extend it with your own walkthrough notes.
