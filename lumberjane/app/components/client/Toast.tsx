"use client"
import { useTheme } from 'next-themes';
import { ToastContainer } from 'react-toastify'

const Toast = () => {
    const { theme, setTheme } = useTheme();

    return (<ToastContainer
    position="bottom-center"
    autoClose={5000}
    hideProgressBar={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme={theme === "dark" ? "dark" : "light"}
    />)
}

export default Toast;