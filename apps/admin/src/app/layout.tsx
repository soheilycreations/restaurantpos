import '../global.css';
import { Inter } from 'next/font/google';
import { ToastProvider } from '../components/BikoToast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'WebPOS | Admin Command',
  description: 'Intelligent Restaurant Management & Catalog Optimization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
