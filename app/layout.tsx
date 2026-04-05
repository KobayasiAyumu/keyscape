import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Keyscape — Your Typing is Music',
  description:
    'Type anything. Your keystroke rhythm becomes a unique generative music composition in real time.',
  openGraph: {
    title: 'Keyscape',
    description: 'Your typing rhythm becomes music.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistMono.variable} h-full`}>
      <body className="h-full bg-[#05050f] antialiased noise-overlay">{children}</body>
    </html>
  );
}
