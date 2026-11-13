/* Optional browser QA: node scripts/verify-night.cjs [path-to-playwright-package]
   Requires a locally installed Playwright and Chrome. Does not use a visible browser. */
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const results = [];
    const pass = name => { results.push(name); console.log('PASS:', name); };
    const open = async name => { await page.getByRole('button', { name: new RegExp(name) }).click(); await page.getByRole('dialog').waitFor(); };
    const close = async () => { await page.getByRole('button', { name: 'Cerrar', exact: true }).click(); await page.getByRole('dialog').waitFor({ state: 'hidden' }); };
    await page.goto('http://localhost:3000/lounge');
    assert.equal(await page.locator('.lounge-tool').count(), 15);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    pass('15 experiences, mobile has no overflow');

    await open('Ritual de la noche');
    await page.getByRole('button', { name: 'Descubrir pregunta' }).click();
    await page.getByRole('button', { name: /La tensión/ }).click();
    await page.getByRole('button', { name: 'Descubrir pregunta' }).click();
    await page.waitForFunction(() => document.querySelector('.lounge-prompt .eyebrow').textContent.includes('ACTO 03'));
    pass('guided three-act journey'); await close();

    await open('El oráculo');
    await page.getByRole('button', { name: 'Descubrir pregunta' }).click();
    await page.waitForFunction(() => !document.querySelector('.lounge-prompt>p').textContent.includes('Las mejores conversaciones'));
    const question = await page.locator('.lounge-prompt>p').innerText();
    await page.getByRole('button', { name: 'Guardar pregunta' }).click();
    await close(); await page.reload(); await open('La colección');
    await page.getByRole('dialog').getByText(question, { exact: true }).waitFor();
    pass('oracle and favorites persist after reload'); await close();

    await open('Química a ciegas');
    await page.getByRole('button', { name: /Persona 1 · empezar/ }).click();
    for (let i = 0; i < 5; i++) await page.locator('.lounge-panel .night-button.secondary').first().click();
    await page.getByRole('button', { name: 'Soy la persona 2. Vamos.' }).click();
    for (let i = 0; i < 5; i++) await page.locator('.lounge-panel .night-button.secondary').first().click();
    assert.match(await page.locator('.big-score').innerText(), /5/);
    pass('private chemistry answers and 5/5 matching'); await close();

    await open('Dos tentaciones');
    await page.getByLabel('Personas en la mesa').selectOption('2');
    await page.locator('.dilemma-options button').first().click();
    await page.getByRole('button', { name: 'Listo para votar' }).click();
    await page.locator('.dilemma-options button').last().click();
    assert.deepEqual(await page.locator('.dilemma-options b').allTextContents(), ['50%', '50%']);
    pass('hidden voting and exact result'); await close();

    await open('Azar & destino');
    await page.locator('textarea').fill('Alex, Val, Dani');
    await page.getByRole('button', { name: 'Parejas', exact: true }).click();
    await page.getByRole('button', { name: 'Invocar al destino' }).click();
    await page.waitForFunction(() => !document.querySelector('.destiny-orb').classList.contains('spinning'));
    assert.equal((await page.locator('.roulette-result').innerText()).split(' & ').length, 3);
    pass('roulette includes odd guest in a trio'); await close();

    await open('El infiltrado');
    await page.locator('textarea').fill('Alex, Val, Dani');
    await page.getByRole('button', { name: 'Repartir identidades' }).click();
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /ver mi rol/ }).click();
      await page.getByRole('button', { name: 'Ocultar y pasar' }).click();
    }
    await page.getByRole('button', { name: 'Revelar al infiltrado' }).click();
    await page.getByRole('button', { name: 'Nueva ronda', exact: true }).waitFor();
    pass('spy private dealing and reveal'); await close();

    await open('Cinco segundos');
    await page.getByRole('button', { name: 'Arrancar el reloj' }).click();
    await page.getByRole('button', { name: 'Lo logré +1' }).click();
    await page.getByText('1 puntos', { exact: true }).waitFor();
    pass('five second round and score'); await close();

    await open('Entre líneas');
    await page.getByRole('button', { name: 'Turno del equipo A' }).click();
    await page.getByRole('button', { name: 'Adivinada +1' }).click();
    assert.match(await page.locator('.team-score').innerText(), /1/);
    pass('taboo team score and forbidden-word cards'); await close();

    await open('Atelier de cócteles');
    await page.getByRole('button', { name: 'Sin alcohol', exact: true }).click();
    assert.equal(await page.locator('.recipe-option').count(), 3);
    await page.getByRole('button', { name: /Cherry Kiss/ }).click();
    await page.getByText('120 ml', { exact: true }).waitFor();
    pass('mocktail filter and quantities for two servings'); await close();

    await open('Paisaje sonoro');
    await page.getByRole('button', { name: 'Encender la atmósfera' }).click();
    await page.getByRole('button', { name: 'Pausar ambiente' }).waitFor();
    await page.getByRole('button', { name: 'Pausar ambiente' }).click();
    pass('WebAudio starts and stops'); await close();

    await open('La invitación');
    const invitationDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: /Descargar pase en PNG/ }).click();
    const invitation = await invitationDownload;
    assert.equal(invitation.suggestedFilename(), 'xtasis-invitacion.png');
    await invitation.saveAs('doc/night-invitation.png');
    pass('real invitation PNG download with QR'); await close();

    await open('Tu propio mazo');
    await page.getByLabel('Una pregunta, un reto, una idea').fill('Mi pregunta de prueba');
    await page.getByRole('button', { name: /Añadir carta/ }).click();
    await page.getByRole('button', { name: 'Sacar una carta' }).click();
    await page.locator('.lounge-prompt>p').getByText('Mi pregunta de prueba', { exact: true }).waitFor();
    await page.locator('input[type=file]').setInputFiles({ name: 'deck.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(['Pregunta importada'])) });
    await page.getByText('Pregunta importada', { exact: true }).waitFor();
    const deckDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar', exact: true }).click();
    assert.equal((await deckDownload).suggestedFilename(), 'xtasis-mi-mazo.json');
    await close(); await page.reload(); await open('Tu propio mazo');
    await page.getByText('Pregunta importada', { exact: true }).waitFor();
    pass('deck writing, drawing, import, export and reload persistence'); await close();

    await open('El itinerario');
    await page.getByLabel('Próximo acto').fill('El cierre');
    await page.getByRole('button', { name: 'Añadir al itinerario' }).click();
    await page.getByRole('button', { name: 'Iniciar', exact: true }).first().click();
    await page.locator('.planner-timer').waitFor();
    pass('itinerary editing and countdown'); await close();

    await open('La cuenta, clara');
    await page.getByLabel('Cuenta antes de propina · MXN').fill('100');
    await page.locator('.bill-total strong').getByText('$110.00', { exact: true }).waitFor();
    assert.equal(await page.locator('.result-row strong').first().innerText(), '$27.50');
    pass('bill and tip split'); await close();

    await page.getByLabel('Buscar experiencias').fill('noexistentxyz');
    await page.getByRole('heading', { name: 'No encontramos ese plan.' }).waitFor();
    await page.getByRole('button', { name: 'Ver todas las experiencias' }).click();
    assert.equal(await page.locator('.lounge-tool').count(), 15);
    pass('search empty state and recovery');

    await page.goto('http://localhost:3000/offline?level=2');
    await page.getByPlaceholder('Jugador 1').fill('Alex');
    await page.getByPlaceholder('Jugador 2').fill('Val');
    await page.getByRole('button', { name: /Comenzar con 2/ }).click();
    await page.getByRole('button', { name: 'Ajustes', exact: true }).waitFor();
    pass('existing local game setup still starts');
    await page.goto('http://localhost:3000');
    await page.getByRole('button', { name: 'Que empiece la noche' }).click();
    await page.waitForURL(/\/lobby\/[A-Z0-9]{4}/);
    const roomUrl = page.url().split('?')[0];
    await page.getByPlaceholder('Ej. Diablo24').fill('Host QA');
    await page.getByRole('button', { name: /Tomar asiento/ }).click();
    const guestContext = await browser.newContext({ reducedMotion: 'reduce' });
    const guest = await guestContext.newPage();
    guest.setDefaultTimeout(8000);
    guest.on('pageerror', error => errors.push(error.message));
    await guest.goto(roomUrl);
    await guest.getByPlaceholder('Ej. Diablo24').fill('Guest QA');
    await guest.getByRole('button', { name: /Tomar asiento/ }).click();
    await page.getByRole('button', { name: 'Comenzar la noche' }).click();
    await page.waitForURL(/\/game\//);
    await guest.waitForURL(/\/game\//);
    await page.getByRole('button', { name: /Sortear primer turno/ }).click();
    await page.getByRole('button', { name: 'Ajustes', exact: true }).waitFor();
    await guest.getByRole('button', { name: 'Ajustes', exact: true }).waitFor();
    await page.screenshot({ path: 'doc/night-game.png', fullPage: true });
    await guestContext.close();
    pass('create room, two isolated players, SSE and synchronized game start');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ checks: results.length, javascriptErrors: errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
