const bridgeStatus = document.getElementById('bridge-status');
const bridgeDetail = document.getElementById('bridge-detail');
let currentCommandId = null;
async function refreshBridge() {
  try {
    const response = await fetch('/api/bridge/status', { cache: 'no-store' });
    if (!response.ok) throw new Error();
    const state = await response.json();
    const labels = { disconnected: 'Puente desconectado', browser_connected: 'Puente conectado · abre un proyecto de Flow', editor_detected: 'Puente conectado · editor de Flow detectado' };
    bridgeStatus.textContent = labels[state.state] || 'Estado desconocido';
    bridgeStatus.dataset.connected = String(state.state !== 'disconnected');
    const project = state.tabs.find(tab => tab.projectId);
    const select = document.getElementById('bridge-project');
    const selected = select.value;
    select.replaceChildren();
    for (const tab of state.tabs.filter(t => t.projectId && t.editorDetected)) {
      if ([...select.options].some(o => o.value === tab.url)) continue;
      const option = document.createElement('option'); option.value = tab.url; option.textContent = tab.projectId; select.append(option);
    }
    if ([...select.options].some(o => o.value === selected)) select.value = selected;
    const busy = ['queued', 'sent', 'submitted', 'uncertain'].includes(state.command?.state);
    document.getElementById('prepare-prompt').disabled = !['0.2.0', '0.3.0'].includes(state.version) || !select.value || busy;
    document.getElementById('generate-image').disabled = state.version !== '0.3.0' || !select.value || busy;
    currentCommandId = state.command?.id;
    document.getElementById('close-command').hidden = !['submitted', 'uncertain', 'error'].includes(state.command?.state);
    const messages = { queued: 'En cola. La extensión recogerá el prompt en hasta 30 segundos.', sent: 'Enviado. Esperando confirmación de Flow.', prepared: 'Prompt colocado en Flow. No se ha pulsado Generar.', error: state.command?.error, uncertain: 'Sin confirmación. Revisa Flow antes de repetir.', expired: 'El envío caducó. Vuelve a conectar el puente.' };
    messages.submitted = 'Se pulsó Generar en Flow. Revisa allí el resultado; aún no se ha verificado ni descargado la imagen.';
    messages.closed = 'Seguimiento cerrado por el usuario. Puedes enviar otra operación.';
    if (state.command) document.getElementById('command-status').textContent = messages[state.command.state] || state.command.state;
    bridgeDetail.textContent = project ? `Proyecto: ${project.projectId}. Generación automática pendiente de conectar.` : 'La sesión de Google permanece en tu navegador. La conexión se comprueba cada 30 segundos.';
  } catch { bridgeStatus.textContent = 'No se puede contactar con el servidor local'; }
  finally { setTimeout(refreshBridge, 1000); }
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

document.getElementById('generate-image').addEventListener('click', async event => {
  event.target.disabled = true;
  try {
    const response = await fetch('/api/bridge/generate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: document.getElementById('bridge-project').value, prompt: document.getElementById('bridge-prompt').value, format: document.getElementById('image-format').value }) });
    const result = await response.json();
    document.getElementById('command-status').textContent = response.ok ? 'Generación en cola. Mantén abierto Flow y no cambies sus ajustes.' : result.error;
  } catch { document.getElementById('command-status').textContent = 'No se pudo contactar con el servidor.'; }
});
document.getElementById('close-command').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/bridge/close', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: currentCommandId }) });
    if (!response.ok) throw new Error();
  } catch { document.getElementById('command-status').textContent = 'No se pudo cerrar el seguimiento.'; }
});
document.getElementById('copy-bridge-key').addEventListener('click', async event => {
  try {
    await navigator.clipboard.writeText(document.getElementById('bridge-key').value);
    event.target.textContent = 'Clave copiada';
  } catch { event.target.textContent = 'Selecciona el campo y copia con Ctrl+C'; }
});
refreshBridge();

document.getElementById('prepare-prompt').addEventListener('click', async () => {
  const button = document.getElementById('prepare-prompt'); button.disabled = true;
  try {
    const response = await fetch('/api/bridge/prepare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: document.getElementById('bridge-project').value, prompt: document.getElementById('bridge-prompt').value }) });
    const result = await response.json();
    document.getElementById('command-status').textContent = response.ok ? 'Prompt en cola. Mantén Flow abierto.' : result.error;
  } catch { document.getElementById('command-status').textContent = 'No se pudo enviar. Comprueba el servidor.'; }
});
