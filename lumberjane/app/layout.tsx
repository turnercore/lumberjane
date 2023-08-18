import '@/globals.css'
import type { Metadata } from 'next'
import Header from './components/server/Header';
import 'react-toastify/dist/ReactToastify.css';
import Toast from '@/components/client/Toast';
import Footer from './components/server/Footer';


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

  const isDark = false;

  return (
    <html lang="en">
        <body className="flex flex-col min-h-screen">
          <Toast isDark={isDark} />
          <Header isDark={isDark}/>
          <div className="flex-1 mt-3">{children}</div>
          <div className="background"></div>
          <Footer />
        </body>
    </html>
    )
  }
  