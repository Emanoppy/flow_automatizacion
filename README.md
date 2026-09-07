# Casa Nova Creative Factory

Panel local para producir creativos de video con IA (Google Flow) en lote, sin copiar/pegar prompt por prompt.

## El problema que resuelve

Flujo actual (manual):

```
Prompt (Claude) → pegar en Flow → generar imagen → esperar → descargar
                → pegar prompt de video → generar video → esperar → descargar
                → repetir por cada escena → repetir por cada creativo
```

Flujo con esta herramienta:

```
Pegás todos los prompts de una vez (producto, imágenes de referencia, escenas)
        ↓
La herramienta automatiza tu sesión de Flow: genera cada imagen,
la usa como base para el video correspondiente, y descarga todo
        ↓
Te entrega una carpeta/ZIP lista: 01/imagen.png + 01/video.mp4, 02/..., etc.
        ↓
Vos solo elegís los mejores creativos y editás en CapCut
```

## Por qué este enfoque (híbrido)

Se evaluaron 3 caminos:

| Opción | Usa tus créditos de Flow | Robustez |
|---|---|---|
| App propia con API (Gemini/Veo directo) | ❌ No, se paga aparte por uso | Máxima |
| Bot que controla el navegador de Flow | ✅ Sí | Media (frágil a cambios de UI) |
| **Híbrido: panel propio + automatiza Flow** ✅ elegido | ✅ Sí | Media-alta |

Se eligió el híbrido porque conserva el plan de Flow ya pagado, el historial de proyectos, y evita facturación adicional de la API de Google mientras el volumen de generación lo permita.

## Estado del proyecto

- [x] Repo conectado y estructura base
- [ ] Diseño del panel (UI) — producto, imágenes de referencia, escenas con prompt de imagen + prompt de video
- [ ] Automatización de Flow con Playwright (**pendiente: necesita capturas de pantalla de la interfaz real de Flow** para mapear los selectores — cuadro de prompt, botón de generar, subida de imagen de referencia, botón de descarga)
- [ ] Empaquetado en ZIP con estructura `Producto_DD-MM-AAAA/01/imagen.png,video.mp4/...`
- [ ] Seguimiento de progreso en vivo (✅ / ⏳ / ○ por escena)

## Arquitectura

```
server/
  index.js              Servidor Express local
  automation/            Playwright: controla la sesión de Flow
  lib/zipExporter.js     Arma el ZIP final
public/
  index.html             Panel (producto, referencias, escenas, botón "Generar todo")
  app.js / styles.css
output/                  Carpetas/ZIPs generados (no se versiona)
```

## Cómo correr (en desarrollo)

```bash
npm install
npm start
```

Abre `http://localhost:3000`.

## Cómo funciona Flow (confirmado con la documentación oficial + capturas reales)

- URL: `https://labs.google/fx/tools/flow` (o `flow.google.com`, redirige ahí)
- Se crea un "Nuevo proyecto", y dentro el prompt se escribe en el cuadro inferior central
- Clic en el nombre del modelo abre el panel de configuración: **Imagen** o **Video**, relación de aspecto, modelo, calidad, duración, cantidad
- **Fotogramas (Frames)**: acá se arrastra una imagen ya generada como "start frame" y se describe la acción/movimiento — esto es el encadenamiento imagen→video que necesitamos
- **Ingredientes (Ingredients)**: referencias múltiples (ej. fotos del producto) para mantener consistencia entre generaciones
- **Personajes**: `@NombreDelPersonaje` en el prompt reusa cara/outfit/voz consistente entre escenas
- Descarga: hover sobre el asset → "Más" → "Descargar" (o "Descargar proyecto" completo)

## Cómo grabar la automatización real (en vez de adivinar selectores)

Playwright puede grabar una sesión real tuya y generar el código exacto con los selectores reales del DOM de Flow. Pasos:

```bash
npm run record
```

Esto abre un Chrome real apuntando a Flow. Hacé, a mano, UNA vuelta completa:
1. Loguéate con tu cuenta de Google (la sesión queda guardada en `playwright-storage/`, que nunca se sube al repo)
2. Creá un proyecto nuevo
3. Generá una imagen de una escena
4. Usá esa imagen como fotograma inicial ("Frames") y generá el video
5. Descargá la imagen y el video
6. Cerrá la ventana del navegador

Al cerrar, queda un archivo `automation-recording.js` en la raíz del proyecto (ignorado por git) con el código Playwright exacto de todo lo que hiciste. Ese archivo es la base real para reemplazar `server/automation/flowAutomation.js`.

## Próximo paso

1. Correr `npm run record` y hacer la vuelta completa descripta arriba
2. Pasar el contenido de `automation-recording.js` para adaptarlo al pipeline (loop por escena, manejo de errores, espera a que termine la generación)
