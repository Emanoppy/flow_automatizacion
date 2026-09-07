const express = require('express');
const path = require('path');
const { createJob, getJob } = require('./lib/jobRunner');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/jobs', (req, res) => {
  const { producto, formato, modelo, duracion, referencias, escenas } = req.body;

  if (!producto || !Array.isArray(escenas) || escenas.length === 0) {
    return res.status(400).json({ error: 'Falta producto o escenas.' });
  }

  const job = createJob({
    producto,
    formato: formato || '9:16',
    modelo: modelo || 'Veo 3.1 Fast',
    duracion: duracion || '8 segundos',
    referencias: referencias || [],
    escenas,
  });

  res.json({ id: job.id });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job no encontrado' });

  res.json({
    id: job.id,
    escenas: job.escenas.map((e) => ({
      numero: e.numero,
      estadoImagen: e.estadoImagen,
      estadoVideo: e.estadoVideo,
      error: e.error,
    })),
    zipReady: job.zipReady,
    error: job.error,
  });
});

app.get('/api/jobs/:id/download', (req, res) => {
  const job = getJob(req.params.id);
  if (!job || !job.zipReady) return res.status(404).json({ error: 'ZIP no disponible aun' });

  res.download(job.zipPath);
});

app.listen(PORT, () => {
  console.log(`Casa Nova Creative Factory corriendo en http://localhost:${PORT}`);
});
