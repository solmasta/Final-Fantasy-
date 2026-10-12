const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('overlay', {
  onState: cb => ipcRenderer.on('state', (_e, s) => cb(s)),
  selectGuide: id => ipcRenderer.send('select-guide', id),
  gotoStep: i => ipcRenderer.send('goto-step', i),
  toggleClickThrough: () => ipcRenderer.send('toggle-click-through'),
  setPos: t => ipcRenderer.send('set-pos', t),
  quit: () => ipcRenderer.send('quit')
});
