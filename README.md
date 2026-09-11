# Casa Nova Creative Factory

## Actualización de desarrollo — 11 de septiembre de 2026

Extensión **0.3.0**: nueva operación experimental de generación de una imagen. Configura modo Imagen, formato y x1; exige Nano Banana 2 y costo visible de 0 puntos; verifica prompt y proyecto antes de pulsar Generar una sola vez. El panel distingue envío de resultado terminado y permite cerrar el seguimiento después de revisarlo en Flow.

**Pendiente de validación real por el usuario con la extensión 0.3.0 recargada.** Los controles se inspeccionaron en Flow, pero no se ha ejecutado aún el recorrido completo desde esta versión. La asociación de resultado, seguimiento automático y descarga verificada siguen pendientes. El resto de este documento describe la base validada en 0.2.1.

Actualizar: recargar extensión y pestaña de Flow, reiniciar servidor, recargar panel y vincular con una nueva clave. Para probar, seleccionar Nano Banana 2 en Flow y usar el nuevo botón Generar una imagen en Flow. No repetir si el estado indica envío incierto: revisar el proyecto primero.

Aplicación en desarrollo para producir anuncios con IA para una tienda y una futura agencia de creativos. La visión es ofrecer después el sistema a otras personas que produzcan videos a gran escala.

**Estado al 10 de septiembre de 2026:** panel local + extensión Chrome/Edge 0.2.1 conectados. El envío de prompts al editor de Flow está probado por el usuario. **La generación y descarga automáticas desde el panel aún NO están implementadas.**

## Retomar en otro dispositivo

```sh
git clone https://github.com/Emanoppy/flow_automatizacion.git
cd flow_automatizacion
npm ci
npm test
npm start
```

Requisitos: Git, Node.js con npm (recomendado Node 22 o posterior) y Chrome o Edge de escritorio actualizado. Abre http://127.0.0.1:3000 en el mismo equipo donde ejecutas el servidor.

1. Abre `chrome://extensions` o `edge://extensions`.
2. Activa modo de desarrollador y pulsa **Cargar descomprimida**.
3. Selecciona la carpeta `extension` dentro de tu clon. No necesitas ZIP ni publicar en Chrome Web Store.
4. Abre https://flow.google.com/ en ese navegador, inicia sesión con tu cuenta y entra a un proyecto.
5. En el panel local, pulsa **Generar clave de vinculación** y copia la clave.
6. Abre la extensión **Casa Nova · Puente de Flow**, pega la clave y pulsa **Vincular y comprobar**.
7. Si Flow estaba abierto antes de cargar la extensión, recarga su pestaña.
8. El panel debe indicar **Puente conectado · editor de Flow detectado**.

El repositorio permite continuar el desarrollo en otro equipo; **no sincroniza sesiones de Google, extensiones instaladas, claves temporales ni archivos locales generados**. Hay que instalar y vincular en cada equipo. El sistema actual necesita un navegador de escritorio: todavía no es un servicio alojado para usar desde cualquier teléfono.

Si ya tienes el clon, guarda tus cambios locales y usa `git pull` antes de continuar. Tras actualizar la extensión, pulsa su botón de recarga en la página de extensiones y recarga Flow y el panel. Reiniciar el servidor invalida la clave: vincula otra vez. Recargar la extensión puede requerir otra vinculación.

## Qué queremos construir

Flujo objetivo: producto y referencias → prompts por escena → imágenes → revisión de imágenes → clips desde imágenes elegidas → descarga organizada → edición/exportación → variantes publicitarias.

La estructura prevista es cliente → producto → campaña → variantes → escenas. Interesan especialmente los ganchos, argumentos y llamadas a la acción intercambiables, la fidelidad del producto y reutilizar escenas aprobadas para no regenerarlas en cada variante.

El objetivo inicial es aprovechar una sesión legítima de Google Flow y sus beneficios de suscripción. No dar por garantizados uso ilimitado, ausencia de consumo de créditos ni velocidades promocionales de terceros.

## Arquitectura actual

- `public/`: panel web local, escenas, conexión y envío de prompt de prueba.
- `server/index.js`: Express, limitado a 127.0.0.1; API del puente y demostración de lotes.
- `server/lib/browserBridge.js`: clave temporal, estado, cola de una operación, destino explícito y confirmación.
- `extension/`: extensión Manifest V3, consulta pestañas Flow y coloca texto en un editor visible vacío.
- `server/automation/flowAutomation.js`: **adaptador simulado**, no genera contenido real.
- `server/lib/jobRunner.js`, `mockAssets.js`, `zipExporter.js`: demostración de pipeline y ZIP.
- `test/`: pruebas de autenticación, caducidad, envío único y confirmación inmediata.

