import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import SignOutButton from '@/components/client/SignOutButton';
import LoginMagicLinkForm from '@/components/client/LoginForm';

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user;
  
  if (user) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 border rounded-md max-w-md mx-auto">
        <h4 className="text-center">
          You are currently logged in as {user.email}
        </h4>
        <SignOutButton />
      </div>
    );
  }
  else {
    return (
      <LoginMagicLinkForm />
    );
  }
}
