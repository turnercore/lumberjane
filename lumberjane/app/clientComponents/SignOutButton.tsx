"use client"

import { Button } from '@mui/material'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignOutButton() {
  const supabase = createClientComponentClient();

  const handleSignOut = () => {
    try {
        supabase.auth.signOut();
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