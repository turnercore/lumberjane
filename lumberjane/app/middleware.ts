// import { GetServerSidePropsContext } from 'next';
// import { Session } from '@supabase/supabase-js';


// export async function requireAuth({ req, res }: GetServerSidePropsContext) {
//   const { user }: { user: Session } = await supabaseClient.auth.api.getUserByCookie(req);

//   if (!user) {
//     res.writeHead(302, { Location: '/login' });
//     res.end();
//     return { props: {} };
//   }

//   return { props: { user } };
// }