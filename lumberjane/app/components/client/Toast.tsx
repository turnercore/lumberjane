"use client"
import { ToastContainer } from 'react-toastify'

const Toast = (isDark: boolean = false) => {
    return (<ToastContainer
    position="bottom-center"
    autoClose={5000}
    hideProgressBar={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme={isDark ? 'dark' : 'light'}
    />)
}

export default Toast;