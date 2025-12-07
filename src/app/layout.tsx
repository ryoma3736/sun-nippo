// Root Layout - sun-nippo

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'sun-nippo - サントリー営業日報アプリ',
  description: '営業活動を効率化し、日報作成を自動化するアプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
