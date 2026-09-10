# Validación de Flow — 10 de septiembre de 2026

## Comprobado en la interfaz

- Inicio de sesión realizado por el usuario en el navegador integrado.
- Flow identifica la cuenta conectada como Pro, no Ultra.
- Acceso a proyectos y creación de un proyecto separado: `Agencia · Prueba de conexión`.
- Editor actual servido desde `flow.google.com`.
- Modo imagen: Nano Banana 2, relación 9:16 y una salida.
- La interfaz indica 0 puntos para esta generación de imagen.
- Imagen de botella ficticia generada correctamente y comprobada visualmente.
- Menú del resultado: Animar, Descargar, Reutilizar petición, entre otras opciones.
- Animar coloca la imagen como fotograma inicial en modo Vídeo / Fotogramas.
- Clip vertical de 4 segundos a 720p, una salida: costo indicado de 7 puntos. Enviado una sola vez y terminado; Flow lo identifica como Omni 1.1 Flash.
- Botones Descargar lote activados para imagen y video. La descarga local aún no está verificada: no contarla como entrega de archivos confirmada.

## Alcance de esta prueba

La prueba usa controles visibles del navegador. No demuestra una integración HTTP ni una conexión autónoma del servidor Express con la sesión. El adaptador del repositorio sigue siendo simulado.

No se han exportado cookies, tokens ni contraseñas al repositorio.

## Próximas verificaciones

1. Verificar los archivos descargados de imagen y video.
2. Revisar reproducción y calidad del clip.
3. Repetir con un producto real y su referencia aportada por el usuario.
4. Implementar el adaptador solo con operaciones verificadas, manteniendo la sesión en el navegador y registrando estados sin credenciales.
5. Probar errores, recuperación y asociación de cada resultado con su escena antes de ejecutar lotes.

## Requisitos del puente de navegador

- Conexión local autenticada y limitada a Flow.
- Estado explícito: desconectado, requiere inicio de sesión, listo, generando o error.
- Identificador de trabajo y de escena para evitar mezclar resultados.
- Una operación en curso al comenzar; no reenviar una generación incierta automáticamente.
- Descargas y resultados verificables antes de marcar un trabajo terminado.
- No asumir endpoints internos, cuotas ilimitadas ni tiempos de generación.
