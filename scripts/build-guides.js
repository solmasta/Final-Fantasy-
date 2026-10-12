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
