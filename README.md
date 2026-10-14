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

### Browser version

`npm run build-web` builds `web/index.html`, a single-page version of the overlay (all guides embedded, aetheryte picker, direction arrow, reset timers) that runs in any browser, for a second monitor or a phone.

### Coordinates

`data/aetherytes.txt` holds 109 aetheryte coordinates (base game through Dawntrail), gathered from the Trials of Fantasy aetheryte checklist and the FFXIV Online Wiki zone pages. Quest steps that unlock an aetheryte get it as their arrow target automatically (58 steps). City-aethernet shards and Dawntrail's smaller sub-zone aetherytes are not included. Values come from third-party pages and have not been checked in game.

### Included guides

`guides/ffxiv-00-locations.json` is a region-by-region reference (zones, cities, dungeons, trials, raids; from `data/locations.txt`). `guides/ffxiv-01…12` cover the entire Main Scenario Quest line from A Realm Reborn through Patch 7.56 (one guide per story arc; every quest with its level and what it unlocks). They are generated from the quest lists in `data/msq-*.txt` – edit those and run `npm run build-guides` to regenerate (e.g. when a new patch adds quests).

The quest lists do not include map coordinates, so there are no direction arrows in them yet. Add a `target` to any quest line in your own copy, or tell me which quests to add them to.
 – replace or extend it with your own walkthrough notes.
