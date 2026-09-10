const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

for (const failAck of [false, true]) {
  test(`confirma sin esperar otro pulso; fallo de aviso=${failAck}`, async () => {
    const url = 'https://flow.google.com/project/f95173f2-fbd4-492a-ab8c-921d56b667e3';
    const storage = { key: 'test-key' };
    const requests = [];
    let writes = 0;
    const context = vm.createContext({ URL, AbortSignal, Date,
      chrome: {
        storage: { session: {
          get: async () => ({ ...storage }),
          set: async value => Object.assign(storage, value),
          remove: async key => { delete storage[key]; },
        } },
        tabs: { query: async () => [{ id: 1, url }], sendMessage: async (id, message) => {
          if (message.type === 'inspect-flow') return { url, editorDetected: true };
          writes++; return { ok: true };
        } },
        alarms: { onAlarm: { addListener() {} } },
        runtime: { onMessage: { addListener() {} } },
      },
      fetch: async (url, options) => {
        requests.push(JSON.parse(options.body));
        if (requests.length === 2 && failAck) throw new Error('Network unavailable');
        return { ok: true, json: async () => ({ command: requests.length === 1 ? { id: 'job-1', type: 'prepare-prompt', url: requests[0].tabs[0].url, prompt: 'test' } : null }) };
      },
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../extension/background.js'), 'utf8'), context);
    await vm.runInContext('inspect()', context);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].result.id, 'job-1');
    assert.equal(requests[1].result.ok, true);
    assert.equal(writes, 1);
    assert.equal(Boolean(storage.pendingResult), failAck);
    if (failAck) {
      await vm.runInContext('inspect()', context);
      assert.equal(requests[2].result.id, 'job-1');
      assert.equal(writes, 1, 'Reintenta solo el aviso, nunca la escritura');
      assert.equal(storage.pendingResult, undefined);
    }
  });
}
