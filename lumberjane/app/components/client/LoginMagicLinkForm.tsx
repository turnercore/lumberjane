/* eslint-disable react/no-unescaped-entities */
"use client";
import { Auth } from '@supabase/auth-ui-react'; 
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginMagicLinkForm() {
    const supabase = createClientComponentClient();
    const [loading, setLoading] = useState(false);

    async function handleSignIn(email: string) {
        const credentials =  {
            email,
            options: {
              emailRedirectTo: 'http://localhost:3000/api/v1/auth/callback'
            }
          }

       setLoading(true);
        try {
            await supabase.auth.signInWithOtp(credentials);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-md max-w-md mx-auto">
            <h1 className="text-2xl font-bold">Lumberjane Login</h1>
            <p>Sign in with the magic link, if you don't have an account you'll be automatically signed up for one.</p>
            <Auth
                supabaseClient={supabase}
                view='magic_link'
                appearance={{ theme: ThemeSupa }}
                theme="dark"
                showLinks={false}
                providers={[]}
                redirectTo="http://localhost:3000/api/v1/auth/callback"
            />
        </div>
    )
}
