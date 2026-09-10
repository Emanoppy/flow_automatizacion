const statusNode = document.getElementById('status');
async function send(type) {
  statusNode.textContent = 'Comprobando…';
  try {
    const result = await chrome.runtime.sendMessage({ type, key: document.getElementById('key').value.trim() });
    statusNode.textContent = result?.status || 'Genera una clave en el panel y vincula el puente.';
    if (type === 'pair') document.getElementById('key').value = '';
  } catch { statusNode.textContent = 'No se pudo contactar con el puente. Vuelve a abrir la extensión.'; }
}
for (const type of ['pair', 'inspect', 'disconnect']) document.getElementById(type).addEventListener('click', () => send(type));
chrome.storage.session.get('status').then(result => { statusNode.textContent = result.status || 'Sin vincular'; });
