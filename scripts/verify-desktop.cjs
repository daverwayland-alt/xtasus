/* node scripts/verify-desktop.cjs [path-to-playwright-package] */
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:3000/offline?level=2');
    assert.equal(await page.locator('.setup-layout').evaluate(el => getComputedStyle(el).display), 'grid');
    for (let i = 1; i <= 8; i++) {
      if (i > 2) await page.getByRole('button', { name: 'Agregar jugador' }).click();
      await page.getByPlaceholder(`Jugador ${i}`, { exact: true }).fill(`Cómplice ${i}`);
    }
    await page.screenshot({ path: 'doc/desktop-setup.png', fullPage: true });
    await page.getByRole('button', { name: 'Comenzar con 8' }).click();
    await page.getByRole('button', { name: /💭 Verdad/ }).waitFor();
    console.log('PASS: desktop setup with eight players');
    for (const width of [1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      const geometry = await page.evaluate(() => {
        const rect = sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x, width: r.width, right: r.right, y: r.y }; };
        return { layout: getComputedStyle(document.querySelector('.table-game')).display, stage: rect('.table-stage'), tools: rect('.table-tools'), roster: rect('.dock'), overflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert.equal(geometry.layout, 'grid');
      assert.equal(geometry.overflow, false);
      assert.ok(geometry.tools.right <= geometry.stage.x);
      assert.ok(geometry.stage.right <= geometry.roster.x);
      assert.ok(geometry.stage.width > width * .3);
      assert.equal(await page.locator('.dock-item').count(), 8);
      console.log(`PASS: ${width}px, three distinct columns, eight-player roster, no overflow`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.table-stage h2')).opacity === '1');
    await page.screenshot({ path: 'doc/desktop-table.png', fullPage: true });
    await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    assert.equal(await page.getByRole('dialog').getAttribute('data-desktop'), 'true');
    const panel = await page.getByRole('dialog').boundingBox();
    assert.ok(panel.x > 600 && panel.width >= 600);
    await page.keyboard.press('3');
    assert.equal(await page.locator('.playcard').count(), 0);
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    console.log('PASS: desktop side panel and keyboard disabled while panel is open');
    await page.keyboard.press('1');
    await page.locator('.playcard').waitFor();
    await page.waitForTimeout(1200);
    const cardText = await page.locator('.playcard-text').innerText();
    await page.keyboard.press('2');
    assert.equal(await page.locator('.playcard-text').innerText(), cardText);
    await page.screenshot({ path: 'doc/desktop-card.png', fullPage: true });
    console.log('PASS: keyboard draws a card and cannot replace an active card');
    await page.getByRole('button', { name: 'Pantalla completa', exact: true }).click();
    await page.waitForFunction(() => !!document.fullscreenElement);
    await page.getByRole('button', { name: 'Salir de pantalla completa', exact: true }).click();
    await page.waitForFunction(() => !document.fullscreenElement);
    console.log('PASS: fullscreen enter and exit');
    for (const width of [820, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('.table-game').evaluate(el => getComputedStyle(el).display), 'flex');
      assert.equal(await page.locator('.desktop-table-context').isVisible(), false);
      await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      assert.equal(await page.getByRole('dialog').getAttribute('data-desktop'), 'false');
      await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      console.log(`PASS: ${width}px touch layout and bottom sheet preserved`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://localhost:3000');
    await page.getByRole('button', { name: 'Que empiece la noche' }).click();
    await page.waitForURL(/\/lobby\//);
    await page.getByPlaceholder('Ej. Diablo24').waitFor();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.lobby-join')).opacity === '1' && getComputedStyle(document.querySelector('.lobby-code')).opacity === '1');
    assert.equal(await page.locator('.lobby-layout').evaluate(el => getComputedStyle(el).display), 'grid');
    await page.screenshot({ path: 'doc/desktop-lobby.png', fullPage: true });
    console.log('PASS: desktop lobby has its own two-column layout');
    const roomUrl = page.url().split('?')[0];
    await page.getByPlaceholder('Ej. Diablo24').fill('Host PC');
    await page.getByRole('button', { name: /Tomar asiento/ }).click();
    const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const phone = await phoneContext.newPage();
    phone.on('pageerror', error => errors.push(error.message));
    await phone.goto(roomUrl);
    await phone.getByPlaceholder('Ej. Diablo24').fill('Invitado móvil');
    await phone.getByRole('button', { name: /Tomar asiento/ }).click();
    await page.getByRole('button', { name: 'Comenzar la noche', exact: true }).click();
    await page.waitForURL(/\/game\//);
    await phone.waitForURL(/\/game\//);
    await page.getByRole('button', { name: /Sortear primer turno/ }).click();
    await page.getByRole('button', { name: 'Ajustes', exact: true }).waitFor();
    await phone.getByRole('button', { name: 'Ajustes', exact: true }).waitFor();
    assert.equal(await page.locator('.table-game').evaluate(el => getComputedStyle(el).display), 'grid');
    assert.equal(await phone.locator('.table-game').evaluate(el => getComputedStyle(el).display), 'flex');
    assert.equal(await page.locator('.dock-item').count(), 2);
    await phoneContext.close();
    console.log('PASS: desktop host and mobile guest play the same synchronized game');
    await page.goto('http://localhost:3000/lounge');
    await page.getByRole('button', { name: /El oráculo/ }).click();
    await page.getByRole('button', { name: 'Descubrir pregunta' }).click();
    await page.getByRole('dialog').waitFor();
    await page.screenshot({ path: 'doc/desktop-lounge.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: desktop Lounge panel and zero JavaScript errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
