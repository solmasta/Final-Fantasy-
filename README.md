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

### Direction arrow

Add a `target` to any step (map coordinates, as shown under your minimap / on the world map):

```json
{ "title": "Talk to the NPC", "target": { "zone": "Limsa Lominsa", "x": 10.5, "y": 11.2, "label": "Aetheryte" } }
```

Tell the overlay where you are in one of two ways: **copy** your coordinates (e.g. `10.5, 11.2`) and press **F11**, or type them in the box in edit mode (F9). The overlay then shows a compass arrow, the 8-way direction and the distance to the target. The arrow is *map-relative*: set the minimap to **fixed north** (minimap right-click → Lock/Fixed North) so up on the arrow = north on your map. Coordinates are entered by you; the overlay does not read the game.

Check your files with `npm run validate`.

> The included `ffxiv-a-realm-reborn.json` is only a short starter – replace or extend it with your own walkthrough notes.
