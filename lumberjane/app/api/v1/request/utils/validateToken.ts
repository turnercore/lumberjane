import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import type { ExpirationRestriction, JwtToken, ServerError, StandardResponse } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const jwtSecret = process.env.LUMBERJANE_MASTER_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function validateToken(token: string): Promise<StandardResponse> {
  const error: ServerError = { message: '', status: 500};

  if (!token) {
    error.message = 'Lumberjane token is required.';
    error.status = 401;
    return { error };
  }

  // Verify the token
  let decodedToken: JwtToken;
  try {
    decodedToken = jwt.verify(token, jwtSecret) as JwtToken;
  } catch (err) {
    error.message = 'Invalid token.';
    error.status = 401;
    return { error };
  }

  // Check for expiration in the database
  const { data: tokenRecord, error: dbError } = await supabase
    .from('tokens')
    .select('expiration')
    .eq('id', decodedToken.info.id);

  if (dbError) {
    console.error('Database error when checking token expiration:', dbError);
    error.message = 'Database error when checking token expiration.';
    error.status = 500;
    return { error };
  }

  if (tokenRecord && tokenRecord[0]?.expiration && new Date(tokenRecord[0].expiration) < new Date()) {
    error.message = 'Token has expired.';
    error.status = 401;
    return { error };
  }

  // Check for expiration in the token restrictions
  const expirationRestriction: ExpirationRestriction = decodedToken.restrictions?.find((r: any) => r.type === 'expirationDate') as ExpirationRestriction;
  if (expirationRestriction && new Date(expirationRestriction.rule.date) < new Date()) {
    error.message = 'Token has expired.';
    error.status = 401;
    return { error };
  }

  // Check to make sure the token has not been revoked by checking the database
  const { data: tokenData, error: supabaseError } = await supabase
    .from('tokens')
    .select('status')
    .eq('id', decodedToken.info.id)
    .single();

  if (supabaseError || tokenData.status !== 'active') {
    error.message = 'Token has been revoked or frozen.';
    error.status = 401;
    return { error };
  }

  const data: JwtToken = decodedToken;

  return { data };
}
