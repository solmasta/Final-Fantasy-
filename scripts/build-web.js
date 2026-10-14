// Builds web/index.html: the browser version of the overlay with every guide embedded.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const guides = fs.readdirSync(path.join(root, 'guides')).filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .map(f => ({ id: f.replace(/\.json$/, ''), ...JSON.parse(fs.readFileSync(path.join(root, 'guides', f), 'utf8')) }));
const json = JSON.stringify(guides).replace(/</g, '\\u003c');
const html = fs.readFileSync(path.join(root, 'web', 'template.html'), 'utf8').replace('/*GUIDES*/[]', () => json)
  .replace('/*AETH*/[]', () => fs.readFileSync(path.join(root, 'data', 'aetherytes.json'), 'utf8').replace(/</g, '\\u003c'));
fs.writeFileSync(path.join(root, 'web', 'index.html'), html);
console.log(`web/index.html  ${guides.length} guides, ${(html.length / 1024).toFixed(0)} KB`);
