import '@/globals.scss'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import { ThemeProvider, CssBaseline, Grid, FormControlLabel, Switch } from '@mui/material';
import Header from './serverComponents/Header';
import 'react-toastify/dist/ReactToastify.css';
import Toast from '@/clientComponents/Toast';


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
         <CssBaseline />
        <body>
          <Toast isDark='false' />
          <Header />
          {children}
        </body>
    </html>
    )
  }
  