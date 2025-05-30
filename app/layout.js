import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WhatsApp Invoice Generator',
  description: 'Generate and send professional invoices via WhatsApp',
  keywords: 'invoice, invoice generator, free invoice generator, whatsapp invoice generator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className={`${inter.className} h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
