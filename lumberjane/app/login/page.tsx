/* eslint-disable react/no-unescaped-entities */
import { Container, Typography } from '@mui/material';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import SignOutButton from '@/components/SignOutButton';
import LoginMagicLinkForm from '@/components/LoginMagicLinkForm';

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  
  if (user) {
    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '0.5rem',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        <Typography variant="h4" align="center">
          You are currently logged in as {user.email}
        </Typography>
        <SignOutButton />
      </Container>
    );
  }
  else {
    return (
      <LoginMagicLinkForm />
    );
  }
}