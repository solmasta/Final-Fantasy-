const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
let current = null;

function renderStep(s) {
  const guide = s.guides.find(g => g.id === s.guide);
  const box = $('step');
  box.replaceChildren();
  if (!guide || !guide.steps.length) { box.textContent = 'No guide loaded. Add a JSON file to /guides.'; return; }
  const st = guide.steps[s.step];
  box.append(el('div', 'section', `${st.section || ''}  ·  ${s.step + 1}/${guide.steps.length}`), el('h2', '', st.title));
  if (st.text) box.append(el('div', 'block', st.text));
  for (const [key, label] of [['do', 'Do'], ['unlocks', 'Unlocks'], ['zones', 'Overworld zones'], ['cities', 'Cities & housing'], ['dungeons', 'Dungeons'], ['trials', 'Trials'], ['raids', 'Raids'], ['other', 'Other duties & areas'], ['items', 'Items'], ['tips', 'Tips'], ['boss', 'Boss']]) {
    const v = st[key];
    if (!v || !v.length) continue;
    const b = el('div', 'block');
    b.append(el('b', '', label));
    if (typeof v === 'string') b.append(document.createTextNode(v));
    else { const ul = el('ul'); v.forEach(x => ul.append(el('li', '', x))); b.append(ul); }
    box.append(b);
  }
  if (st.objectives && st.objectives.length) {
    const b = el('div', 'block'); b.append(el('b', '', 'Objectives (F5 = aim arrow at next)'));
    const ul = el('ul');
    st.objectives.forEach((o, n) => { const li = el('li', '', `${n === s.obj ? '► ' : ''}${o.label} – ${o.zone} (${o.x}, ${o.y})`); if (n === s.obj) li.style.color = '#ffd75e'; ul.append(li); });
    b.append(ul); box.append(b);
  }
  renderNav(st, s.pos, s.obj);
  const nxt = guide.steps[s.step + 1];
  if (nxt) box.append(el('div', 'next', 'Next: ' + nxt.title));
  $('bar').style.width = ((s.step + 1) / guide.steps.length * 100) + '%';

  const list = $('list');
  list.replaceChildren();
  guide.steps.forEach((x, i) => {
    const d = el('div', i === s.step ? 'cur' : '', `${i + 1}. ${x.title}`);
    if (i === s.step) setTimeout(() => d.scrollIntoView({ block: 'center' }), 0);
    d.onclick = () => { window.overlay.gotoStep(i); list.classList.remove('open'); };
    list.append(d);
  });
}

const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
// Map coordinates: X grows east, Y grows south. Arrow is relative to a north-up map.
function renderNav(st, pos, obj) {
  const nav = $('nav'), t = obj >= 0 && st.objectives ? st.objectives[obj] : st.target;
  if (!t) { nav.classList.remove('on'); return; }
  nav.classList.add('on');
  const txt = $('navtxt');
  txt.replaceChildren();
  const where = `${t.label || 'Target'}${t.zone ? ' – ' + t.zone : ''} (${t.x}, ${t.y})`;
  if (!pos) { $('arrow').style.transform = 'rotate(0deg)'; txt.append(el('b', '', 'Set your position'), el('small', '', where + ' · copy your coords, press F11')); return; }
  const dx = t.x - pos.x, dy = t.y - pos.y, dist = Math.hypot(dx, dy);
  const deg = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  $('arrow').style.transform = `rotate(${deg}deg)`;
  const arrived = dist < 1.5;
  txt.append(el('b', '', arrived ? 'You have arrived' : `${DIRS[Math.round(deg / 45) % 8]} · ${dist.toFixed(1)} units`), el('small', '', where));
}

window.overlay.onState(s => {
  current = s;
  const sel = $('guide');
  if (sel.options.length !== s.guides.length) {
    sel.replaceChildren(...s.guides.map(g => { const o = el('option', '', g.title); o.value = g.id; return o; }));
  }
  sel.value = s.guide;
  $('posrow').className = s.clickThrough ? '' : 'edit';
  $('mode').textContent = s.clickThrough ? 'locked' : 'edit';
  $('mode').className = s.clickThrough ? '' : 'edit';
  renderStep(s);
});

$('pos').onkeydown = e => { if (e.key === 'Enter') window.overlay.setPos(e.target.value); };
$('guide').onchange = e => window.overlay.selectGuide(e.target.value);
$('menu').onclick = () => $('list').classList.toggle('open');
$('mode').onclick = () => window.overlay.toggleClickThrough();
$('quit').onclick = () => window.overlay.quit();

// FFXIV resets (UTC): daily 15:00, weekly Tuesday 08:00
function fmt(ms) { const m = Math.floor(ms / 60000); const d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60); return (d ? d + 'd ' : '') + h + 'h ' + (m % 60) + 'm'; }
function tickReset() {
  const now = new Date();
  let daily = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 15);
  if (daily <= now) daily += 864e5;
  let weekly = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8);
  weekly += ((2 - new Date(weekly).getUTCDay() + 7) % 7) * 864e5;
  if (weekly <= now) weekly += 7 * 864e5;
  $('reset').textContent = `Daily ${fmt(daily - now)} · Weekly ${fmt(weekly - now)}`;
}
tickReset();
setInterval(tickReset, 30000);
