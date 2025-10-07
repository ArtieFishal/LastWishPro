import './globals.css';
import { Providers } from './lib/providers';

export const metadata = { 
  title: 'LastWish', 
  description: 'Estate planning for digital assets' 
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <Providers>
          <div className="mx-auto max-w-6xl p-4">
            <header className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="LastWish" className="h-10 w-10"/>
                <h1 className="text-2xl font-semibold">LastWish</h1>
              </div>
              <nav className="text-sm flex gap-4">
                <a href="/" className="hover:underline">Home</a>
                <a href="/onboarding" className="hover:underline">Start</a>
                <a href="/generate" className="hover:underline">Generate</a>
              </nav>
            </header>
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
