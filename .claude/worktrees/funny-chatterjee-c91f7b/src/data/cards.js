export const levels = [
  { id: 1, name: 'Pre-Copa', color: '#6366f1', shadow: 'rgba(99, 102, 241, 0.4)', locked: false },
  { id: 2, name: 'Seducción', color: '#a855f7', shadow: 'rgba(168, 85, 247, 0.4)', locked: false },
  { id: 3, name: 'Xtasis', color: '#ec4899', shadow: 'rgba(236, 72, 153, 0.4)', locked: false },
];

const generatedCards = [];
let idCounter = 1;

// Helper to shuffle arrays nicely
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// ----------------------------------------------------------------------------------
// LEVEL 1: PRE-COPA (Para calentar los motores y romper la tensión física)
// ----------------------------------------------------------------------------------
const l1Truths = [
  '¿Quién de todos crees que aguanta más en la cama?',
  '¿Has pensado alguna vez en hacer un trío?',
  '¿Cuál es el lugar más extraño donde te has tocado pensando en alguien?',
  'Del 1 al 10, ¿qué tan celoso/a eres si ves a tu pareja con otra persona?',
  '¿Alguna vez te has grabado cogiendo?',
  'De {player1} y {player2}, ¿quién crees que coge mejor?',
  '¿Prefieres dar placer prolongado o recibirlo sin hacer nada?',
  '¿Qué tipo de caricia te excita muchísimo?',
  '¿Cuál es tu posición favorita y por qué?',
  'Confiesa tu fetiche más fuerte pero que pocos saben.',
  '¿Cuál es el piropo más sucio que te han dicho cogiendo?',
  '¿Cuánto es lo más rápido que has terminado?',
  '¿Te atrae el voyeurismo (ver a otros) o el exhibicionismo (que te vean)?',
  '¿Qué fue lo que mas te excita de {player1?',
  '¿Qué fue lo primero que te excitó de {player2} la primera vez que lo viste?',
  'Del 1 al 10, ¿qué tan caliente eres?',
  '¿Alguna vez te has imaginado a {player1} y {player2} cogiendo sin ti?',
  '¿Cuál es tu zona más sensible que casi nadie conoce?',
  '¿Te excita más que te hablen sucio o tierno?',
  '¿Qué es lo más atrevido que has pensado hacer pero te dio pena sugerir?',
  '¿Alguna vez has tenido una erección en público pensando en uno de nosotros?',
  '¿A quién de los preentes crees que es más fácil hacer gemir?',
  "¿Qué parte de tu cuerpo te gusta más que te acaricien como 'previa'?",
  '¿Prefieres las luces encendidas o apagadas ?',
  '¿Cuál de los dos crees que tiene la mirada más perversa?',
  '¿Te gusta que te besen el cuello o prefieres las orejas?',
  '¿Qué canción te pone automáticamente en un mood sexual?',
  'Si tuvieras que describir el cuerpo de {player1} con una palabra, ¿cuál sería?',
  '¿Alguna vez te has tocado pensando en la sonrisa de alguno de nosotros?',
  '¿Te excita la idea de que alguien nos escuche mientras jugamos?',
  '¿Prefieres tomar el control desde el principio o que te vayan guiando?',
  '¿Cuál es tu posición favorita?',
  '¿Qué gesto te calienta?',
  '¿Te gustaría que te amarraran? ¿Con ?',
  '¿Cuál es el lugar más loco donde te gustaría coger',
  '¿Te excita ver cómo se quitan la ropa?',
  '¿Qué es lo más sucio que se te ha cruzado por la mente ?',
  '¿Si pudieras tocar a {player1} con una sola mano, dónde la pondrías?',
  '¿Te gusta que te digan lo rico que lo haces ?',
  '¿Qué ropa interior prefieres que use {player1}: ajustada, floja o ninguna?',
  '¿Te pone nervioso que los dos te miremos fijamente a los ojos a la vez?',
  '¿Qué parte del cuerpo de {player3} te pone más loco cuando lo ves sudado?  ',
  '¿Te calienta imaginar un trío con {player2} y {player3} en el depa?  ',
  '¿Cuál de los dos tiene el bulto más marcado en boxer ajustado?  ',
  '¿Prefieres empezar con toques suaves o ya piel con piel?  ',
  '¿A qué hora del día te prende más un trío rápido?  ',
  '¿Has fantaseado con nalgadas suaves de {player2}?  ',
  '¿Cuál es tu postura favorita pa empezar suave?  ',
  '¿Te late que te toquen el paquete por encima de la ropa?  ',
  '¿Qué prenda de {player3} te gustaría ver quitarse primero?  ',
  'zzz¿Te calienta que te digan al oído lo rico que te ves?  ',
  '¿Prefieres dar placer o recibirlo al inicio?  ',
  '¿Qué tipo de porno te prende más últimamente?  ',
  '¿Cuál es el lugar más raro donde has cogido?  ',
  '¿Cuántas veces máximo has cogido en un día?  ',
  '¿Te has masturbado pensando en {player2}?  ',
  '¿Qué edad tenías en tu primera chupada?  ',
  '¿Prefieres 69 encima o debajo?  ',
  '¿Has visto a un carnal masturbándose?  ',
  '¿Cuál es tu fantasía más suave con trío?  ',
  '¿Te prende que te manden packs del bulto?  ',
  '¿Te calienta que {player3} te toque el culo por encima primero?  ',
  '¿Prefieres luces bajas o apagadas al inicio?  ',
  '¿Qué prenda te gustaría quitarle a {player2} primero?  ',
  '¿Te late que te hablen sucio al oído desde el principio?  ',
  '¿Has soñado con un trío en la azotea?  ',
  '¿Cuál es el tamaño de verga que te prende más?  ',
  '¿Te excita que te vean duro por encima de la ropa?  ',
  '¿Prefieres que {player3} empiece tocándote el pecho?  ',
  '¿Te calienta imaginar que te laman el cuello suave?  ',
  '¿Qué hora de la noche te pone más cachondo?',
];

