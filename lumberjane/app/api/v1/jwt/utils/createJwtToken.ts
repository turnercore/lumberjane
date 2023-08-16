import jwt from 'jsonwebtoken';
import { JwtToken, TokenFormFields } from '@/types';
import crypto, { UUID } from 'crypto';
import { User } from '@supabase/auth-helpers-nextjs';

const jwtSecret = process.env.LUMBERJANE_MASTER_KEY || 'super-secret-jwt-key-seriously-you-should-change-this';

interface TokenResult {
  tokenData: JwtToken;
  token: string;
}
export default async function createJwtToken(user: User, requestBody: TokenFormFields): Promise<TokenResult> {
  // Create UUID for record
  const id = crypto.randomUUID();

  const tokenData: JwtToken = {
    info: {
      id,
      formatResponse: requestBody.expectedResponse ? true : false,
      user: user.id as UUID,
      key: requestBody.key,
      name: requestBody.name,
      description: requestBody.description,
      method: requestBody.method,
      headers: requestBody.headers || undefined,
      authType: requestBody.authType || 'bearer',
      auth: requestBody.auth || undefined,
      endpoint: requestBody.endpoint,
      ai_enabled: requestBody.aiEnabled || false,
      ai_key: requestBody.openAIKey || undefined,
    },
    restrictions: requestBody.restrictions || [],
    request: requestBody.request || '',
    expectedResponse: requestBody.expectedResponse || undefined,
    log: {
      enabled: requestBody.logEnabled || false,
      log_level: requestBody.logLevel || 'info',
      log_response: requestBody.logResponse || false,
    }
  };

  if(tokenData.info.authType === 'none') {
    tokenData.info.auth = undefined;
    tokenData.info.key = undefined;
  }

  // Create the JWT token
  const token = jwt.sign(tokenData, jwtSecret);

  return {tokenData, token};
}