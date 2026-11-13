import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/lounge.js', import.meta.url), 'utf8');
const { splitBill, shuffle, parseGuests, pairGuests, validateDeck } = await import(`data:text/javascript,${encodeURIComponent(source)}`);

test('the split always preserves the exact bill including tip, for 1–12 guests', () => {
  for (const amount of [0, .01, 10.03, 1234.57, 99999.99]) {
    for (const tip of [0, 10, 13, 30]) {
      for (let guests = 1; guests <= 12; guests++) {
        const bill = splitBill(amount, tip, guests);
        assert.equal(Math.round(bill.shares.reduce((sum, n) => sum + n, 0) * 100), Math.round(bill.total * 100));
        assert.ok(Math.max(...bill.shares) - Math.min(...bill.shares) < .011);
      }
    }
  }
});
test('invalid bills cannot produce a misleading financial result', () => {
  for (const args of [[-1, 10, 2], [10, -5, 2], [10, 10, 0], [10, 10, 1.5], [Infinity, 0, 2], [NaN, 10, 2]]) assert.equal(splitBill(...args), null);
});
test('guest parsing trims names, ignores blanks, deduplicates and limits the room', () => {
  assert.deepEqual(parseGuests(' Alex, Val, Alex,\nDani, , '), ['Alex', 'Val', 'Dani']);
  assert.equal(parseGuests(Array.from({ length: 20 }, (_, i) => `Guest${i}`).join(',')).length, 12);
});
test('an odd group has a trio and nobody is left out or duplicated', () => {
  for (let n = 2; n <= 12; n++) {
    const names = Array.from({ length: n }, (_, i) => String(i));
    const pairs = pairGuests(names);
    assert.deepEqual(pairs.flat().sort(), [...names].sort());
    assert.ok(pairs.every(pair => pair.length === 2 || pair.length === 3));
  }
});
test('shuffle does not mutate its input and supports a deterministic random source', () => {
  const cards = ['a', 'b', 'c'];
  assert.deepEqual(shuffle(cards, () => 0), ['b', 'c', 'a']);
  assert.deepEqual(cards, ['a', 'b', 'c']);
});
test('deck import supports plain arrays and exported card objects', () => {
  assert.equal(validateDeck(['  What a night?  '])[0].text, 'What a night?');
  assert.equal(validateDeck({ cards: [{ text: 'A custom challenge' }] })[0].text, 'A custom challenge');
});
test('malformed, oversized or empty decks fail before they can replace a collection', () => {
  for (const invalid of [null, {}, [], [null], [2], [''], ['x'.repeat(401)], Array(201).fill('card')]) assert.throws(() => validateDeck(invalid));
});
test('the lounge contains exactly fifteen individually routable feature identifiers', async () => {
  const data = await readFile(new URL('../src/data/lounge.js', import.meta.url), 'utf8');
  const { LOUNGE_TOOLS } = await import(`data:text/javascript,${encodeURIComponent(data)}`);
  assert.equal(LOUNGE_TOOLS.length, 15);
  assert.equal(new Set(LOUNGE_TOOLS.map(tool => tool.id)).size, 15);
});
