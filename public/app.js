const escenasContainer = document.getElementById('escenas');
const addEscenaBtn = document.getElementById('add-escena');
const generarBtn = document.getElementById('generar');
const progresoSection = document.getElementById('progreso');
const listaProgreso = document.getElementById('lista-progreso');
const descargarLink = document.getElementById('descargar');

let escenaCount = 0;

function addEscena() {
  escenaCount += 1;
  const div = document.createElement('div');
  div.className = 'escena';
  div.dataset.numero = escenaCount;
  div.innerHTML = `
    <h3>ESCENA ${String(escenaCount).padStart(2, '0')}</h3>
    <label>Prompt Imagen
      <textarea class="prompt-imagen" placeholder="Ej: frasco de Lymphatic Drainage sobre mesada de madera, luz natural..."></textarea>
    </label>
    <label>Prompt Video
      <textarea class="prompt-video" placeholder="Ej: la mano de una mujer toma el frasco y lo muestra a cámara..."></textarea>
    </label>
  `;
  escenasContainer.appendChild(div);
}

addEscenaBtn.addEventListener('click', addEscena);

// arrancar con 3 escenas por defecto
addEscena();
addEscena();
addEscena();

function recolectarEscenas() {
  return [...escenasContainer.querySelectorAll('.escena')].map((div) => ({
    promptImagen: div.querySelector('.prompt-imagen').value.trim(),
    promptVideo: div.querySelector('.prompt-video').value.trim(),
  }));
}

function renderProgreso(escenas) {
  listaProgreso.innerHTML = '';
  const iconos = { pendiente: '○', generando: '⏳', listo: '✅', error: '✖' };

  escenas.forEach((e) => {
    const fila = document.createElement('div');
    fila.className = 'fila-progreso';
    fila.innerHTML = `
      <span>${String(e.numero).padStart(2, '0')}</span>
      <span class="estado-${e.estadoImagen}">${iconos[e.estadoImagen]} Imagen</span>
      <span class="estado-${e.estadoVideo}">${iconos[e.estadoVideo]} Video</span>
    `;
    listaProgreso.appendChild(fila);
  });
}

async function pollJob(id) {
  const res = await fetch(`/api/jobs/${id}`);
  const job = await res.json();
  renderProgreso(job.escenas);

  if (job.zipReady) {
    descargarLink.href = `/api/jobs/${id}/download`;
    descargarLink.hidden = false;
    return;
  }

  if (job.error) {
    alert(`Error generando el lote: ${job.error}`);
    return;
  }

  setTimeout(() => pollJob(id), 1200);
}

generarBtn.addEventListener('click', async () => {
  const producto = document.getElementById('producto').value.trim();
  const escenas = recolectarEscenas().filter((e) => e.promptImagen || e.promptVideo);

  if (!producto) {
    alert('Falta el nombre del producto.');
    return;
  }
  if (escenas.length === 0) {
    alert('Agregá al menos una escena con prompts.');
    return;
  }

  const referenciasInput = document.getElementById('referencias');
  const referencias = [...referenciasInput.files].map((f) => f.name);

  generarBtn.disabled = true;
  generarBtn.textContent = 'Generando...';

  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      producto,
      formato: document.getElementById('formato').value,
      modelo: document.getElementById('modelo').value,
      duracion: document.getElementById('duracion').value,
      referencias,
      escenas,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(`Error: ${err.error}`);
    generarBtn.disabled = false;
    generarBtn.textContent = '🚀 GENERAR TODO';
    return;
  }

  const { id } = await res.json();
  progresoSection.hidden = false;
  pollJob(id);
});
