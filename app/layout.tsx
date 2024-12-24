import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/ThemeProvider'
import NextTopLoader from "nextjs-toploader";
import ClientProvider from '@/context/ClientProvider'
import { AppProvider } from '@/context/AppProvider'
import ErrorBoundary from '@/components/ui/error-boundary'
import { MessagesProvider } from '@/context/MessagesContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LogProvider } from '@/context/LogProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Victoria Worldwide Solutions',
  description: 'Accident Claim Reports Dashboard',
  icons: {
    icon: '/assets/vws.png',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <ClientProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <MessagesProvider>
              <AppProvider>
                <LogProvider>
                  <ErrorBoundary>
                    <NextTopLoader />
                    <TooltipProvider>
                      {children}
                    </TooltipProvider>
                    <Toaster />
                  </ErrorBoundary>
                </LogProvider>
              </AppProvider>
            </MessagesProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClientProvider>
  );
}