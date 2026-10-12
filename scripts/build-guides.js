// Builds guides/*.json from the quest lists in data/msq-*.txt
// Format:  "# Title|output-name"   "## Section"   "Quest|level|unlock; unlock"
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data'), outDir = path.join(root, 'guides');
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
