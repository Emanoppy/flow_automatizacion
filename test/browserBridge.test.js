const test = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserBridge } = require('../server/lib/browserBridge');

test('envío único, proyecto explícito y confirmación por identificador', () => {
  let time = 1000;
  const bridge = createBrowserBridge({ now: () => time });
  const url = 'https://flow.google.com/project/f95173f2-fbd4-492a-ab8c-921d56b667e3';
  const state = { version: '0.2.0', tabs: [{ url, editorDetected: true }] };
  bridge.receive(state);
  assert.throws(() => bridge.enqueue({ url: 'https://flow.google.com/', prompt: 'test' }));
  const { id } = bridge.enqueue({ url, prompt: 'Una botella azul' });
  assert.throws(() => bridge.enqueue({ url, prompt: 'duplicado' }));
  assert.equal(bridge.next().id, id);
  assert.equal(bridge.next(), null);
  bridge.receive({ ...state, result: { id: 'incorrecto', ok: true } });
  assert.equal(bridge.status().command.state, 'sent');
  bridge.receive({ ...state, result: { id, ok: true } });
  assert.equal(bridge.status().command.state, 'prepared');
  bridge.enqueue({ url, prompt: 'Otro' });
  bridge.next(); time += 90001;
  assert.equal(bridge.status().command.state, 'uncertain');
  assert.equal(bridge.next(), null);
});

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
