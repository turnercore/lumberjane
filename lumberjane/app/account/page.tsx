import ProfileForm from './components/ProfileForm';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Account() {
    const supabase = createServerComponentClient({ cookies });
    if (!supabase) return null;

    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if(!profile) return null;

    return (
        <div>
            <ProfileForm user={user} profile={profile} />
        </div>
    );
}