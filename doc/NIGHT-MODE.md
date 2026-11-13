# Xtasis · Night Mode

Dirección vigente: juvenil, nocturna y sensual. Negro carbón, gris grafito, rojo, carmesí y rosa. Outfit para títulos y Jost para lectura. Se sustituyeron los títulos serif, el dorado, los arcos y el terciopelo de la primera propuesta.

## Vista local

### Juego en PC, tablet y teléfono

El juego ahora tiene una composición propia para PC desde 1024 px: herramientas a la izquierda, carta o ruleta amplia al centro y panel de jugadores a la derecha. No se estira una columna de móvil. El panel muestra hasta ocho jugadores, vidas y protagonista; las barras laterales permiten desplazamiento si la ventana es baja. Hay botón de pantalla completa y atajos `1` Verdad, `2` Reto y `3` Sorpréndeme, habilitados únicamente cuando corresponde sacar una carta y sin paneles abiertos.

La preparación local y el lobby tienen dos columnas en PC. Las invitaciones aceptan computadora o teléfono. Los paneles del Lounge se abren desde la derecha en PC y desde abajo en tablet/teléfono. A 768–1023 px se amplía la carta y el catálogo pasa a dos columnas. Por debajo se mantiene la distribución táctil.

Verificación adicional: `scripts/verify-desktop.cjs` pasó trece comprobaciones, incluyendo ocho jugadores, columnas independientes a 1024/1280/1440/1920 px, teclado, bloqueo de atajos con panel abierto, pantalla completa, adaptación a 820/390 px y una partida sincronizada con anfitrión en PC e invitado en móvil. También volvieron a pasar los dieciocho recorridos de `verify-night.cjs`.

Capturas: [mesa de PC](desktop-table.png), [carta de PC](desktop-card.png), [preparación](desktop-setup.png), [lobby](desktop-lobby.png), [Lounge](desktop-lounge.png).

- Inicio: http://localhost:3000
- Las quince experiencias: http://localhost:3000/lounge
- Un celular: http://localhost:3000/offline
- Tres experiencias del inicio preseleccionan el nivel real mediante `?level=1`, `2` o `3`.
- Capturas: [escritorio](night-desktop.png), [móvil](night-mobile.png), [juego](night-game.png), [invitación descargada](night-invitation.png).

## Quince funciones añadidas

| # | Experiencia | Comportamiento implementado |
|---|---|---|
| 01 | Ritual de la noche | Tres actos con diez preguntas originales por acto; orden aleatorio sin repetición dentro de cada vuelta; guardar preguntas. |
| 02 | El oráculo | Tres intensidades, treinta preguntas, cambio de intensidad y colección personal. |
| 03 | Química a ciegas | Dos personas responden cinco preguntas en privado pasando el celular; pantalla de entrega y resultados comparados. |
| 04 | Dos tentaciones | Votación por turnos para 2–12 personas, votos ocultos y porcentajes al terminar. Ocho dilemas. |
| 05 | Azar & destino | Sorteo de protagonista sin repetir hasta completar la vuelta; parejas aleatorias con trío cuando el grupo es impar. |
| 06 | El infiltrado | Reparto privado de identidades, un infiltrado aleatorio, ocho lugares, reglas para investigar y revelación final. |
| 07 | Cinco segundos | Diez categorías, reloj basado en una fecha límite y puntuación de respuestas validadas por el grupo. |
| 08 | Entre líneas | Juego de palabras prohibidas, doce cartas, dos equipos, puntuación y turnos de 45 segundos. |
| 09 | Atelier de cócteles | Seis recetas, tres sin alcohol; filtros por alcohol y sabor; cantidades para 1–8 copas. |
| 10 | Paisaje sonoro | Tres ambientes sintetizados mediante WebAudio, control de volumen, reproducción y parada; libera el audio al cerrar. |
| 11 | La invitación | Título, anfitrión, fecha, lugar y código opcional; vista previa; descarga PNG 1080 × 1440 con QR; valida salas antes de incluir su código. |
| 12 | Tu propio mazo | Crear, eliminar, jugar e importar cartas; valida JSON, tamaño de archivo y límites; exportación; conservación al recargar. |
| 13 | La colección | Guardar y retirar preguntas, sacar una al azar y exportar como texto; conservación al recargar. |
| 14 | El itinerario | Actos editables, duración, lista de completados, reloj por acto y conservación del itinerario. |
| 15 | La cuenta, clara | Cuenta en MXN, propina configurable y reparto entre 1–12 personas. Distribuye los centavos para que la suma coincida exactamente; copia el desglose. |

Los minijuegos del Lounge se juegan presencialmente en un dispositivo; no se presentan como juegos sincronizados por internet. La app conserva por separado sus salas multijugador anteriores.

## Quince recursos visuales e interacciones

