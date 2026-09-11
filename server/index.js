const express = require('express');
const path = require('path');
const { createJob, getJob } = require('./lib/jobRunner');
const { createBrowserBridge } = require('./lib/browserBridge');

const app = express();
const PORT = process.env.PORT || 3000;
const bridge = createBrowserBridge();

app.use((req, res, next) => {
  if (![`127.0.0.1:${PORT}`, `localhost:${PORT}`].includes(req.headers.host)) {
    return res.status(403).json({ error: 'Acceso local requerido.' });
  }
  if (req.path !== '/api/bridge/heartbeat') {
    const origin = req.headers.origin;
    if ((origin && origin !== `http://${req.headers.host}`) ||
        ['cross-site', 'same-site'].includes(req.headers['sec-fetch-site'])) {
      return res.status(403).json({ error: 'Abre el panel local directamente.' });
    }
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/bridge/status', (req, res) => {
  res.set('Cache-Control', 'no-store').json(bridge.status());
});
app.post('/api/bridge/pair', (req, res) => {
  res.set('Cache-Control', 'no-store').json(bridge.pair());
});
app.post('/api/bridge/heartbeat', (req, res) => {
  if (!bridge.authorized(req.headers.authorization)) return res.status(401).json({ error: 'Vuelve a vincular el puente.' });
  try {
    bridge.receive(req.body);
    res.json({ ok: true, command: bridge.next() });
  } catch {
    res.status(400).json({ error: 'Estado del navegador inválido.' });
  }
});

app.post('/api/bridge/prepare', (req, res) => {
  try { res.json(bridge.enqueue({ ...req.body, type: 'prepare-prompt' })); }
  catch (error) { res.status(409).json({ error: error.message }); }
});
app.post('/api/bridge/generate-image', (req, res) => {
  try { res.json(bridge.enqueue({ ...req.body, type: 'generate-image' })); }
  catch (error) { res.status(409).json({ error: error.message }); }
});
app.post('/api/bridge/close', (req, res) => {
  try { bridge.close(req.body.id); res.json({ ok: true }); }
  catch (error) { res.status(409).json({ error: error.message }); }
});

app.post('/api/jobs', (req, res) => {
  if (req.body.demo !== true) {
    return res.status(409).json({ error: 'La generación real todavía no está conectada. Activa la demostración para probar el panel.' });
  }
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

if (require.main === module) {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Casa Nova Creative Factory corriendo en http://127.0.0.1:${PORT}`);
  });
}
module.exports = app;
