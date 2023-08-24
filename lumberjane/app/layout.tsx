import '@/globals.css'
import type { Metadata } from 'next'
import Header from './components/server/Header'
import 'react-toastify/dist/ReactToastify.css'
import Toast from '@/components/client/Toast'
import Footer from './components/server/Footer'
import { ThemeProvider } from "@/components/ui/theme-provider"

export const dynamic = 'force-dynamic' // temporary fix for the dynamic issues with the server routes using cookies

const metadata: Metadata = {
  title: 'Lumberjane',
  description: 'Store, log, and control your API access.',
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
              <Header isDark={isDark}/>
              <div className="flex-1 mt-3 mb-3">{children}</div>
              <div className="background"></div>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
    </html>
    )
  }
  