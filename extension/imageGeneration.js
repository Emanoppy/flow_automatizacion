// Adaptador DOM para los controles observados en Flow. No usa API privada.
async function generateFlowImage(command) {
  const visible = el => el.getClientRects().length > 0;
  const label = el => (el.getAttribute('aria-label') || el.textContent || '').trim();
  const find = (selector, name) => {
    const matches = [...document.querySelectorAll(selector)].filter(el => visible(el) && label(el) === name);
    if (matches.length !== 1) throw new Error(`No se encontró un único control: ${name}`);
    return matches[0];
  };
  const wait = async check => {
    for (let i = 0; i < 40; i++) { if (check()) return; await new Promise(resolve => setTimeout(resolve, 100)); }
    throw new Error('Flow no confirmó el cambio de configuración.');
  };
  const current = () => location.origin + location.pathname;
  let clicked = false;
  try {
    if (current() !== command.url || !['9:16', '16:9', '1:1'].includes(command.format)) throw new Error('Proyecto o formato inválido.');
    if (typeof command.prompt !== 'string' || !command.prompt.trim() || command.prompt.length > 10000) throw new Error('Prompt inválido.');
    const settings = find('button', 'Activador de ajustes');
    const editors = [...document.querySelectorAll('[contenteditable="true"]')].filter(visible);
    if (editors.length !== 1) throw new Error('Cierra los diálogos de Flow antes de generar.');
    if (editors[0].innerText.trim() && editors[0].innerText.trim() !== command.prompt.trim()) throw new Error('Flow contiene otro prompt. No se sobrescribió.');
    const agent = [...document.querySelectorAll('[role="checkbox"],input[type="checkbox"]')].find(el => visible(el) && label(el) === 'Agente');
    if (agent && (agent.getAttribute('aria-checked') === 'true' || agent.checked)) throw new Error('Desactiva Agente en Flow para esta prueba.');
    settings.click();
    await wait(() => [...document.querySelectorAll('[role="radio"]')].some(el => visible(el) && label(el) === 'Imagen'));
    const select = async name => {
      find('[role="radio"]', name).click();
      await wait(() => find('[role="radio"]', name).getAttribute('aria-checked') === 'true');
    };
    await select('Imagen'); await select(command.format); await select('x1');
    if (!settings.textContent.includes('Nano Banana 2')) throw new Error('Selecciona Nano Banana 2 en Flow. Esta prueba solo admite ese modelo.');
    const costs = [...document.querySelectorAll('a')].filter(el => visible(el) && el.getAttribute('href')?.includes('g1_ai_credit_menu'));
    if (costs.length !== 1 || !/^0\s+puntos$/.test(label(costs[0]))) throw new Error('No se pudo verificar un costo de 0 puntos. No se generó.');
    settings.click();
    const editor = [...document.querySelectorAll('[contenteditable="true"]')].filter(visible);
    if (editor.length !== 1) throw new Error('Editor ambiguo.');
    if (!editor[0].innerText.trim()) {
      editor[0].focus();
      const range = document.createRange(); range.selectNodeContents(editor[0]);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      document.execCommand('insertText', false, command.prompt);
    }
    if (editor[0].innerText.trim() !== command.prompt.trim()) throw new Error('El texto no coincide con el prompt solicitado.');
    await wait(() => !find('button', 'Iniciar generación').disabled);
    if (current() !== command.url || !settings.textContent.includes('Nano Banana 2')) throw new Error('El proyecto o modelo cambió durante la preparación.');
    clicked = true;
    find('button', 'Iniciar generación').click();
    return { ok: true, submitted: true };
  } catch (error) {
    return { ok: false, uncertain: clicked, error: error.message };
  }
}
