const { randomBytes, timingSafeEqual } = require('node:crypto');

function createBrowserBridge({ now = Date.now } = {}) {
  let key = randomBytes(32).toString('hex');
  let latest = null;
  function authorized(value) {
    const expected = Buffer.from(`Bearer ${key}`);
    const supplied = Buffer.from(typeof value === 'string' ? value : '');
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  }
  return {
    pair() {
      key = randomBytes(32).toString('hex');
      latest = null;
      return { key };
    },
    authorized,
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
      latest = { tabs, seenAt: now() };
    },
    status() {
      if (!latest || now() - latest.seenAt > 45000) {
        return { state: 'disconnected', tabs: [], seenAt: latest?.seenAt || null, generationAvailable: false };
      }
      return { state: latest.tabs.some(t => t.editorDetected) ? 'editor_detected' : 'browser_connected',
        ...latest, generationAvailable: false };
    },
  };
}

module.exports = { createBrowserBridge };