const l1Dares = [
  '👃 Olfato sutil: Acércate al cuello de {player1} y respira profundamente su perfume/olor natural por 30 segundos.',
  '✋ Manos atadas: Durante tu turno, debes mantener tus manos en la nuca. {player2} tiene permiso de tocar tu abdomen.',
  '💋 Beso ciego: Cierra los ojos. {player1} y {player2} te darán un beso en alguna parte de la cara. Adivina quién fue quién.',
  '🪶 Caricias fantasma: {player1} debe trazar su nombre con el dedo en tu espalda desnuda. Si no adivinas, te quitas una prenda.',
  '👄 Susurros: {player2} debe susurrarte al oído la fantasía más sucia que tiene contigo.',
  '👀 Contacto visual: Mira fijamente a los ojos de {player1} durante 1 minuto sin reírte. El que pierda, se quita los calcetines.',
  '👅 Sabor a piel: Lame suavemente la muñeca de {player2} para probar su sabor natural.',
  '👕 Fetiche de ropa: Toma la camiseta de {player1} y frótala contra tu rostro por 15 segundos.',
  '🤫 Silencio: No puedes hablar durante los próximos 2 turnos. Solo puedes comunicarte con gemidos o gestos.',
  '👂 Mordisco de oreja: Muerde suavemente el lóbulo de la oreja de {player1} mientras respiras agitado.',
  '🦵 Masaje de piernas: Dale un masaje en las pantorrillas a {player2} usando ambas manos y mucha presión.',
  '🧊 Fricción: Frótate con tu ropa contra la pierna de {player1} como si fueras un gato buscando cariño.',
  '👃 Aroma a cabello: Hunde tu rostro en el cabello de {player2} y describe a qué huele.',
  "✋ Exploración táctil: Cierra los ojos y toca el rostro de {player1} con ambas manos para 'reconocerlo'.",
  '💋 Beso de cuello: Dale un beso largo y húmedo en la nuca a {player2}.',
  '👕 Botones: Desabrocha o levanta lentamente la camisa de {player1} usando solo una mano.',
  '🧦 Fetiche de pies (soft): Quítale los calcetines a {player2} usando solo tus dientes.',
  '👀 Exhibición leve: Muestra tu ropa interior a los otros dos jugadores durante 10 segundos.',
  '👄 Aliento: {player1} debe respirar muy cerca de tus labios, casi tocándolos, por 30 segundos sin besarte.',
  '✋ Dominación suave: Pon tu mano firmemente sobre la nuca de {player2} y oblígalo a mirarte a los ojos.',
  '🧊 Temperatura: Toca el vientre de {player1} con tus manos (si están frías, mejor).',
  '👅 Gato: Lame el dorso de la mano de {player2} como si fueras su mascota.',
  '👕 Intercambio: Cambia tu camiseta con la de {player1}.',
  '🤫 Secreto: Dile al oído a {player2} qué parte de su cuerpo te vuelve loco.',
  '🦵 Muslos: Acaricia la parte interna de los muslos de {player1} por encima de la ropa.',
  '👃 Inhalación: Respira el aroma del pecho de {player2}.',
  '✋ Cosquillas: Hazle cosquillas a {player1} en su punto más débil por 15 segundos.',
  '💋 Beso indirecto: Besa tus propios dedos y luego ponlos en los labios de {player2}.',
  '🪶 Pluma: Usa tu cabello (o un objeto suave) para acariciar la cara de {player1}.',
  '👀 Inspección: Deja que {player2} te examine de arriba a abajo críticamente.',
  '👄 Mordisco: Muerde tu propio labio inferior mientras miras con deseo a {player1}.',
  '✋ Entrelazar: Entrelaza tus dedos con los de {player2} y aprieta fuerte.',
  '🧊 Escalofrío: Sopla suavemente en la nuca de {player1} para darle escalofríos.',
  '👕 Striptease express: Quítate una prenda bailando para {player1} y {player2}.',
  '🥵 Roce vestido: Siéntate en las piernas de {player1} y frótate contra él/ella durante 1 minuto con ropa.',
  '💋 Beso de tres: Inicia un beso francés entre los tres, compartiendo lenguas al mismo tiempo.',
  '🍑 Nalgada grupal: {player1} y {player2} te dan una nalgada al mismo tiempo.',
  '👅 Cuello ardiente: Lame el cuello de {player2} de abajo hacia arriba y muerde su oreja.',
  '👕 Quitar ropa: Quítale la camiseta a {player1} usando solo una mano.',
  '🥵 Fricción de espaldas: Frota tu espalda desnuda contra la de {player2}.',
  '💋 Mordisco de labios: Besa a {player1} y dale un pequeño mordisco en el labio inferior.',
  '🍑 Masaje íntimo: Dale un masaje en la parte baja de la espalda a {player2} metiendo un poco las manos en su pantalón.',
  '👅 Prueba de sabor: Pon un poco de alcohol o dulce en tu ombligo y que {player1} se lo tome.',
  '👕 Ropa interior: Muestra tu ropa interior bajándote un poco el pantalón frente a los dos.',
  '🥵 Body shot: Tómate un trago (o agua) del pecho de {player2}.',
  '💋 Beso con hielo: Toma un hielo en la boca y besa a {player1} pasándoselo.',
  '🍑 Apreton: Aprieta fuertemente los glúteos de {player2} con ambas manos.',
  '👅 Chupar el dedo: Chúpale el dedo índice a {player1} provocativamente.',
  '👕 Desvestir con la boca: Intenta quitarle una prenda a {player2} usando solo tus dientes.',
  "🥵 Baile privado: Hazle un 'lap dance' (baile en el regazo) a {player1} por 1 minuto.",
  '💋 Marcas: Hazle un pequeño chupetón en el cuello a {player2}.',
  '🍑 Palmadas: Recibe 3 palmadas en los muslos de {player1}.',
  '👅 Lamer pecho: Pasa tu lengua por el esternón de {player2}.',
  '👕 Pantalones abajo: Quédate solo en ropa interior de la cintura para abajo por los próximos 2 turnos.',
  '🥵 Frotar piernas: Entrelaza tus piernas desnudas con las de {player1}.',
  '💋 Beso sorpresa: Dale un beso de lengua rápido y agresivo a {player2}.',
  '🍑 Nalgas al aire: Muestra tus nalgas por 10 segundos.',
  '👅 Lamer oreja: Pasa tu lengua por todo el contorno de la oreja de {player1}.',
  '👕 Intercambio de camisa: Ponte la camisa de {player2} sin nada debajo.',
  '🥵 Roce de narices: Roza tu nariz con la de {player1} respirando su mismo aire.',
  '💋 Beso en el vientre: Besa el ombligo de {player2}.',
  '🍑 Pellizco de nalgas: Pellizca suavemente las nalgas de {player1}.',
  '👅 Lamer la barbilla: Pasa tu lengua por la mandíbula de {player2}.',
  '👕 Descalzo: Quítate los zapatos y calcetines por el resto del juego.',
  '🥵 Abrazo por detrás: Abraza a {player1} por la espalda y aprieta tu cadera contra él.',
  '💋 Beso de cuello prolongado: Pasa 30 segundos besando solo el cuello de {player2}.',
];

