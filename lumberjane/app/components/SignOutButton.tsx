"use client"
import { Button } from '@mui/material'
import { useAuthContext } from '@/context/index'

export default function SignOutButton() {
    const { signOut } = useAuthContext()

  const handleSignOut = () => {
    try {
        signOut()
        window.location.href = '/'
    } catch (error) {
        console.log(error);
    }
  }

  return (
    <Button
        variant="contained"
        color="primary"
        onClick={() => handleSignOut()}
        style={{ width: '100%', marginTop: '1rem' }}
    >
        Sign Out
    </Button>
  )
}