# Metrónomo

Un metrónomo web simple y funcional para gestionar canciones con sus respectivos BPM y tipos de compás.

## Características

- ✅ Registrar canciones con nombre, BPM y tipo de compás
- ✅ Lista de canciones ordenada alfabéticamente
- ✅ Reproducción de metrónomo con sonido
- ✅ Diferentes tipos de compás (2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, 12/8)
- ✅ Almacenamiento local (los datos persisten al recargar la página)
- ✅ Interfaz moderna con Tailwind CSS

## Uso

1. Abre `index.html` en tu navegador
2. Completa el formulario con:
   - Nombre de la canción
   - BPM (Beats Per Minute)
   - Tipo de compás
3. Haz clic en "Agregar Canción"
4. Para reproducir el metrónomo, haz clic en el botón "▶ Play" de la canción deseada
5. Para detener el metrónomo, haz clic en el botón "Detener" en el indicador flotante

## Tecnologías

- HTML5
- Tailwind CSS (via CDN)
- JavaScript Vanilla
- Web Audio API

## Notas

- El metrónomo usa la Web Audio API para generar sonidos
- Los datos se guardan en el localStorage del navegador
- El primer beat de cada compás tiene un tono más fuerte para facilitar la identificación

