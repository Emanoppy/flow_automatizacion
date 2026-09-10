const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');

test('el servidor protege la vinculación y no ejecuta generaciones simuladas como reales', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const request = (path, { method = 'GET', headers = {}, body } = {}) => new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, path, method,
      headers: { Host: '127.0.0.1:3000', 'Content-Type': 'application/json', ...headers } }, res => {
      let text = '';
      res.on('data', chunk => { text += chunk; });
      res.on('end', () => resolve({ code: res.statusCode, body: JSON.parse(text) }));
    });
    req.on('error', reject);
    req.end(body ? JSON.stringify(body) : undefined);
  });
  try {
    assert.equal((await request('/api/bridge/pair', { method: 'POST', headers: { Origin: 'https://evil.example' } })).code, 403);
    assert.equal((await request('/api/bridge/status', { headers: { Host: 'evil.example:3000' } })).code, 403);
    assert.equal((await request('/api/bridge/heartbeat', { method: 'POST', body: { tabs: [] } })).code, 401);
    const paired = await request('/api/bridge/pair', { method: 'POST' });
    const authorization = `Bearer ${paired.body.key}`;
    assert.equal((await request('/api/bridge/heartbeat', { method: 'POST', headers: { authorization }, body: { tabs: [{ url: 'https://flow.google.com/', editorDetected: false }] } })).code, 200);
    assert.equal((await request('/api/bridge/status')).body.state, 'browser_connected');
    assert.equal((await request('/api/jobs', { method: 'POST', body: { producto: 'Prueba', escenas: [{}] } })).code, 409);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