// Generar combinaciones para Nivel 1
l1Truths.forEach(t => {
  generatedCards.push({ id: `1_t_${idCounter++}`, type: 'truth', level: 1, text: t });
});
l1Dares.forEach(d => {
  generatedCards.push({ id: `1_d_${idCounter++}`, type: 'dare', level: 1, text: d });
});

// ----------------------------------------------------------------------------------
// LEVEL 2: SEDUCCIÓN (Elevando la temperatura, contacto físico directo)
// ----------------------------------------------------------------------------------
const l2TrioTruths = [
  'Si te dijeran que eligieras a quién besar primero esta noche entre {player1} y {player2}, ¿a quién eliges?',
  '¿Qué fantasía de trío tienes que nunca has dicho en voz alta?',
  '¿Preferirías ver a {player1} y {player2} besándose, o que te besen los dos al mismo tiempo?',
  'Si tocaras la entrepierna de alguien ahora mismo, ¿a quién sería y por qué?',
  '¿Te gustaría que te amarren a la cama mientras {player1} te acaricia?',
  'Describe con lujos de detalle cómo besarías el cuello de {player2}.',
  '¿Qué prenda de ropa quieres que {player1} se quite en este preciso instante?',
  '¿El tamaño o la técnica? Argumenta viéndole a los ojos a {player1}.',
  'Si pudieras usar un juguete íntimo esta noche con nosotros, ¿cuál elegirías?',
  '¿Qué gemido o sonido te prende más cuando estás en pleno acto?',
  '¿Preferirías morder o que te muerdan fuertemente el labio inferior?',
  'Di algo explícito que quieres hacerle a {player2} cuando apaguen las luces.',
  '¿Dónde te gustaria que dejara una marca visible {player1}?',
  'Si los tres termináramos en la misma cama, ¿cuál sería la primera posición?',
  '¿Tragar o escupir? Contesta sin rodeos.',
  'Cuando te masturbas pensando en nosotros, ¿exactamente qué escena recreas en tu mente?',
  '¿Alguna vez has olido la ropa interior de alguno de nosotros a escondidas?',
  '¿A quién de los dos prefieres ver masturbándose frente a ti?',
  'Si te dieran a elegir, ¿qué juguete sexual usarías en {player1}?',
  '¿Te gusta más recibir sexo oral de {player1} o de {player2}?',
  '¿Cuál es tu posición favorita cuando los tres estamos en la cama?',
  '¿Te excita ver a {player1} chupándosela a {player2}?',
  '¿Qué es lo más rico que te han hecho los dos al mismo tiempo?',
  '¿Prefieres venirte primero, en medio o al final de los tres?',
  '¿Cuál es el fetiche más raro que te ha excitado últimamente?',
  '¿Te gustaría intentar la doble penetración (como activo o pasivo)?',
  'Si tuvieras que dejar chupetones, ¿en qué parte del cuerpo de {player2} los dejarías?',
  '¿Alguna vez te has aguantado las ganas de venirte solo para vernos más tiempo?',
  '¿Qué te excita más: el sabor o el olor de la entrepierna de {player1}?',
  '¿Te gustaría que te vendáramos los ojos y te usáramos a nuestro antojo?',
  '¿Cuál de los dos crees que sabe dar mejores nalgadas?',
  'Si {player2} te pidiera que le chuparas los pies, ¿lo harías?',
  '¿Has grabado alguna vez un video íntimo? ¿Te gustaría grabar uno hoy?',
  '¿Qué es lo más pervertido que te gustaría pedirnos ahora mismo?',
  "¿Te excita la idea de hacer un '69' mientras el tercero te acaricia?",
  '¿A quién de los dos te gustaría dejar completamente exhausto hoy?',
  '¿Qué palabra te vuelve loco/a que te susurren al oído mientras te penetran?',
  '¿Alguna vez has probado tu propio preseminal? ¿A qué sabe?',
  '¿Te gustaría que los dos te estimuláramos los pezones hasta hacerte gemir?',
  '¿Cuál crees que es la parte más sensible de la anatomía de {player1}?',
  'Si tuvieras que chupar el miembro de {player2} por 5 minutos sin parar, ¿qué técnica usarías?',
  '¿Te excita el roce piel con piel o prefieres usar mucho lubricante?',
  '¿Cuál es tu fantasía más sucia que involucre un espejo?',
  '¿Te gustaría que {player1} y {player2} te obligaran a masturbarte para ellos?',
  '¿Qué prefieres: que te dominen física o verbalmente?',
  '¿Alguna vez has sentido celos viendo a {player1} y {player2} dándose placer?',
  '¿Qué es lo que más te gusta hacer justo después de venirte?',
  '¿Te excitaría ver a uno de nosotros con lencería de hombre, arneses o ropa muy atrevida?',
];