1. Portada original con fotografía de flash, disco cromada y luz carmesí.
2. Tipografía Outfit con escala fluida y jerarquía juvenil.
3. Sistema cromático carbón/grafito/cereza/carmesí/rosa, compartido con salas y partidas.
4. Entrada coreografiada de portada con Motion.
5. Tarjeta superpuesta con giro y respuesta al hover.
6. Sello circular «Just play» y señal «Night mode: on» sobre la fotografía.
7. Tres mundos de intensidad con iconografía de cartas y distinta paleta.
8. Cartas de experiencia con elevación e iconos que reaccionan al hover.
9. Composición de mazo en capas en la entrada al Lounge.
10. Catálogo con filtros activos, búsqueda y tarjetas que aparecen al entrar en pantalla.
11. Paneles Vaul arrastrables, foco gestionado, cierre y superficies adaptadas a móvil.
12. Transiciones de las preguntas mediante AnimatePresence.
13. Sorteo animado y resultado tipográfico en Azar & destino.
14. Visualizador de barras asociado a la reproducción de audio.
15. Pantallas de resultados, progreso y marcadores; temporizadores y vista previa de invitación en vivo.

La preferencia de movimiento reducido se aplica tanto a Motion como a CSS. Los controles incluyen etiquetas y foco visible. El contenido conserva su funcionamiento con movimiento reducido.

## Verificación realizada

- `node node_modules/next/dist/bin/next build`: compilación de producción correcta con Next.js 16.2.1.
- `node node_modules/eslint/bin/eslint.js src`: correcto.
- `node --test scripts/test-lounge.mjs`: ocho pruebas correctas; incluye 240 combinaciones de importe, propina y personas.
- `scripts/verify-night.cjs`: dieciocho comprobaciones correctas en Chrome sin ventana visible, cero errores JavaScript. Cubre las quince experiencias, persistencia tras recarga, importación/exportación, descarga PNG real, búsqueda, juego presencial existente y dos contextos independientes que crean, unen e inician una sala multijugador por SSE.
- Capturas del inicio a 1440 × 1000 y 390 × 844: sin desbordamiento horizontal.

La prueba de navegador usa Playwright del entorno de QA. Admite una instalación normal de `playwright` o su ruta como primer argumento: `node scripts/verify-night.cjs <ruta-al-paquete-playwright>`. Requiere Chrome y la app en localhost:3000. No se añadió Playwright al paquete de producción.

## Alcance del guardado y operación

- Favoritos, mazo e itinerario se guardan en `localStorage` de este navegador; no existe sincronización de estas colecciones entre dispositivos. Los mazos y favoritos se pueden exportar. Si el navegador impide guardar, se muestra un error explícito.
- El audio es una textura sintetizada original, no una integración con Spotify ni una biblioteca de canciones.
- Los temporizadores corrigen el tiempo según la fecha real; no requieren que cada tick se ejecute a tiempo. Cerrar el panel termina esa sesión del minijuego.
- Las salas del proyecto siguen usando el store en memoria existente. Requieren un proceso Node persistente; se pierden al reiniciarlo. Este trabajo no provisionó base de datos ni cambió infraestructura o despliegues.
- «Un solo celular» describe el modo presencial. No se añadió un service worker ni se promete el primer acceso sin conexión.
- Los cambios anteriores que ya existían en el árbol de trabajo se conservaron. No se hicieron commits, push ni publicación externa.

## Referencias consultadas

- [Nocturne Club / Framer](https://www.framer.com/marketplace/templates/nocturne-club/): referencia de atmósfera nightlife; la versión final usa un lenguaje más juvenil según la corrección del usuario.
- [Jackbox Games](https://www.jackboxgames.com/): referencia de juegos sociales y acceso compartido.
- [We're Not Really Strangers](https://www.werenotreallystrangers.com/products/not-really-strangers-card-deck): referencia de conexión mediante preguntas. El texto de las preguntas implementadas es propio.
- [Motion: movimiento reducido](https://motion.dev/docs/react-use-reduced-motion) y [MotionConfig](https://www.motion.dev/docs/react-motion-config).
- [Vaul](https://github.com/emilkowalski/vaul): paneles accesibles ya presentes en el proyecto.

## Recursos gráficos

`public/images/night-flash.webp` es el recurso vigente, generado con la herramienta integrada de imagegen y optimizado a WebP, 1100 × 1467, aproximadamente 223 KiB. Prompt: fotografía editorial nocturna contemporánea con flash, bola disco cromada, cócteles cereza, adultos desenfocados al fondo y luz carmesí/rosa; sin texto, oro, terciopelo ni arcos. La imagen de la primera propuesta se conserva como recurso alternativo sin referencias desde la app.

## Corrección de las consolas

Se identificaron procesos `cmd.exe` / `node.exe` de `claude-code-wakatime` acumulados. A petición del usuario se desactivó ese plugin en la configuración local de Codex, se deshabilitaron temporalmente sus hooks y su lanzador, y se detuvieron sus seis procesos restantes. Los archivos anteriores tienen respaldo con sufijo `.before-console-fix.bak`. No se cerraron los demás procesos `cmd.exe` ni los servidores por este motivo.