La extensión conserva la sesión de Google en el navegador. El puente no extrae cookies ni contraseñas, ni reproduce endpoints HTTP internos de Google. Actualmente opera mediante el DOM visible. Las llamadas HTTP existentes son entre extensión y servidor local.

La extensión publicada en este repositorio es 0.2.1; el protocolo interno sigue identificado como 0.2.0 por compatibilidad con el servidor. No confundir esas versiones.

## Qué está validado

- Inicio de sesión y acceso a Flow. La cuenta usada en las pruebas aparece como **Pro**, no Ultra.
- Prueba manual asistida mediante navegador: imagen Nano Banana 2, vertical, una salida, 0 puntos indicados; después clip Omni 1.1 Flash, 4 segundos, 720p, 7 puntos indicados. Esto no fue ejecutado por el panel.
- Extensión instalada por el usuario en Chrome y conectada al panel.
- Detección de proyecto/editor y selección explícita de proyecto.
- Prompt enviado desde el panel, colocado en Flow y confirmado. Usuario confirmó funcionamiento, incluida la corrección de demora de confirmación.
- 7 pruebas automatizadas pasaron en la última ejecución de código.

La versión 0.2.1 confirma inmediatamente después de colocar el texto. El panel consulta el estado cada segundo. **La recogida de nuevos comandos todavía depende del pulso de 30 segundos**, por lo que el envío inicial puede esperar hasta ese intervalo. Si falla la confirmación, se conserva y se reintenta el aviso sin repetir la escritura.

## Limitaciones actuales

- Solo preparación de texto, sin pulsar Generar ni cambiar modo/modelo/formato automáticamente.
- El cuadro de Flow debe estar vacío y debe existir un único editor visible. Si hay varias pestañas del mismo proyecto, el puente rechaza la operación.
- En la última captura del usuario Flow estaba en modo **Vídeo** aunque el prompt describía una imagen. Es esencial verificar y configurar el modo antes de automatizar generación.
- No hay seguimiento real de generación, descarga verificada, persistencia de proyectos de agencia ni editor de video.
- El modo demostración produce archivos simulados y debe activarse explícitamente. No presentarlo como producción real.
- Las referencias del formulario actual solo envían nombres de archivos: no implementan carga real a Flow.
- No hay integración HTTP privada de Flow ni sistema multicuenta implementados.
- Los botones de descarga se accionaron en la prueba manual, pero los archivos descargados no se verificaron. No afirmar que la descarga automática está terminada.

## Próximo hito acordado

**Una imagen real completa desde el panel hasta el archivo local verificado.**

1. Inspeccionar controles actuales de Flow con la sesión autorizada y confirmar los selectores reales.
2. Permitir prompt, modelo, relación de aspecto y una salida en el panel.
3. Configurar **modo Imagen**, comprobar opciones y costo visible antes de enviar.
4. Enviar una sola generación y registrar su identidad/escena.
5. Seguir progreso y errores sin duplicar solicitudes cuando el resultado sea incierto.
6. Recuperar y mostrar la imagen exacta de ese trabajo.
7. Descargar y validar el archivo antes de marcar la escena terminada.
8. Probar el recorrido real con la extensión del usuario; no sustituir esa prueba por mocks.

Después: animar una imagen aprobada, verificar clip y descarga; luego cola de múltiples escenas con pausa/reanudación y persistencia. Más adelante, campañas/variantes, bibliotecas de producto, montaje y exportación. La comercialización, cuentas de clientes, instalación sencilla, soporte y distribución de la extensión son etapas futuras.

## Instrucción para el próximo asistente

Lee primero este README y `docs/CONTINUAR.md`. Continúa desde el puente existente; no reinicies el proyecto ni confundas la demostración con el conector real. Revisa git status antes de editar. No pidas al usuario credenciales por chat. No supongas una sesión disponible en una máquina nueva. El siguiente trabajo es el hito de una imagen real de extremo a extremo.

## Documentación adicional

- [Contexto y continuidad](docs/CONTINUAR.md)
- [Diseño e instalación del puente](docs/browser-bridge.md)
- [Registro de la prueba inicial](docs/flow-validation.md)

Esos documentos incluyen notas históricas; para el estado actual prevalecen este README y CONTINUAR.md.