// Generador Combinatorio para Retos Nivel 2
const l2Actions = [
  '👃 Axilas: Levanta el brazo de {player1} y huele su axila. Luego dale un beso ahí mismo.',
  '🩲 Ropa interior: Toma la ropa interior usada de {player2} y póntela en la cara como una mascarilla por 1 minuto.',
  '👅 Pies (medio): Chupa el dedo gordo del pie de {player1} durante 20 segundos.',
  '✋ Nalgadas: Dale 3 nalgadas fuertes a {player2} en la piel desnuda.',
  '🐕 Sumisión canina: Ponte a cuatro patas. {player1} te pondrá un collar imaginario y te guiará.',
  '💧 Saliva: {player2} debe escupir un poco en su mano y usar esa saliva para acariciar tu pecho/pezones.',
  '🪢 Ataduras: {player1} te amarrará las manos a la espalda usando su camiseta. Quédate así 2 turnos.',
  '👅 Pezones: Lame y muerde suavemente los pezones de {player2} hasta que se pongan duros.',
  '👀 Voyeur: Tienes que masturbarte durante 1 minuto mientras {player1} y {player2} te observan fijamente.',
  '👄 Dominación oral: {player1} te tomará por el cabello y guiará tu boca hacia su zona íntima.',
  '✋ Asfixia leve: {player2} pondrá su mano en tu cuello (sin apretar fuerte) mientras te besa.',
  '👃 Aroma íntimo: Entierra tu nariz en la entrepierna de {player1} (sobre la ropa interior) y respira profundo.',
  '🩲 Intercambio íntimo: Quítate tu ropa interior y pónsela a {player2}.',
  '👅 Saborear: Lame el ombligo de {player1} dando círculos con la lengua.',
  '✋ Cachetada suave: {player2} tiene permiso de darte una bofetada leve si gimes en el próximo minuto.',
  '🐕 Humillación: Pide permiso a {player1} para poder tocarte a ti mismo.',
  '💧 Sudor: Lame una gota de sudor (o simula hacerlo) del pecho de {player2}.',
  '🪢 Privación: Véndate los ojos. {player1} te tocará con algo (una fruta, hielo, sus dedos) y debes adivinar.',
  '👅 Beso mojado: Dale un beso de lengua muy húmedo a {player2} intercambiando mucha saliva.',
  '👀 Exhibición: Ábrete de piernas frente a {player1} y deja que mire tu ropa interior por 30 segundos.',
  '👄 Chupetón: Hazle un chupetón a {player2} en el muslo interno.',
  '✋ Masaje de glúteos: Amasa los glúteos de {player1} con aceite o loción.',
  '👃 Zapatos: Besa la suela del zapato (o el pie desnudo) de {player2}.',
  '🩲 Fetiche de algodón: Muerde la banda elástica del bóxer/pantaleta de {player1} y tira de ella.',
  '👅 Axilas (pro): Pasa tu lengua por toda la axila de {player2}.',
  '✋ Control: {player1} te ordenará exactamente cómo y a qué ritmo masturbarte por 1 minuto.',
  '🐕 Mascota: Lame la mano de {player2} para agradecerle por jugar contigo.',
  '💧 Lubricación: Esparce lubricante en el vientre de {player1} usando tu mejilla.',
  "🪢 Castigo: {player2} te dará un pequeño 'castigo' físico a su elección.",
  '👅 Mordisco íntimo: Muerde la parte interna del muslo de {player1} muy cerca de su ingle.',
  '👀 Grabación: Finge que estás grabando un POV (Point of View) gimiendo hacia {player2}.',
  '👄 Beso esclavo: Besa la rodilla de {player1} y luego su entrepierna.',
  '✋ Exploración ciega: Con los ojos cerrados, {player2} guiará tu mano hacia su miembro/zona íntima.',
  '🥵 Frotting desnudo: Quítate la ropa interior. Frótate desnudo contra {player1} (también desnudo) por 1 minuto.',
  '👅 Sexo oral (Prueba): Dale sexo oral a {player2} durante exactamente 60 segundos. Luego para en seco.',
  '🛑 Edging (Al borde): Mastúrbate (o que te masturben) hasta estar a punto de venirte, luego suelta todo y respira.',
  '🥪 El Sándwich: {player1} y {player2} se frotan contra ti, uno por delante y otro por detrás.',
  '💋 69 Express: Haz un 69 con {player1} durante 2 minutos. {player2} observa.',
  '💦 Baño de baba: {player2} te escupe en el pecho y tú debes esparcirlo.',
  '🥵 Masturbación cruzada: Masturba a {player1} mientras {player2} te masturba a ti.',
  '👅 Chupar pezones: Succiona los pezones de {player2} con fuerza hasta que gima.',
  '🛑 Negación: Pide permiso a {player1} para tocarte. Él debe decirte que NO. Aguanta 1 turno.',
  '🥪 Doble toque: Toca la entrepierna de {player1} con tu mano derecha y la de {player2} con la izquierda.',
  '💋 Beso con sabor: Después de que {player1} te toque tu zona íntima, dale un beso para que pruebe tus fluidos.',
  '💦 Preseminal: Si {player2} tiene preseminal, usa tu dedo para probarlo.',
  '🥵 Frotar miembros: (Si aplica) Frotar sus erecciones juntas (espadas) con {player1} por 1 minuto.',
  '👅 Estimulación anal suave: Pasa un dedo húmedo alrededor del ano de {player2}.',
  '🛑 Pausa obligatoria: Quédate inmóvil. {player1} te dará placer con la boca por 30 segundos y tú no puedes moverte.',
  '🥪 En medio: Acuéstate boca arriba. {player2} se sienta en tu cara y {player1} en tu pelvis.',
  '💋 Intercambio de parejas oral: Dale oral a {player1} por 1 min, luego cambia rápido a {player2} por 1 min.',
  '💦 Lubricante humano: Usa tu saliva para lubricar el miembro/zona íntima de {player1}.',
  '🥵 Sexo Intercrural (Muslos): Frota tu erección entre los muslos apretados de {player2} por 1 minuto usando mucho lubricante.',
  '👅 Exploración profunda: Usa tu lengua para explorar lo más profundo que puedas a {player1}.',
  '🛑 Control de respiración: {player2} te tapa la nariz por unos segundos mientras te besa apasionadamente.',
  '🥪 Abrazo grupal desnudos: Los tres se abrazan completamente desnudos apretando sus cuerpos por 1 minuto.',
  '💋 Beso de sumisión: Arrodíllate y besa la entrepierna desnuda de {player1}.',
  '💦 Masaje de próstata: Deja que {player2} estimule tu perineo o próstata mientras te masturbas hasta casi llegar.',
  '🥵 Nalgada a cuatro patas: Ponte a cuatro patas y deja que {player1} te dé 5 nalgadas fuertes.',
  '👅 Lamer el vientre: Lame desde el ombligo hasta la ingle de {player2}.',
  '🛑 Control de orgasmo: {player1} decide en cuántos minutos te puedes venir hoy.',
  '🥪 Trío manual: Los tres unen sus manos en una sola zona íntima para dar placer mutuo.',
  '💋 Beso al miembro: Dale besitos suaves al miembro de {player2} sin usar lengua.',
  '💦 Estimulación de próstata (suave): Masajea el perineo de {player1}.',
  '🥵 Frotar nalgas: Frota tus nalgas contra la entrepierna de {player2}.',
  '👅 Chupar muslos: Succiona la cara interna de los muslos de {player1}.',
  '🛑 Parada brusca: Cuando estés a punto de excitarte mucho, {player2} te echa unas gotas de agua fría.',
];
const l2Targets = ['{player1}', '{player2}'];

