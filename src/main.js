const { app, BrowserWindow, clipboard, globalShortcut, ipcMain, screen } = require('electron');
const fs = require('fs');
const path = require('path');

const GUIDES_DIR = path.join(__dirname, '..', 'guides');
const OPACITIES = [1, 0.8, 0.6, 0.4];

let win;
let state = { guide: null, step: 0, opacityIdx: 1, clickThrough: true, visible: true, bounds: null, pos: null };
let statePath;

function loadState() {
  try { state = { ...state, ...JSON.parse(fs.readFileSync(statePath, 'utf8')) }; } catch {}
}
function saveState() {
  try { fs.writeFileSync(statePath, JSON.stringify(state)); } catch {}
}

function listGuides() {
  return fs.readdirSync(GUIDES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const g = JSON.parse(fs.readFileSync(path.join(GUIDES_DIR, f), 'utf8'));
        return { id: f, title: g.title, steps: g.steps };
      } catch (e) { return { id: f, title: f + ' (invalid)', steps: [] }; }
    });
}

function push() {
  if (!win) return;
  win.webContents.send('state', { ...state, guides: listGuides(), opacity: OPACITIES[state.opacityIdx] });
  win.setIgnoreMouseEvents(state.clickThrough, { forward: true });
  win.setOpacity(OPACITIES[state.opacityIdx]);
  saveState();
}

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  const b = state.bounds || { width: 380, height: 520, x: workArea.x + workArea.width - 400, y: workArea.y + 40 };
  win = new BrowserWindow({
    ...b,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: true,
    focusable: false, // never steal focus from the game
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, 'overlay.html'));
  win.webContents.on('did-finish-load', push);
  const saveBounds = () => { state.bounds = win.getBounds(); saveState(); };
  win.on('moved', saveBounds);
  win.on('resized', saveBounds);
}

function step(delta, guide) {
  const g = listGuides().find(x => x.id === state.guide);
  if (!g) return;
  state.step = Math.max(0, Math.min(g.steps.length - 1, state.step + delta));
  push();
}

// Accepts "12.3, 14.5", "( 12.3 , 14.5 )", "X: 12.3 Y: 14.5" etc.
function parseCoords(text) {
  const m = String(text).match(/(-?\d+(?:\.\d+)?)\D+?(-?\d+(?:\.\d+)?)/);
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
}

function registerHotkeys() {
  const keys = {
    'F6': () => step(-1),
    'F7': () => step(1),
    'F8': () => { state.visible = !state.visible; state.visible ? win.showInactive() : win.hide(); saveState(); },
    'F9': () => { state.clickThrough = !state.clickThrough; push(); },
    'F11': () => { const p = parseCoords(clipboard.readText()); if (p) { state.pos = p; push(); } },
    'F10': () => { state.opacityIdx = (state.opacityIdx + 1) % OPACITIES.length; push(); }
  };
  for (const [k, fn] of Object.entries(keys)) globalShortcut.register(k, fn);
}

ipcMain.on('select-guide', (_e, id) => { state.guide = id; state.step = 0; push(); });
ipcMain.on('goto-step', (_e, i) => { state.step = i; push(); });
ipcMain.on('toggle-click-through', () => { state.clickThrough = !state.clickThrough; push(); });
ipcMain.on('set-pos', (_e, text) => { state.pos = parseCoords(text); push(); });
ipcMain.on('quit', () => app.quit());

app.whenReady().then(() => {
  statePath = path.join(app.getPath('userData'), 'state.json');
  loadState();
  if (!state.guide) { const g = listGuides()[0]; if (g) state.guide = g.id; }
  createWindow();
  registerHotkeys();
  if (!state.visible) win.hide();
});
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
