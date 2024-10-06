import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import NextTopLoader from "nextjs-toploader";
import ClientProvider from '@/components/providers/ClientProvider'
import Logo from '@/components/Logo'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import UserMenu from '@/components/user/UserMenu'
import { AppProvider } from '@/components/context/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Victoria WorldWide Solutions',
  description: 'Panel de Usuario',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <ClientProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AppProvider >

              <nav className="flex justify-between items-center border-b border-border h-[60px] px-4 py-2">
                <Logo />
                <div className="flex gap-4 items-center">
                  <ThemeSwitcher />
                  <UserMenu />

                </div>
              </nav>
              <NextTopLoader />

              {children}
              <Toaster />
            </AppProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClientProvider>
  );
}