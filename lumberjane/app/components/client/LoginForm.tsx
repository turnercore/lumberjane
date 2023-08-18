/* eslint-disable react/no-unescaped-entities */
'use client';
import { Auth } from '@supabase/auth-ui-react'; 
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { Provider } from '@supabase/supabase-js';

const providersENV = process.env.NEXT_PUBLIC_PROVIDERS || '';

export default function LoginMagicLinkForm() {
    const supabase = createClientComponentClient();

    //Split providers by , and add each to the providers list
    const providers = [] as Provider[];
    try {
        //This isn't really an error, maybe remove error and just make it empty array.
        if(!providersENV) throw new Error('No providers found in env');
        const providersArray = providersENV.split(',');
        console.log(providersENV)
        console.log(providersArray);
        providersArray.forEach(provider => {
            providers.push(provider as Provider);
        });
    } catch (error: any) {
        console.error(error.message);
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
        <Tabs defaultValue="magicLink" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="magicLink">{"Magic Link 🧙‍♂️"}</TabsTrigger>
            <TabsTrigger value="signIn">{"Sign In 🧑‍💻"}</TabsTrigger>
            <TabsTrigger value="signUp">{"Sign Up 📝"}</TabsTrigger>
          </TabsList>
          <TabsContent value="magicLink">
            <Card>
              <CardHeader>
                <CardTitle>Magic Link</CardTitle>
                <CardDescription>Sign in or Sign up with a magic link to your email.</CardDescription>
              </CardHeader>
              <CardContent>
                <Auth
                  supabaseClient={supabase}
                  view="magic_link"
                  appearance={{ theme: ThemeSupa }}
                  theme="light"
                  showLinks={false}
                  providers={providers}
                  redirectTo="http://localhost:3000/api/v1/auth/callback"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signIn">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Sign in with your email and password.</CardDescription>
              </CardHeader>
              <CardContent>
                <Auth
                  supabaseClient={supabase}
                  view="sign_in"
                  appearance={{ theme: ThemeSupa }}
                  theme="light"
                  showLinks={false}
                  providers={providers}
                  redirectTo="http://localhost:3000/api/v1/auth/callback"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signUp">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create a new account with an email and password.</CardDescription>
              </CardHeader>
              <CardContent>
                <Auth
                  supabaseClient={supabase}
                  view="sign_up"
                  appearance={{ theme: ThemeSupa }}
                  theme="light"
                  showLinks={false}
                  providers={providers}
                  redirectTo="http://localhost:3000/api/v1/auth/callback"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
}