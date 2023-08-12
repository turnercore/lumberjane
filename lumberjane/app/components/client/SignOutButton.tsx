"use client"

import { Button } from '@/components/ui'
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
    <Button onClick={() => handleSignOut()}>
        Sign Out
    </Button>
  )
}