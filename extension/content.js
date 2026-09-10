// Solo diagnóstico de controles visibles. No lee cookies ni datos de la cuenta.
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id || message?.type !== 'inspect-flow') return;
  const controls = [...document.querySelectorAll('button')].filter(button => button.getClientRects().length);
  const editorDetected = controls.some(button =>
    /^(Iniciar generación|Start generation|Generate)$/i.test((button.getAttribute('aria-label') || button.textContent).trim()));
  reply({ url: location.origin + location.pathname, editorDetected });
});
