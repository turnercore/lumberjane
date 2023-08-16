import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import type { ExpirationRestriction, JwtToken, ServerError, StandardResponse } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const jwtSecret = process.env.LUMBERJANE_MASTER_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function validateToken(token: string, isTest: boolean = false): Promise<StandardResponse> {
  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    const error = {
      message: 'Invalid token.',
      status: 401,
    };
    return { error };
  }

  if (!isTest) {
  const isExpired = await checkExpiration(decodedToken);
  if (isExpired) {
    const error = {
      message: 'Token has expired.',
      status: 401,
    };
    return { error };
  }
}

  if (!isTest) {
    const isRevoked = await checkRevocation(decodedToken);
    if (isRevoked) {
      const error = {
        message: 'Token has been revoked or frozen.',
        status: 401,
      };
      return { error };
    }
  }

  const data: JwtToken = decodedToken;
  return { data };
}

function verifyToken(token: string): JwtToken | void {
  try {
    const decodedToken = jwt.verify(token, jwtSecret) as JwtToken;
    return decodedToken;
  } catch (err) {
    return;
  }
}

async function checkExpiration(decodedToken: JwtToken): Promise<boolean> {
  const expirationRestriction: ExpirationRestriction = decodedToken.restrictions?.find((r: any) => r.type === 'expirationDate') as ExpirationRestriction;
  if (expirationRestriction && new Date(expirationRestriction.rule.date) < new Date()) {
    return true;
  }
  const { data: tokenRecord, error: dbError } = await supabase
    .from('tokens')
    .select('expiration')
    .eq('id', decodedToken.info.id);

  if (dbError) {
    return true;
  }

  if (tokenRecord && tokenRecord[0]?.expiration && new Date(tokenRecord[0].expiration) < new Date()) {
    return true;
  }

  return false;
}

async function checkRevocation(decodedToken: JwtToken): Promise<boolean> {
  const { data: tokenData, error: supabaseError } = await supabase
    .from('tokens')
    .select('status')
    .eq('id', decodedToken.info.id)
    .single();

  if (supabaseError || tokenData.status !== 'active') {
    return true;
  }

  return false;
}