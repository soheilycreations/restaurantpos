import '../global.css';
import { Inter } from 'next/font/google';
import { NotificationProvider } from '../components/NotificationProvider';
import { GlobalPrintManager } from '../components/GlobalPrintManager';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased m-0 p-0`}>
        <NotificationProvider>
          <GlobalPrintManager />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
