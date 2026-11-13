const fs = require('fs');
const path = require('path');

const cards = [];

const level1Verbs = ['Cuenta', 'Confiesa', 'Elige', 'Toma un trago si', 'Apunta a', 'Dile a {player1}', 'Muestra', 'Pregúntale a {player1}', 'Baila con {player1}'];
const level1Truths = [
    "¿qué es lo más vergonzoso que has hecho sobrio?",
    "¿qué opinas de tu ex?",
    "¿quién de aquí es tu tipo?",
    "¿cuánto es lo máximo que has durado en la cama?",
    "¿qué es lo más extraño que te excita?",
    "¿cuál es tu zona erógena favorita?",
    "¿alguna vez enviaste fotos íntimas?",
    "¿alguna vez te atrajo un profesor?",
    "¿tienes algún fetiche oculto?",
    "¿cuál es tu posición favorita?",
    "¿tendrías algo causal con alguien de esta sala?"
];

const level1DaresBase = [
    "Toma 2 tragos cruzados con {player1}",
    "Dale un abrazo muy incómodo de 10 segundos a {player1}",
    "Intercambia una prenda con {player1}",
    "Muéstranos tu última búsqueda en Google",
    "Hazle una pasarela al resto del grupo",
    "Habla con acento extranjero por 2 turnos",
    "Deja que {player1} te pinte la cara con algo",
    "Toma un shot sin usar las manos",
    "Ponte la ropa al revés de otra persona",
    "Cierra los ojos y adivina quién te está tocando la rodilla"
];

// GENERATE LEVEL 1 (> 70 Truths, > 70 Dares) = >140 cards
let idCounter = 1;
for (let i = 0; i < 75; i++) {
    // Generate truths
    const randomVerb = level1Verbs[i % level1Verbs.length];
    const randomTruth = level1Truths[i % level1Truths.length];
    cards.push({
        id: `1_t_${idCounter++}`,
        type: 'truth',
        level: 1,
        text: `${randomVerb}, ${randomTruth}`
    });

    // Generate dares
    const randomDare = level1DaresBase[i % level1DaresBase.length];
    cards.push({
        id: `1_d_${idCounter++}`,
        type: 'dare',
        level: 1,
        text: `${randomDare}. (Si no, toma 3 tragos). Variación #${i}`
    });
}

// GENERATE LEVEL 2: Seducción
const level2Truths = [
    "¿Alguna vez te has acostado en la primera cita?",
    "¿Preferirías hacerlo en público o grabar un video?",
    "¿Quién de la sala tiene el mejor cuerpo?",
    "¿Qué parte del cuerpo de {player1} te parece más atractiva?",
    "¿Crees que el tamaño importa? Argumenta.",
    "¿Alguna vez has fantaseado con alguien aquí presente?",
    "¿A qué edad fue tu mejor experiencia?",
    "¿Sueles dar el primer paso sexualmente?",
    "¿Cuál es tu juguete favorito en la intimidad?",
    "¿Beso francés o besos en el cuello?"
];

const level2DaresBase = [
    "Dale un beso en el cuello a {player1}",
    "Baila pegado a {player1} por 30 segundos",
    "Pásale un hielo a {player1} por el pecho",
    "Siéntate en las piernas de {player1} un turno",
    "Acaricia el muslo interno de {player1} por 10 segundos",
    "Dale un beso apasionado de 5 segundos a {player1}",
    "Muestra tu ropa interior por 5 segundos",
    "Susúrrale algo muy sucio a {player1}",
    "Besa el lóbulo de la oreja de {player1}",
    "Hazle un masaje en los hombros a {player1} gimiendo bajito"
];

for (let i = 0; i < 75; i++) {
    const randomTruth = level2Truths[i % level2Truths.length];
    cards.push({
        id: `2_t_${idCounter++}`,
        type: 'truth',
        level: 2,
        text: `${randomTruth} (Pregunta picosa #${i})`
    });

    const randomDare = level2DaresBase[i % level2DaresBase.length];
    cards.push({
        id: `2_d_${idCounter++}`,
        type: 'dare',
        level: 2,
        text: `${randomDare}. Extremo: Hazlo mirando fijo a los ojos. (Reto #${i})`
    });
}

