const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'guides');
let bad = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  try {
    const g = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!g.title || !Array.isArray(g.steps) || !g.steps.length) throw new Error('needs "title" and non-empty "steps"');
    g.steps.forEach((s, i) => { if (!s.title) throw new Error(`step ${i + 1} has no title`); });
    console.log(`ok  ${f} (${g.steps.length} steps)`);
  } catch (e) { bad++; console.error(`BAD ${f}: ${e.message}`); }
}
process.exit(bad ? 1 : 0);
