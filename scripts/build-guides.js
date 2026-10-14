// Builds guides/*.json from the quest lists in data/msq-*.txt
// Format:  "# Title|output-name"   "## Section"   "Quest|level|unlock; unlock"
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data'), outDir = path.join(root, 'guides');

// Aetheryte coordinates (data/aetherytes.json). A quest step that lists an aetheryte
// under "unlocks" gets that aetheryte as its direction-arrow target.
const norm = n => n.toLowerCase().replace(/^the /, '').replace(/[^a-z0-9]+/g, ' ').trim();
const aetherytes = JSON.parse(fs.readFileSync(path.join(dataDir, 'aetherytes.json'), 'utf8'));
const byName = new Map(aetherytes.map(a => [norm(a.name), a]));
const ALIAS = { 'old gridania': 'new gridania', 'ishgard': 'foundation', 'limsa lominsa': 'limsa lominsa lower decks', 'ul dah': 'ul dah steps of nald',
  'tuliyollal': 'tuliyollal', 'solution nine': 'solution nine', 'old sharlayan': 'old sharlayan', 'radz at han': 'radz at han', 'doman enclave': 'doman enclave' };
// Quest start coordinates (data/quest-coords.json, from scripts/extract-quest-coords.py).
const questCoords = fs.existsSync(path.join(dataDir, 'quest-coords.json')) ? JSON.parse(fs.readFileSync(path.join(dataDir, 'quest-coords.json'), 'utf8')) : {};
const CITY_HINT = { 'Gridania start': /gridania|shroud/i, 'Limsa Lominsa start': /limsa|noscea/i, "Ul'dah start": /ul'dah|thanalan/i };
function questStartFor(name, level, section) {
  let c = questCoords[name]; if (!c) return;
  const atLevel = c.filter(q => q.level === level); if (atLevel.length) c = atLevel;
  const seen = new Set(); c = c.filter(q => { const k = q.zone + q.x + q.y; return seen.has(k) ? false : seen.add(k); });
  if (c.length > 1) { const hint = Object.entries(CITY_HINT).find(([k]) => (section || '').startsWith(k)); c = hint ? c.filter(q => hint[1].test(q.zone)) : []; }
  if (c.length !== 1) return;
  return { zone: c[0].zone, x: c[0].x, y: c[0].y, label: c[0].npc ? `${c[0].npc} (quest start)` : 'Quest start' };
}
function aetheryteFor(unlocks) {
  for (const u of unlocks || []) {
    const k = norm(u.replace(/\s*\(.*\)\s*$/, ''));
    const a = byName.get(ALIAS[k] || k);
    if (a) return { zone: a.zone, x: a.x, y: a.y, label: `${a.name} aetheryte (attune here)` };
  }
}
for (const f of fs.readdirSync(dataDir).filter(f => /^msq-.*\.txt$/.test(f)).sort()) {
  let title, out, section;
  const steps = [];
  for (const line of fs.readFileSync(path.join(dataDir, f), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    if (line.startsWith('## ')) { section = line.slice(3).trim(); continue; }
    if (line.startsWith('# ')) { [title, out] = line.slice(2).split('|'); continue; }
    const [name, level, unlocks] = line.split('|');
    const step = { section, title: name, text: `Level ${level} · Main Scenario Quest (meteor icon)` };
    if (unlocks) step.unlocks = unlocks.split(';').map(s => s.trim());
    const tgt = questStartFor(name, +level, section) || aetheryteFor(step.unlocks); if (tgt) step.target = tgt;
    steps.push(step);
  }
  fs.writeFileSync(path.join(outDir, out + '.json'), JSON.stringify({ title: `FFXIV MSQ – ${title}`, steps }, null, 1));
  console.log(`${out}.json  ${steps.length} quests`);
}

// Locations reference: data/locations.txt  ->  guides/ffxiv-00-locations.json
// Line: Region|Label: a; b; c|Label: ...   (one step per region)
const locFile = path.join(dataDir, 'locations.txt');
if (fs.existsSync(locFile)) {
  const steps = fs.readFileSync(locFile, 'utf8').split('\n').filter(l => l.trim()).map(line => {
    const [region, ...cols] = line.split('|');
    const step = { section: 'Region', title: region, text: 'Numbers in brackets are the levels a duty is available at.' };
    const tags = { Zones: 'zones', Cities: 'cities', Dungeons: 'dungeons', Trials: 'trials', Raids: 'raids', Other: 'other' };
    const labels = { zones: 'Overworld zones', cities: 'Cities & housing', dungeons: 'Dungeons', trials: 'Trials', raids: 'Raids', other: 'Other duties & areas' };
    for (const c of cols) {
      const i = c.indexOf(':');
      const key = tags[c.slice(0, i)];
      step[key] = c.slice(i + 1).split(';').map(s => s.trim());
    }
    return step;
  });
  fs.writeFileSync(path.join(outDir, 'ffxiv-00-locations.json'), JSON.stringify({ title: 'FFXIV – Locations reference', steps }, null, 1));
  console.log(`ffxiv-00-locations.json  ${steps.length} regions`);
}
