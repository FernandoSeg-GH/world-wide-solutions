import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import NextTopLoader from "nextjs-toploader";
import ClientProvider from '@/components/providers/ClientProvider'
import { AppProvider } from '@/components/context/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vinci Suite',
  description: 'Smart Tools for Business',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <ClientProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AppProvider >
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