import '@/globals.css'
import type { Metadata } from 'next'
import Header from './components/server/Header';
import 'react-toastify/dist/ReactToastify.css';
import Toast from '@/components/client/Toast';


// const inter = Inter({ subsets: ['latin'] })

const metadata: Metadata = {
  title: 'Lumberjane',
  description: 'Store, log, and control your API access.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
        <body>
          <Toast isDark='false' />
          <Header />
          {children}
        </body>
    </html>
    )
  }
  