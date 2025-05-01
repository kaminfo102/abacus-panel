import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import localFont from 'next/font/local';

const vazirmatn = localFont({
  src: [
    {
      path: '../public/fonts/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vazirmatn-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vazirmatn-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  title: 'سامانه مدیریت دانش آموزان',
  description: 'سامانه مدیریت دانش آموزان با قابلیت تعریف فعالیت‌ها',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}