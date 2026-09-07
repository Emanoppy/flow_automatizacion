const fs = require('fs');
const path = require('path');
const { generateImage, generateVideo } = require('../automation/flowAutomation');

const jobs = new Map();

function createJob({ producto, formato, modelo, duracion, referencias, escenas }) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
  const folderName = `${producto.replace(/[^a-zA-Z0-9_-]+/g, '_')}_${fecha}`;
  const outDir = path.join(__dirname, '..', '..', 'output', folderName);
  fs.mkdirSync(outDir, { recursive: true });

  const job = {
    id,
    producto,
    formato,
    modelo,
    duracion,
    referencias,
    outDir,
    folderName,
    escenas: escenas.map((e, i) => ({
      numero: i + 1,
      promptImagen: e.promptImagen,
      promptVideo: e.promptVideo,
      estadoImagen: 'pendiente',
      estadoVideo: 'pendiente',
      imagePath: null,
      videoPath: null,
      error: null,
    })),
    zipReady: false,
    zipPath: null,
    error: null,
  };

  jobs.set(id, job);
  runJob(job).catch((err) => {
    job.error = err.message;
  });

  return job;
}

async function runJob(job) {
  for (const escena of job.escenas) {
    const escenaDir = path.join(job.outDir, String(escena.numero).padStart(2, '0'));
    fs.mkdirSync(escenaDir, { recursive: true });

    try {
      escena.estadoImagen = 'generando';
      const { imagePath } = await generateImage({
        prompt: escena.promptImagen,
        referencias: job.referencias,
        outDir: escenaDir,
      });
      escena.imagePath = imagePath;
      escena.estadoImagen = 'listo';

      escena.estadoVideo = 'generando';
      const { videoPath } = await generateVideo({
        imagePath,
        prompt: escena.promptVideo,
        formato: job.formato,
        modelo: job.modelo,
        duracion: job.duracion,
        outDir: escenaDir,
      });
      escena.videoPath = videoPath;
      escena.estadoVideo = 'listo';
    } catch (err) {
      escena.error = err.message;
      if (escena.estadoImagen === 'generando') escena.estadoImagen = 'error';
      if (escena.estadoVideo === 'generando') escena.estadoVideo = 'error';
    }
  }

  const { buildZip } = require('./zipExporter');
  job.zipPath = await buildZip(job.outDir, job.folderName);
  job.zipReady = true;
}

function getJob(id) {
  return jobs.get(id);
}

module.exports = { createJob, getJob };
