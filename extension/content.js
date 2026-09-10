// Solo diagnóstico de controles visibles. No lee cookies ni datos de la cuenta.
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id) return;
  if (message?.type === 'prepare-prompt') {
    const current = location.origin + location.pathname;
    if (message.url !== current || typeof message.prompt !== 'string' || message.prompt.length > 10000) {
      reply({ ok: false, error: 'La pestaña cambió de proyecto.' }); return;
    }
    const editors = [...document.querySelectorAll('[contenteditable="true"]')].filter(el => el.getClientRects().length);
    if (editors.length !== 1) { reply({ ok: false, error: 'No se encontró un único editor de prompt. Cierra diálogos de Flow.' }); return; }
    const editor = editors[0];
    if (editor.innerText.trim()) { reply({ ok: false, error: 'Flow ya contiene un prompt. Vacíalo antes de enviar otro.' }); return; }
    editor.focus();
    const selection = window.getSelection();
    const range = document.createRange(); range.selectNodeContents(editor);
    selection.removeAllRanges(); selection.addRange(range);
    document.execCommand('insertText', false, message.prompt);
    reply({ ok: editor.innerText.trim() === message.prompt.trim(), error: 'Flow no confirmó el texto completo.' });
    return;
  }
  if (message?.type !== 'inspect-flow') return;
  const controls = [...document.querySelectorAll('button')].filter(button => button.getClientRects().length);
  const editorDetected = controls.some(button =>
    /^(Iniciar generación|Start generation|Generate)$/i.test((button.getAttribute('aria-label') || button.textContent).trim()));
  reply({ url: location.origin + location.pathname, editorDetected });
});
