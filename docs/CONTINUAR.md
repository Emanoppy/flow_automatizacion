# Continuidad del desarrollo

Fecha de corte: 10 de septiembre de 2026.

## Intención del usuario

El usuario produce creativos publicitarios con IA para su tienda: crea prompts, genera imágenes, convierte imágenes en videos, descarga y edita. Quiere automatizar para operar una agencia y, a futuro, ofrecer el sistema a otros creadores de gran volumen. Quiere avanzar gradualmente con pruebas reales y moldear el producto según su trabajo.

Aceptó la arquitectura **panel web de orquestación + extensión puente con Flow**. Hoy ambos son locales. No se acordó sustituirla por una extensión sola ni contratar APIs de pago adicionales.

La inspiración son capturas de una app llamada FlowStudio: proyectos verticales/horizontales, editor por escenas, referencias de personaje/estilo/ambiente, pistas de narración/subtítulos/música, exportación y varias cuentas. Su autor menciona cookies, Browser Bridge y una extensión para obtener la lógica de API. Esas afirmaciones NO demuestran cómo está implementado ni validan 500 imágenes por minuto o generaciones ilimitadas. Nuestra implementación no copia su código ni usa endpoints internos averiguados.

## Historia técnica útil

- `afe800c`: puente local inicial y modo demo explícito.
- `b5f0b68`: preparación de prompt con destino específico.
- `4aefa68`: confirmación inmediata y versión de extensión 0.2.1.
- El usuario confirmó que el prompt apareció en Flow; después confirmó que funciona la corrección de confirmación.
- Última comprobación automatizada del código: 7 tests aprobados con npm test.

## Precauciones de implementación concretas

- El servidor guarda la clave y los estados solo en memoria. Reiniciarlo implica revincular. Advertir al usuario si hace falta hacerlo.
- La extensión guarda la clave local del puente en chrome.storage.session. No es un token de Google.
- No subir cookies, claves, .env, perfiles de navegador, descargas ni resultados privados. Ya están excluidas varias rutas por .gitignore.
- Un token GitHub fue compartido en el chat inicial; se recomendó revocarlo. No copiarlo a archivos ni reutilizarlo desde la conversación. Los pushes funcionaron con la autenticación del equipo.
- Servidor en puerto 3000, bind 127.0.0.1; extensión apunta a ese puerto fijo.
- El protocolo de heartbeat usa version 0.2.0 aunque el manifest sea 0.2.1. Cambiar solo el manifest no debe romper compatibilidad.
- La extensión consulta cada 30 segundos. El estado caduca tras 45 segundos. Las operaciones pasan a inciertas tras 90 segundos.
- Comando actual: prepare-prompt. Evita sobrescribir texto, no pulsa Generar y se entrega una sola vez. La confirmación puede reintentarse sin repetir escritura.
- Las pruebas de VM de la extensión verifican la lógica de comunicación, no compatibilidad real del DOM de Flow. Mantener pruebas reales con el usuario.
- El código de generación en server/automation sigue usando mockAssets. El botón de demo es una demostración, no un generador real.

## Plan inmediato

Implementar y verificar generación de UNA imagen desde el panel, siguiendo el hito del README. Antes de generar, detectar y seleccionar modo Imagen; el último proyecto del usuario estaba configurado en Vídeo. No gastar créditos inadvertidamente por tomar el modo actual como correcto.

Diseñar la asociación entre operación, escena y recurso antes de descargar: no tomar simplemente la última imagen de la página si podría pertenecer a otro trabajo. Ante timeout tras enviar, inspeccionar estado antes de reintentar para evitar duplicados y consumo extra.

Tras imagen: clip desde imagen aprobada → archivos verificados → lotes recuperables → organización de agencia → edición/exportación y variantes. La gestión de varias cuentas se evaluará más adelante con límites y sesiones aisladas; no está implementada ni probada.

## Visión comercial pendiente

Producto instalable y fácil de conectar, proyectos persistentes por cliente/producto/campaña, versiones y aprobación de imágenes antes de animar, reutilización de escenas, seguimiento de consumo y errores. Más adelante evaluar distribución de extensión, licencias y actualizaciones, almacenamiento/sincronización, colaboración y servicio alojado. No prometer conversión publicitaria: los resultados comerciales se medirán con campañas reales.

## Prompt que se puede pegar en otra sesión

> Estoy continuando Casa Nova Creative Factory del repositorio Emanoppy/flow_automatizacion. Lee README.md y docs/CONTINUAR.md antes de actuar. Tenemos panel Express local y extensión Chrome/Edge 0.2.1; el usuario ya validó preparación de prompts en Flow. La generación/descarga desde el panel aún no existe, el adaptador es mock. Quiero continuar con UNA imagen real de extremo a extremo: modo Imagen y ajustes comprobados, envío único, seguimiento, resultado y descarga verificada. Conserva la arquitectura, protege las sesiones y no confundas tests simulados con validación real. Revisa primero el estado del repositorio y los accesos disponibles en este equipo.
