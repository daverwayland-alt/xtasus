import { Outfit, Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SiteBackground from '@/components/Layout/SiteBackground';
import { Toaster } from 'sonner';
import MotionProvider from '@/components/Layout/MotionProvider';
import './night.css';
import './desktop.css';

/* Contemporary geometric display and a quiet, readable body face. */
const display = Outfit({
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});
const body = Poppins({
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});
const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Xtasis — El juego que lo cambia todo',
  description: 'Juego de copas y seducción para 2–8 jugadores: verdades, retos, caos y cócteles.',
  applicationName: 'Xtasis',
  appleWebApp: { capable: true, title: 'Xtasis', statusBarStyle: 'black-translucent' },
};

export const viewport = {
  themeColor: '#060204',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body suppressHydrationWarning>
        <SiteBackground />
        <MotionProvider><div className="page-root">{children}</div></MotionProvider>
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--ink-2)',
              border: '1.5px solid var(--accent)',
              color: 'var(--paper)',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
            },
          }}
        />
      </body>
    </html>
  );
}
