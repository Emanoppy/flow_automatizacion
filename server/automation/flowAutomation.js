// Automatizacion real de Google Flow via Playwright.
// PENDIENTE: mapear selectores reales (cuadro de prompt, boton generar,
// subida de imagen de referencia, boton de descarga) con capturas de Flow.
// Mientras tanto, generateImage/generateVideo usan mockAssets para que el
// resto del pipeline (panel, progreso, ZIP) sea probable de punta a punta.

const path = require('path');
const { writeMockImage, writeMockVideo } = require('../lib/mockAssets');

const MOCK_DELAY_MS = 1500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateImage({ prompt, referencias, outDir }) {
  await delay(MOCK_DELAY_MS);
  const imagePath = path.join(outDir, 'imagen.png');
  writeMockImage(imagePath);
  return { imagePath };
}

async function generateVideo({ imagePath, prompt, formato, modelo, duracion, outDir }) {
  await delay(MOCK_DELAY_MS);
  const videoPath = path.join(outDir, 'video.mp4');
  writeMockVideo(videoPath);
  return { videoPath };
}

module.exports = { generateImage, generateVideo };
