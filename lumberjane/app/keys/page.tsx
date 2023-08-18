import { NextPage } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import KeyList from './components/KeyList';
import { Key } from '@/types';
import { cookies } from 'next/headers';
import { decrypt } from '@/utils/crypto';
import { Card } from '@/components/ui';

const KeysDashboard: NextPage = async () => {
    const supabase = createServerComponentClient({ cookies });
    if (!supabase) return null;

    const user = (await supabase.auth.getSession()).data.session?.user;

    if (!user) {
        console.log('You must be logged in to view this page!');
        return null;
    }

    let keys: Key[] = [];

    const { data, error } = await supabase
        .from('keys')
        .select('*')
        .eq('userId', user.id);

    if (data && Array.isArray(data)) {
        keys = data;
    } else if (error) {
        console.log('Error fetching keys!');
    }

    // Decrypt keys and add the decrypted value to the key object under 'decryptedValue'
    for (const key of keys) {
        try {
            if (key.decryptedValue) continue;
            if (!key.value) continue;
            const { decrypted, error } = await decrypt(key.value);
            if (decrypted) {
                key.decryptedValue = decrypted;
            } else if (error) {
                console.log('Error decrypting key!');
                console.log(error);
            }
        } catch (err) {
            console.log('Error decrypting key outside of try!');
            console.log(err);
        }
    }

    return (
        <Card className='mx-auto max-w-2xl p-3 shadow-md'>
            <h1 className='text-center text-lg'>API Keys</h1>
            <KeyList keys={keys} />
        </Card>
      );
    };

export default KeysDashboard;