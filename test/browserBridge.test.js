const test = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserBridge } = require('../server/lib/browserBridge');

test('vinculación rota la clave y desconecta sesiones anteriores', () => {
  const bridge = createBrowserBridge();
  const first = bridge.pair();
  assert.equal(bridge.authorized(`Bearer ${first.key}`), true);
  assert.equal(bridge.authorized(''), false);
  bridge.pair();
  assert.equal(bridge.authorized(`Bearer ${first.key}`), false);
});
test('una señal expirada no se presenta como conexión activa', () => {
  let now = 1000;
  const bridge = createBrowserBridge({ now: () => now });
  bridge.receive({ tabs: [{ url: 'https://flow.google.com/project/f95173f2-fbd4-492a-ab8c-921d56b667e3?secret=ignored', editorDetected: true }] });
  assert.equal(bridge.status().state, 'editor_detected');
  assert.equal(bridge.status().tabs[0].url.includes('?'), false);
  assert.equal(bridge.status().generationAvailable, false);
  now += 45001;
  assert.equal(bridge.status().state, 'disconnected');
  assert.deepEqual(bridge.status().tabs, []);
});
test('rechaza destinos externos y conserva solo campos permitidos', () => {
  const bridge = createBrowserBridge();
  assert.throws(() => bridge.receive({ tabs: [{ url: 'https://evil.example/' }] }));
  assert.throws(() => bridge.receive({ tabs: [{ url: 'https://flow.google.com.evil.example/' }] }));
  assert.throws(() => bridge.receive({ tabs: null }));
  bridge.receive({ tabs: [{ url: 'https://flow.google.com/', email: 'private', cookie: 'private' }] });
  assert.equal(JSON.stringify(bridge.status()).includes('private'), false);
});
