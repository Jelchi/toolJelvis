import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { GlobalAudioPlayer } from '@/components/layout/GlobalAudioPlayer';

export const metadata: Metadata = {
  title: 'NEXUS WORKSPACE — One Workspace. Infinite Possibilities.',
  description: 'All-in-One Multifunctional Productivity, Documentation, IT, and Creative Workspace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden bg-background text-primaryText antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 pb-24">
            {children}
          </main>
          <GlobalAudioPlayer />
        </div>
      </body>
    </html>
  );
}
