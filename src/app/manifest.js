export default function manifest() {
  return {
    name: 'Xtasis — Drink Night',
    short_name: 'Xtasis',
    description: 'El juego de fiesta que lo cambia todo.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#060204',
    theme_color: '#060204',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
