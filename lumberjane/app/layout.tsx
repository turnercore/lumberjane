"use client";
import '@/globals.scss'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { lightTheme, darkTheme } from '@/theme/theme';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContextProvider } from '@/context';
import React, { useState } from 'react';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const inter = Inter({ subsets: ['latin'] })

const metadata: Metadata = {
  title: 'Lumberjane',
  description: 'Store, log, and control your API access.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState(false);
  //Dark Mode switch
  const [isDark, setIsDark] = useState(false);
  const switchTheme: any = () => {
    setIsDark(!isDark);
  };
  
  return (
    <html lang="en">
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
         <CssBaseline />
         <body>
          <Header switchTheme={switchTheme} />
          <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDark ? 'dark' : 'light'}
          />
          <AuthContextProvider>
            {children}
          </AuthContextProvider>
          </body>
        </LocalizationProvider>
      </ThemeProvider>
    </html>
    )
  }
  