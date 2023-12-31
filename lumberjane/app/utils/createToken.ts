import jwt from 'jsonwebtoken'
import { User } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import type { Token, TokenFormFields, UUID } from '@/types'

const tokenSecret = process.env.LUMBERJANE_MASTER_KEY || 'super-secret-jwt-key-seriously-you-should-change-this'

interface TokenResult {
  tokenData: Token
  token: string
}
export default async function createToken(user: User, requestBody: TokenFormFields): Promise<TokenResult> {
  // Create UUID for record
  const id = uuidv4() as UUID

  const tokenData: Token = {
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
  }

  if(tokenData.info.authType === 'none') {
    tokenData.info.auth = undefined
    tokenData.info.key = undefined
  }

  // Create the JWT token
  const token = jwt.sign(tokenData, tokenSecret)

  return {tokenData, token}
}