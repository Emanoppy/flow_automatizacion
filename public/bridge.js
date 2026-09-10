const bridgeStatus = document.getElementById('bridge-status');
const bridgeDetail = document.getElementById('bridge-detail');
async function refreshBridge() {
  try {
    const response = await fetch('/api/bridge/status', { cache: 'no-store' });
    if (!response.ok) throw new Error();
    const state = await response.json();
    const labels = { disconnected: 'Puente desconectado', browser_connected: 'Puente conectado · abre un proyecto de Flow', editor_detected: 'Puente conectado · editor de Flow detectado' };
    bridgeStatus.textContent = labels[state.state] || 'Estado desconocido';
    bridgeStatus.dataset.connected = String(state.state !== 'disconnected');
    const project = state.tabs.find(tab => tab.projectId);
    bridgeDetail.textContent = project ? `Proyecto: ${project.projectId}. Generación automática pendiente de conectar.` : 'La sesión de Google permanece en tu navegador. La conexión se comprueba cada 30 segundos.';
  } catch { bridgeStatus.textContent = 'No se puede contactar con el servidor local'; }
  finally { setTimeout(refreshBridge, 5000); }
}
document.getElementById('pair-bridge').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/bridge/pair', { method: 'POST' });
    if (!response.ok) throw new Error();
    const { key } = await response.json();
    document.getElementById('bridge-key').value = key;
    document.getElementById('pair-result').hidden = false;
    bridgeStatus.textContent = 'Clave creada. Pégala en la extensión para conectar.';
  } catch { bridgeStatus.textContent = 'No se pudo crear la clave. Comprueba el servidor.'; }
});
document.getElementById('copy-bridge-key').addEventListener('click', async event => {
  try {
    await navigator.clipboard.writeText(document.getElementById('bridge-key').value);
    event.target.textContent = 'Clave copiada';
  } catch { event.target.textContent = 'Selecciona el campo y copia con Ctrl+C'; }
});
refreshBridge();