l2TrioTruths.forEach(t => generatedCards.push({ id: `2_t_${idCounter++}`, type: 'truth', level: 2, text: t }));

// Mezclar para generar ~100 de Reto Nivel 2
let l2Counter = 0;
l2Actions.forEach(action => {
  l2Targets.forEach(target => {
    if (l2Counter++ < 100) {
      generatedCards.push({
        id: `2_d_${idCounter++}`,
        type: 'dare',
        level: 2,
        text: `${action}`,
      });
    }
  });
});
for (let i = 0; i < 85; i++) {
  generatedCards.push({ id: `2_t_${idCounter++}`, type: 'truth', level: 2, text: l2TrioTruths[i % l2TrioTruths.length] });
}

// ----------------------------------------------------------------------------------
// LEVEL 3: XTASIS (El nivel más caliente y directo para la dinámica Trio)
// ----------------------------------------------------------------------------------
const l3TrioTruths = [
  'Si tuvieras control absoluto de los cuerpos de {player1} y {player2} por una hora, ¿qué nos harías?',
  'Confiesa qué es lo que más te prende de ver a dos hombres/dos personas con tu pareja.',
  'Describe paso a paso cómo complacerías oralmente a {player1}.',
  '¿Quieres que esta noche {player2} te domine y te dé órdenes?',
  'Si {player1} se acuesta bocarriba, ¿dónde te sentarías y qué harías con tus manos?',
  '¿Qué fetiche extremo te gustaría cumplir esta noche con el tercer invitado?',
  '¿Has pensado en grabar un video casero hoy? ¿En qué poses?',
  'De {player1} y {player2}, ¿quién te calienta más cuando se quita la ropa?',
  'Di explícitamente qué quieres sentir adentro de ti o dónde quieres meterte el día de hoy.',
  '¿Qué es eso tan sucio y pervertido que te da pena pedir pero que mueres por hacer hoy?',
  '¿Preferirías tragar el semen de {player1} o de {player2}?',
  "¿Te excita la idea de un 'snowballing' (pasarse el semen de boca en boca)?",
  '¿Estarías dispuesto a recibir una lluvia dorada completa hoy?',
  'Si tuvieras que elegir a uno para que termine en tu cara, ¿a quién eliges?',
  '¿Te gustaría que {player1} te usara como su inodoro personal (fetiche de sumisión)?',
  '¿Qué tan profundo puedes llegar haciendo sexo oral sin ahogarte?',
  '¿Cuál es tu límite más extremo en la cama, algo que jamás harías?',
  '¿Te excitaría que {player2} escupiera en tu boca mientras te penetra?',
  '¿Alguna vez has fantaseado con que te obliguemos a tragar?',
  '¿Te gusta el sexo anal agresivo o prefieres que sea con mucho cuidado?',
  'Si pudieras convertir a uno de nosotros en tu esclavo sexual, ¿qué le harías?',
  '¿Alguna vez has querido lamer el ano de {player1} (beso negro)?',
  '¿Te gustaría que {player2} te usara para masturbarse y luego te ignorara?',
  '¿Qué opinas del fetiche de ser grabado y que otras personas lo vean?',
  '¿Alguna vez te has venido solo por estimulación de pezones o próstata?',
  '¿Te excita el dolor? ¿Qué tanto estarías dispuesto a soportar hoy?',
  '¿Te gustaría que los dos te penetráramos a la vez (con juguetes o doble penetración anal)?',
  '¿Cuál de los dos crees que tiene el miembro más rico para tragar?',
  "Si estuviéramos en un 'glory hole', ¿crees que reconocerías el miembro de {player1} solo con la boca?",
  '¿Te gustaría que {player2} te orinara en la boca?',
  '¿Qué fluido corporal te excita más probar: sudor, saliva, preseminal o semen?',
  "¿Alguna vez has tenido fantasías con hacer 'cruising' en un lugar público con desconocidos?",
  '¿Te gustaría ser atado y amordazado mientras {player1} y {player2} tienen sexo frente a ti?',
  '¿Prefieres terminar dentro, fuera o que terminen sobre ti?',
  "¿Te excita la idea de humillación verbal extrema ('slut shaming' o degradación)?",
  '¿Cuál es la fantasía de dominación/sumisión más hardcore que tienes?',
  '¿Te gustaría que te obligáramos a lamer nuestros fluidos mezclados del cuerpo del otro?',
  '¿Si te dijéramos que hoy solo puedes venirte si te lo permitimos, lo aceptarías?',
  '¿Te excita el uso de dildos enormes o juguetes muy extremos por la vía anal?',
  '¿Qué es lo más sucio que has hecho con el semen de otro hombre?',
  "¿Te gustaría que te hiciéramos un 'gangbang' si hubieran más personas?",
  '¿Prefieres que te ahorquen ligeramente mientras te vienes?',
  'Si pudieras implantar un fetiche en la mente de {player1}, ¿cuál sería?',
  '¿Qué es lo más extremo que harías por nosotros si te lo pidiéramos ahora mismo?',
];

