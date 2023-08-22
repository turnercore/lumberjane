import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { TokenData } from '@/types';
import { cookies } from 'next/headers';

const fetchTokens = async () : Promise<TokenData[] | null> => {
  const supabase = createServerComponentClient({cookies});
  if (!supabase) return null;

  const user = (await supabase.auth.getSession()).data.session?.user;
  if (!user) {
    console.log('You must be logged in to view this page!');
    return null;
  }

  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'deleted');

  if (error) {
    console.log('Error fetching tokens!');
    return null;
  }

  return data;
};

const fetchDeletedTokens = async () : Promise<TokenData[] | null> => {
  const supabase = createServerComponentClient({cookies});
  if (!supabase) return null;

  const user = (await supabase.auth.getSession()).data.session?.user;
  if (!user) {
    console.log('You must be logged in to view this page!');
    return null;
  }

  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'deleted');

  if (error) {
    console.log('Error fetching tokens!');
    return null;
  }

  return data;
}


export { fetchTokens, fetchDeletedTokens };