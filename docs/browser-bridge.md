# Puente local de Flow — primera versión

## Qué funciona

Extensión Manifest V3 para Chrome o Edge + servicio local Express + estado en el panel.
La extensión consulta las pestañas de Flow y detecta el botón de generación visible.
Envía únicamente la ruta del proyecto y un indicador de presencia del editor.
No extrae cookies, contraseñas, correo de la cuenta ni tokens de Google.

Esta versión no genera contenido ni descarga archivos automáticamente. El adaptador de generación sigue simulado y el panel exige activar expresamente el modo demostración.

## Arranque y vinculación

1. En la raíz del repositorio: `npm ci` y `npm start`.
2. Abre `http://127.0.0.1:3000`.
3. Abre `chrome://extensions` en Chrome o `edge://extensions` en Edge.
4. Activa modo de desarrollador y carga descomprimida la carpeta `extension` del repositorio.
5. Abre Flow e inicia sesión en ese mismo navegador; recarga una pestaña que ya estuviera abierta al cargar la extensión.
6. En el panel, genera y copia la clave de vinculación. En la extensión, pégala y pulsa Vincular y comprobar.
7. Abre un proyecto de Flow: el panel debe mostrar editor detectado. El puente se actualiza cada 30 segundos; una señal de más de 45 segundos se considera desconectada.

La sesión iniciada en el navegador integrado de Codex no se transfiere a Chrome o Edge. La extensión se debe cargar en el navegador donde vaya a usarse Flow. No se ha probado la instalación de extensiones en el navegador integrado.

El servicio escucha solo en 127.0.0.1. La extensión apunta al puerto 3000. La clave vive en memoria del servidor y en almacenamiento de sesión de la extensión; vuelve a vincular al reiniciar cualquiera de los dos. Generar otra clave invalida la anterior.

## Comprobaciones

`npm test` comprueba rechazo de sitios externos, autenticación, caducidad de estado, exclusión de datos no permitidos y bloqueo de generación real no implementada.

Estos tests no equivalen a una prueba de instalación real en Chrome. Falta verificar la extensión cargada y vinculada con Flow antes de dar por terminada la conexión de extremo a extremo.

## Base técnica

- [Solicitudes de red desde extensiones](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)
- [Permisos mínimos y validación de mensajes](https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure)

Próxima etapa: enviar una operación controlada a la pestaña elegida, validar configuración antes de generar, asociar el resultado con su escena y verificar la descarga. No reintentar automáticamente operaciones de generación cuyo resultado sea incierto.