// Generador Combinatorio para Retos Nivel 3
const l3Actions = [
  '💥 Los 10 Segundos: ¡Penetración! Introduce tu miembro en {player1} (o recíbelo). {player2} cuenta hasta 10 y separan.',
  '❄️ Snowballing: Da oral a {player1} hasta que termine en tu boca. Luego dale un beso de lengua a {player2}.',
  '💥 Doble Penetración: Recibe a {player1} por vía anal mientras le das sexo oral profundo a {player2}.',
  '❄️ Tragar: {player1} se masturba y debe venirse directo en tu boca. Trágalo.',
  '💥 Garganta profunda: Tienes que hacerle garganta profunda a {player1} mientras {player2} te jala el cabello.',
  '❄️ Facial: Deja que {player2} se venga en toda tu cara y no te limpies por 2 minutos.',

  '💥 Penetración salvaje: 1 minuto de penetración rápida y ruda con {player1}.',
  '❄️ Compartir semen: Después de que {player2} termine en tu pecho, {player1} lo lame.',

  '💥 Beso negro profundo: Lame y mete la lengua en el ano de {player2}.',
  '❄️ Eyaculación en el trasero: Deja que {player1} termine sobre tus nalgas.',

  '💥 Gangbang express: {player1} te da oral mientras {player2} te penetra por 2 minutos.',
  '❄️ Tomar preseminal: Exprime el líquido preseminal de {player1} y bébelo.',
  '💥 Penetración anal: Recibe a {player1} por la vía anal por al menos 1 minuto.',
  '❄️ Cum swap (Beso de semen): Tú y {player2} se besan intercambiando el semen de {player1}.',
  '💥 Sexo a escondidas: Tengan penetración tú y {player2} en la sala mientras {player1} los graba.',
  '❄️ Creampie Anal: Deja que {player1} termine profundamente adentro de ti (si usan métodos seguros).',
  '💥 Juguete extremo: Usa el juguete sexual más grande o intenso que tengan en ti mismo.',
  '❄️ Orgasmo arruinado: Justo cuando vayas a venirte, {player1} te golpea los testículos/zona íntima (ligero) para pararlo.',
  '💥 Fisting (ligero) o dedos profundos: {player1} te mete 3 dedos o la mano (con cuidado y lubricante).',
  '❄️ Cum tribute: {player2} se masturba y se viene sobre una foto tuya o prenda tuya.',
  '💥 Juguete profundo: Te penetran con el dildo/consolador más grande que tengan.',
  '❄️ Limpiar con la boca: Limpia el miembro de {player2} con tu boca después de que estuvo dentro de {player1}.',

  '💥 Hasta el final: El juego acaba. Los tres cogen sin reglas hasta que todos terminen.',
  '👅 Pies (extremo): Lame la planta, el talón y chupa cada uno de los dedos de los pies de {player1}.',
  '🩲 Trofeo de caza: Mantén la ropa interior usada de {player2} dentro de tu boca durante 3 minutos.',
  '💧 Escupitajo: {player1} debe escupir directamente en tu boca abierta. ¡Trágalo!',
  '🐕 Esclavo humano: Arrodíllate y lame el piso por donde acaba de caminar {player2}.',
  '👃 Aroma visceral: Separa los glúteos de {player1} y respira su aroma íntimo de cerca.',
  '✋ Dominación extrema: {player2} puede usar tu rostro como asiento (simulado o real) por 30 segundos.',
  '🪢 Bondage completo: Que te aten de pies y manos. {player1} te hará lo que quiera sin que puedas moverte.',
  '👅 Beso negro: Dale una lamida larga a la zona anal de {player2}.',
  '👀 Degradación visual: Mírate en un espejo mientras {player1} te dice cosas sucias y te degrada.',
  '👄 Orina (Lluvia dorada previa): Huele un pañuelo o prenda con unas gotas de orina de {player2}.',
  '✋ Dolor y placer: {player1} te pellizcará los pezones con fuerza mientras te masturbas.',
  '🐕 Perro guardián: Mantente en cuatro patas y ladra si {player2} se acerca a {player1}.',
  '💧 Preseminal: {player1} debe untar su líquido preseminal en tus labios.',
  '🩲 Asfixia erótica: {player2} envolverá su ropa interior en tu cuello como una correa.',
  '👅 Saborear al otro: Lame los restos de fluidos de {player1} que quedaron en el cuerpo de {player2}.',
  '✋ Bofetadas: Recibe dos bofetadas de {player1} (moderadas) mientras lo miras a los ojos.',
  '👃 Olor a sexo: Si ya hubo penetración, huele los dedos de {player2} después de que tocó a {player1}.',
  '🪢 Exhibición forzada: {player1} y {player2} te abren las piernas a la fuerza y examinan tus genitales.',
  '👅 Baño de saliva: Ambos jugadores deben llenarte el pecho y el cuello de saliva.',
  '👀 Castidad mental: Tienes prohibido venirte hoy a menos que {player1} te lo suplique.',
  '👄 Inodoro humano: Abre la boca y deja que {player2} simule que la usa para orinar.',
  '✋ Nalgadas extremas: {player1} te dará nalgadas hasta dejar la zona roja.',
  "🐕 Humillación verbal: Repite en voz alta: 'Soy la perra de {player2}'.",
  '💧 Compartir fluidos: Tú y {player1} deben besarse pasándose un bocado de agua (o bebida) 5 veces seguidas.',
  '🩲 Fetiche de látex/cuero: Si hay condones u objetos, muerde uno y rómpelo con los dientes.',
  '👅 Limpieza esclava: Usa tu lengua para limpiar cualquier resto de sudor o fluido del abdomen de {player2}.',
  '✋ Pellizcos: {player1} te pellizcará la cara interna de los muslos.',
  '👃 Olfatear axila húmeda: Después de sudar un poco, huele profundamente la axila de {player2}.',
  '🪢 Amordazado: Te pondrán la ropa interior de {player1} como mordaza. No puedes hablar.',
  '👅 Chupar los dedos: {player2} te meterá dos dedos en la boca. Succiónalos como si fueran su miembro.',
  '👀 Voyeur extremo: Acuéstate en el piso debajo de ellos y míralos tener sexo (o frotarse) sobre ti.',
  '👄 Beso sádico: Besa a {player1} mientras te jala del cabello con fuerza.',
  '✋ Marcaje: {player2} debe morderte el hombro hasta dejar la marca de sus dientes.',
  '💧 Fluidos ajenos: Acepta que {player1} se venga en alguna parte de tu rostro o pecho.',
];

