import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import type { ExpirationRestriction, Token, ServerError, StandardResponse } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const tokenSecret = process.env.LUMBERJANE_MASTER_KEY || '';

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

  const data: Token = decodedToken;
  return { data };
}

function verifyToken(token: string): Token | void {
  try {
    const decodedToken = jwt.verify(token, tokenSecret) as Token;
    return decodedToken;
  } catch (err) {
    return;
  }
}

async function checkExpiration(decodedToken: Token): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const expirationRestriction: ExpirationRestriction = decodedToken.restrictions?.find((r: any) => r.type === 'expirationDate') as ExpirationRestriction;
  if (expirationRestriction && new Date(expirationRestriction.rule.expirationDate) < new Date()) {
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

async function checkRevocation(decodedToken: Token): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
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