import { Poppins, Ephesis } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navigate/Navbar';

const PoppinsFont = Poppins({
  variable: '--font-Poppins',
  weight: '400',
});
const ephesisFont = Ephesis({
  variable: '--font-ephesis',
  weight: '400',
});

export const metadata = {
  title: 'Xtasis',
  description: 'Drink App by DRW',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${PoppinsFont.variable} ${ephesisFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
