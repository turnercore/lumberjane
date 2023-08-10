"use client";
import '@/globals.scss'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import { lightTheme, darkTheme } from '@/theme/theme';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContextProvider } from '@/context';
import React, { useState } from 'react';
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
          <Toast isDark={isDark} />
          <Header switchTheme={switchTheme} />
          <AuthContextProvider>
            {children}
          </AuthContextProvider>
          </body>
        </LocalizationProvider>
      </ThemeProvider>
    </html>
    )
  }
  