const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
for (const [cost, model, prompt, expected] of [['0 puntos', 'Nano Banana 2', 'Botella', true], ['7 puntos', 'Nano Banana 2', 'Botella', false], ['0 puntos', 'Otro modelo', 'Botella', false], ['0 puntos', 'Nano Banana 2', 'Otro texto', false]]) {
  test(`adaptador: costo=${cost}, modelo=${model}, texto=${prompt}`, async () => {
    let clicks = 0;
    const node = (text, attributes = {}) => ({ textContent: text, getClientRects: () => [1], getAttribute: key => attributes[key] ?? null, click() { attributes['aria-checked'] = 'true'; } });
    const settings = node(model, { 'aria-label': 'Activador de ajustes' });
    const generate = node('', { 'aria-label': 'Iniciar generación' });
    generate.click = () => { clicks++; }; generate.disabled = false;
    const editor = { ...node(''), innerText: prompt };
    const elements = { button: [settings, generate], '[role="radio"]': ['Imagen', '9:16', 'x1'].map(t => node(t)), '[contenteditable="true"]': [editor], a: [node(cost, { href: 'https://support.google.com/googleone?p=g1_ai_credit_menu' })] };
    const context = vm.createContext({ document: { querySelectorAll: selector => elements[selector] || [] }, location: { origin: 'https://flow.google.com', pathname: '/project/test' }, setTimeout });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../extension/imageGeneration.js'), 'utf8'), context);
    const result = await vm.runInContext("generateFlowImage({url:'https://flow.google.com/project/test',format:'9:16',prompt:'Botella'})", context);
    assert.equal(result.ok, expected);
    assert.equal(clicks, expected ? 1 : 0);
  });
}
