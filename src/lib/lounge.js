export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function parseGuests(text) {
  return [...new Set(text.split(/[,\n]/).map(s => s.trim()).filter(Boolean))].slice(0, 12);
}

export function pairGuests(names) {
  const pool = shuffle(names);
  const pairs = [];
  while (pool.length > 1) pairs.push(pool.splice(0, 2));
  if (pool.length && pairs.length) pairs[pairs.length - 1].push(pool[0]);
  return pairs;
}

export function splitBill(total, tip, count) {
  if (![total, tip, count].every(Number.isFinite) || total < 0 || tip < 0 || count < 1 || !Number.isInteger(count)) return null;
  const cents = Math.round(total * 100);
  const tipCents = Math.round(cents * tip / 100);
  const all = cents + tipCents;
  const base = Math.floor(all / count);
  return { total: all / 100, tip: tipCents / 100, shares: Array.from({ length: count }, (_, i) => (base + (i < all % count ? 1 : 0)) / 100) };
}

export function validateDeck(value) {
  const cards = Array.isArray(value) ? value : value?.cards;
  if (!Array.isArray(cards) || !cards.length || cards.length > 200) throw new Error('El archivo debe contener entre 1 y 200 cartas.');
  return cards.map((card, i) => {
    const text = typeof card === 'string' ? card : card?.text;
    if (typeof text !== 'string' || !text.trim() || text.length > 400) throw new Error(`Revisa la carta ${i + 1}: máximo 400 caracteres.`);
    return { id: `custom-${i}-${text.trim().slice(0, 20)}`, text: text.trim() };
  });
}

export function downloadFile(name, data, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
