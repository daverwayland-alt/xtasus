# Cómo Añadir Tus Propios Retos y Preguntas 🔥

La aplicación genera dinámicamente más de 450 combinaciones basándose en listas de acciones, partes del cuerpo y condiciones para que nunca se repitan y siempre se sientan únicas. 

Si deseas agregar tus propias fantasías, preguntas muy específicas, o retos personales que solo ustedes 3 entienden, puedes hacerlo fácilmente modificando el archivo del código fuente.

## Archivo a Modificar
👉 Abre el archivo: `src/data/cards.js`

## 1. Añadir Cartas Fijas (Hardcoded)
Si tienes un reto exacto que quieres que salga tal cual lo escribiste, ve al final del archivo `cards.js`, justo antes del `export const cards = generatedCards;` y añade tus cartas manualmente al arreglo `generatedCards` usando la función `push`:

```javascript
// Añade esto casi al final de src/data/cards.js
generatedCards.push({
    id: "mi_reto_1",
    type: "dare", // 'dare' para Reto, 'truth' para Verdad
    level: 3,     // 1 = Pre-Copa, 2 = Seducción, 3 = Xtasis
    text: "Quítate toda la ropa interior y siéntate en medio de la cama durante 3 turnos."
});

generatedCards.push({
    id: "mi_verdad_1",
    type: "truth",
    level: 3,
    text: "¿Cuál es la fantasía exacta que quieres que hagamos los 3 esta misma noche?"
});
```

## 2. Variables Mágicas
Puedes usar etiquetas dinámicas dentro de tu texto y el juego automáticamente insertará el nombre de los otros dos jugadores en la sala:
- `{player1}` -> El sistema pondrá el nombre de una de las otras dos personas.
- `{player2}` -> El sistema pondrá el nombre de la tercera persona.

**Ejemplo:**
`"Dale un beso apasionado a {player1} mientras {player2} te toca el cuello."`

## 3. Extender el Generador (Para miles de combinaciones)
Si te fijas en el código de `cards.js`, verás listas inmensas como `l3Actions`, `l3BodyParts`, `l3Conditions`. 
Si añades una sola palabra nueva a **CUALQUIERA** de esas listas, el código automáticamente multiplicará esa palabra por todas las demás y generará decenas de retos nuevos para su noche.

Por ejemplo, si en `l3BodyParts` añades `"los pies de {player1}"`, el sistema automáticamente generará retos como:
- *"Lame los pies de {player1} mientras gimes."*
- *"Pasa un hielo por los pies de {player1}..."*
- *"Dale un beso húmedo en los pies de {player1}..."*

¡Disfruten su noche! 😈
