import '@/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/server/Header'
import Toast from '@/components/client/Toast'
import Footer from './components/server/Footer'
import { ThemeProvider } from "@/components/ui/theme-provider"

import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // 'nodejs' (default) | 'edge'
 
const url = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Lumberjane',
  description: 'Store, log, and control your API access.',
  applicationName: 'Lumberjane',
  authors: [{ name: 'Turner Monroe', url: 'https://github.com/turnercore'}],
  creator: 'Turner Monroe',
  keywords: ['api', 'keys', 'lumberjane', 'gamejam'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const isDark = false

  return (
    <html lang="en">
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex flex-col min-h-screen">
              <Toast />
              <Header />
              <div className="flex-1 mt-3 mb-3">{children}</div>
              <div className="background"></div>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
    </html>
    )
  }
  