l3TrioTruths.forEach(t => generatedCards.push({ id: `3_t_${idCounter++}`, type: 'truth', level: 3, text: t }));

let l3Counter = 0;
l3Actions.forEach(action => {
  l2Targets.forEach(target => {
    // Re-use target logic ({player1}, {player2})

    if (l3Counter++ < 130) {
      generatedCards.push({
        id: `3_d_${idCounter++}`,
        type: 'dare',
        level: 3,
        text: `${action} `,
      });
    }
  });
});
for (let i = 0; i < 120; i++) {
  generatedCards.push({ id: `3_t_${idCounter++}`, type: 'truth', level: 3, text: l3TrioTruths[i % l3TrioTruths.length] });
}

// Finally, export array and selector logic
export const cards = generatedCards;

export const getRandomCard = (level, type, players, currentPlayer, playedCardIds = []) => {
  const available = cards.filter(c => c.level === level && (!type || type === 'random' || c.type === type) && !playedCardIds.includes(c.id));

  let pool = available;
  if (pool.length === 0) {
    pool = cards.filter(c => c.level === level && (!type || type === 'random' || c.type === type));
  }

  if (pool.length === 0) {
    return { id: 'error', type: 'dare', level: 1, text: 'Besa a la persona que tienes enfrente, se acabaron las cartas.' };
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const card = pool[randomIndex];

  let text = card.text;
  const otherPlayers = shuffle(players.filter(p => p !== currentPlayer));

  if (text.includes('{player1}')) {
    const p1 = otherPlayers.length > 0 ? otherPlayers[0] : 'Tu pareja';
    text = text.replace(/{player1}/g, p1);
  }
  if (text.includes('{player2}')) {
    const p2 = otherPlayers.length > 1 ? otherPlayers[1] : otherPlayers[0] || 'El invitado';
    text = text.replace(/{player2}/g, p2);
  }

  return { ...card, text };
};
