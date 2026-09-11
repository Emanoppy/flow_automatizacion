const { randomBytes, timingSafeEqual } = require('node:crypto');

function createBrowserBridge({ now = Date.now } = {}) {
  let key = randomBytes(32).toString('hex');
  let latest = null;
  let command = null;
  function authorized(value) {
    const expected = Buffer.from(`Bearer ${key}`);
    const supplied = Buffer.from(typeof value === 'string' ? value : '');
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  }
  return {
    pair() {
      key = randomBytes(32).toString('hex');
      latest = null;
      command = null;
      return { key };
    },
    authorized,
    enqueue({ url, prompt, type = 'prepare-prompt', format = '9:16' }) {
      if (!['prepare-prompt', 'generate-image'].includes(type)) throw new Error('Operación inválida.');
      if (!latest || now() - latest.seenAt > 45000 || !['0.2.0', '0.3.0'].includes(latest.version)) throw new Error('Actualiza y conecta la extensión.');
      if (type === 'generate-image' && latest.version !== '0.3.0') throw new Error('La generación requiere la extensión 0.3.0.');
      if (!['9:16', '16:9', '1:1'].includes(format)) throw new Error('Formato inválido.');
      if (command?.type === 'generate-image' && ['sent', 'submitted', 'uncertain'].includes(command.state)) throw new Error('Revisa la generación anterior en Flow antes de cerrar su seguimiento.');
      if (!latest.tabs.some(t => t.url === url && t.editorDetected)) throw new Error('El proyecto ya no está disponible.');
      if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 10000) throw new Error('Escribe un prompt de hasta 10000 caracteres.');
      if (command && ['queued', 'sent'].includes(command.state) && now() - command.createdAt < 90000) throw new Error('Ya hay un envío pendiente.');
      command = { id: randomBytes(16).toString('hex'), type, format, url, prompt: prompt.trim(), state: 'queued', createdAt: now() };
      return { id: command.id };
    },
    next() {
      if (!command || command.state !== 'queued') return null;
      if (now() - command.createdAt > 90000) { command.state = 'expired'; return null; }
      command.state = 'sent';
      return { id: command.id, type: command.type, format: command.format, url: command.url, prompt: command.prompt };
    },
    receive(data) {
      if (!data || !Array.isArray(data.tabs) || data.tabs.length > 20) throw new Error('Estado inválido');
      const tabs = data.tabs.map((tab) => {
        if (!tab || typeof tab.url !== 'string') throw new Error('Pestaña inválida');
        const url = new URL(tab.url);
        if (url.origin !== 'https://flow.google.com' &&
            !(url.origin === 'https://labs.google' && url.pathname.startsWith('/fx/tools/flow'))) {
          throw new Error('Solo se admite Flow');
        }
        const project = url.pathname.match(/\/project\/([a-f0-9-]{36})(?:\/|$)/i);
        return {
          url: url.origin + url.pathname,
          projectId: project ? project[1] : null,
          editorDetected: tab.editorDetected === true,
        };
      });
      latest = { tabs, seenAt: now(), version: ['0.2.0', '0.3.0'].includes(data.version) ? data.version : '0.1.0' };
      if (data.result && command && command.state === 'sent' && data.result.id === command.id) {
        command.state = data.result.uncertain === true ? 'uncertain' : data.result.ok === true ? (command.type === 'generate-image' ? 'submitted' : 'prepared') : 'error';
        command.error = data.result.ok === true ? null : String(data.result.error || 'No se pudo preparar el prompt.').slice(0, 300);
      }
    },
    close(id) {
      if (!command || command.id !== id || !['submitted', 'uncertain', 'error'].includes(command.state)) throw new Error('No hay un seguimiento que cerrar.');
      command.state = 'closed';
    },
    status() {
      if (command && ['queued', 'sent'].includes(command.state) && now() - command.createdAt > 90000) command.state = 'uncertain';
      const commandStatus = command ? { id: command.id, state: command.state, error: command.error || null } : null;
      if (!latest || now() - latest.seenAt > 45000) {
        return { state: 'disconnected', tabs: [], seenAt: latest?.seenAt || null, generationAvailable: false, command: commandStatus };
      }
      return { state: latest.tabs.some(t => t.editorDetected) ? 'editor_detected' : 'browser_connected',
        ...latest, generationAvailable: false, command: commandStatus };
    },
  };
}

module.exports = { createBrowserBridge };
