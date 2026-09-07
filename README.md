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

## Próximo paso

Para conectar la automatización real con Flow, se necesitan capturas de pantalla de:
1. Pantalla principal de Flow después de "Empezar" (cuadro de prompt + botones alrededor)
2. Flujo de generación de imagen (Nano Banana / Imagen) y dónde aparece el resultado
3. Cómo se sube/selecciona una imagen como referencia para generar video con Veo
4. Botón de descarga del video generado