// GENERATE LEVEL 3: Xtasis
const level3Truths = [
    "¿Has participado alguna vez en un trío?",
    "¿Te dejarías atar por {player1}?",
    "¿A quién de la sala le harías el amor sin pensarlo?",
    "¿Te gusta el BDSM moderado?",
    "¿Te grabarías con {player1}?",
    "Describe con detalle cómo complacerías a {player1}",
    "¿Cuál es tu postura más salvaje que aguantas?",
    "¿Te masturbas pensando en gente de tu círculo?",
    "¿Cuál es el lugar de tu cuerpo donde más te excita ser lamido/a?",
    "¿Has tenido alguna vez sexo anal? ¿Te gusta?"
];

const level3DaresBase = [
    "Toca la entrepierna de {player1} por encima de la ropa 10s",
    "Deja que {player1} te dé una nalgada y luego bese ahí",
    "Muérdele el labio inferior a {player1} sensualmente",
    "Besa el vientre de {player1} y baja un poco más cada vez",
    "Tómate un body shot del ombligo o pecho de {player1}",
    "Quítate la camisa/blusa por los siguientes 3 turnos",
    "Haz que {player1} te desabroche el pantalón con la boca",
    "Agarra la mano de {player1} y ponla en tu zona íntima",
    "Lame a lo largo del cuello y la clavícula de {player1}",
    "Siéntate frente a {player1} y finge tener un orgasmo juntos"
];

for (let i = 0; i < 75; i++) {
    const randomTruth = level3Truths[i % level3Truths.length];
    cards.push({
        id: `3_t_${idCounter++}`,
        type: 'truth',
        level: 3,
        text: `${randomTruth} (Confesión salvaje #${i})`
    });

    const randomDare = level3DaresBase[i % level3DaresBase.length];
    cards.push({
        id: `3_d_${idCounter++}`,
        type: 'dare',
        level: 3,
        text: `${randomDare}. No te puedes negar. (Reto XTASIS #${i})`
    });
}

// We write the file structure out
const fileContent = `
export const levels = [
    { id: 1, name: "Pre-Copa", color: "#6366f1", shadow: "rgba(99, 102, 241, 0.4)", locked: false },
    { id: 2, name: "Seducción", color: "#a855f7", shadow: "rgba(168, 85, 247, 0.4)", locked: false },
    { id: 3, name: "Xtasis", color: "#ec4899", shadow: "rgba(236, 72, 153, 0.4)", locked: false }
];

export const cards = ${JSON.stringify(cards, null, 2)};

export const getRandomCard = (level, type, players, currentPlayer, playedCardIds = []) => {
    // Filter out played cards
    const available = cards.filter(c => 
        c.level === level && 
        (!type || type === 'random' || c.type === type) &&
        !playedCardIds.includes(c.id)
    );
    
    // If all cards of this type/level are played, just pick from all available to avoid crashing
    let pool = available;
    if (pool.length === 0) {
        pool = cards.filter(c => c.level === level && (!type || type === 'random' || c.type === type));
    }
    
    // If somehow STILL empty, fallback to level 1
    if (pool.length === 0) {
       return { id: "error", type: "dare", level: 1, text: "Toma un trago. Nos quedamos sin cartas aquí."};
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const card = pool[randomIndex];
    
    // Parse players
    let text = card.text;
    const otherPlayers = players.filter(p => p !== currentPlayer);
    
    if (text.includes('{player1}')) {
        const p1 = otherPlayers.length > 0 ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)] : 'El Jugador de tu derecha';
        text = text.replace(/{player1}/g, p1);
    }
    if (text.includes('{player2}')) {
        const p2 = otherPlayers.length > 1 ? otherPlayers.find(p => p !== text.match(/{player1}/)) : 'El Jugador de tu izquierda';
        text = text.replace(/{player2}/g, p2 || 'Alguien más');
    }
    
    return { ...card, text };
};
`;

const outputPath = path.join(__dirname, '..', 'data', 'cards.js');
fs.writeFileSync(outputPath, fileContent);
console.log('Cards generated and saved to', outputPath);
