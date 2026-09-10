const PANEL = 'http://127.0.0.1:3000';
const FLOW_URLS = ['https://flow.google.com/*', 'https://labs.google/fx/tools/flow*'];
let running = false;

async function inspect() {
  if (running) return;
  running = true;
  try {
    const { key } = await chrome.storage.session.get('key');
    if (!key) return;
    const tabs = await chrome.tabs.query({ url: FLOW_URLS });
    const states = await Promise.all(tabs.slice(0, 20).map(async tab => {
      try { return await chrome.tabs.sendMessage(tab.id, { type: 'inspect-flow' }); }
      catch { return { url: tab.url, editorDetected: false }; }
    }));
    const response = await fetch(`${PANEL}/api/bridge/heartbeat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ tabs: states }), signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(response.status === 401 ? 'Genera otra clave en el panel y vuelve a vincular.' : 'El panel rechazó la conexión.');
    await chrome.storage.session.set({ status: `Conectado · ${states.length} pestaña(s) de Flow`, checkedAt: Date.now() });
  } catch (error) {
    await chrome.storage.session.set({ status: error.message === 'Failed to fetch' ? 'Abre el panel local e intenta otra vez.' : error.message, checkedAt: Date.now() });
  } finally { running = false; }
}

chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'flow-bridge') inspect(); });
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL('popup.html')) return;
  (async () => {
    if (message.type === 'pair') {
      if (!/^[a-f0-9]{64}$/.test(message.key || '')) throw new Error('Copia la clave completa del panel.');
      await chrome.storage.session.set({ key: message.key });
      await chrome.alarms.create('flow-bridge', { periodInMinutes: 0.5 });
    } else if (message.type === 'disconnect') {
      await chrome.alarms.clear('flow-bridge');
      await chrome.storage.session.clear();
      return { status: 'Desconectado' };
    } else if (message.type !== 'inspect') throw new Error('Acción desconocida');
    await inspect();
    return await chrome.storage.session.get(['status', 'checkedAt']);
  })().then(reply).catch(error => reply({ status: error.message }));
  return true;
});
