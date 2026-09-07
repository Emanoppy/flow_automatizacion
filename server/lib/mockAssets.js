const fs = require('fs');

const PLACEHOLDER_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAGUlEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAO4GECAAAaOK1PMAAAAASUVORK5CYII=';

function writeMockImage(destPath) {
  fs.writeFileSync(destPath, Buffer.from(PLACEHOLDER_PNG_BASE64, 'base64'));
}

function writeMockVideo(destPath) {
  fs.writeFileSync(
    destPath,
    'MOCK VIDEO FILE — reemplazar por la automatizacion real de Flow (server/automation/flowAutomation.js)\n'
  );
}

module.exports = { writeMockImage, writeMockVideo };
