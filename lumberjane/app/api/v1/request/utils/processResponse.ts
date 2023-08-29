import type { StandardResponse, UUID } from "@/types"
import { fetchAndDecryptKey, openAiAssist, moderateInputWithOpenAI } from "./"
import { matchJSONtoSchema } from "@/utils/utils"
import { SupabaseClient, createClient } from '@supabase/supabase-js'

const isCommercial = process.env.NEXT_PUBLIC_ENABLE_COMMERCIAL === 'true' || false
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

type AiAssistOptions = {
  enabled: boolean,
  openAiKeyId?: UUID,
  userId?: UUID,
  passphrase?: string // Used for double encryption
}

// Test a key using the moderation input
async function testKey(key: string): Promise<boolean> {
  try {
    const testInput = "This is a test input for moderation."
    const moderationResult = await moderateInputWithOpenAI(key, testInput)
    if (moderationResult) {
      return true
    } else {
      return false
    }
  } catch(err:any) {
    return false
  }
}

async function isAllowedServerKey(aiAssist: AiAssistOptions, supabase: SupabaseClient): Promise<boolean> {
  try {
    // First make sure the server key exists and is valid:
    const serverOpenAiKey = process.env.OPENAI_API_KEY || ''
    if (!serverOpenAiKey) {
      return false
    }
    if (!await testKey(serverOpenAiKey)) {
      return false
    }
    // Now check if the user has a support level > 0 or if commercial is disabled
    if(!isCommercial) {
      return true
    }
    // If the user has a support level > 0 then they can use the server key
    if (!aiAssist.userId) {
      return false
    }
    //Look up the user's support level
    const {data: supporterRecord, error} = await supabase
      .from('supporters')
      .select('support_level')
      .eq('id', aiAssist.userId)
      .single()
    if (error) {
      console.error('Error querying supporters table:', error)
      return false
    }
    if (supporterRecord?.support_level > 0) {
      return true
    }
    return false
  } catch(err: any) {
    return false
  }
}

async function fetchValidOpenAiKey(aiAssist: AiAssistOptions): Promise<string | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  // First see if the user has an OpenAI key set and if it is valid
  if (aiAssist.openAiKeyId && aiAssist.userId) {
    // Fetch the key from your database or wherever it's stored
    const {data: fetchedKey, error:keyFetchError} = await fetchAndDecryptKey(aiAssist.openAiKeyId, aiAssist.userId, aiAssist.passphrase)
    if (keyFetchError || !fetchedKey) {
      console.error('Error fetching OpenAI key:', keyFetchError)
      return null
    }
    // Validate the key by making a test moderation request
    if (await testKey(fetchedKey)) { return fetchedKey }
  }
  // If we're here then the user does not have a valid openai key for some reason.
  // See if the user can use the server key under the following conditions:
  const allowedUseOfServerKey = await isAllowedServerKey(aiAssist, supabase)

  if (allowedUseOfServerKey) {
    // Use the server key for the request
    return process.env.OPENAI_API_KEY || null
  }
  // If we're here then the user is not allowed to use the server key and does not have a valid key set
  return null
}

/**
 * Process a given response against an expected schema and optionally use AI assistance.
 * @param response - The actual response data.
 * @param expectedResponse - The expected schema of the response.
 * @param aiAssist - Options for AI assistance.
 * @returns - A promise that resolves to a StandardResponse object.
 */
export default async function processResponse(
  response: any, 
  expectedResponse: any = '', 
  aiAssist: AiAssistOptions = { enabled: false }
): Promise<StandardResponse> {
  try {
    // Check if either the response or expectedResponse is empty
    if (Object.keys(expectedResponse).length === 0 || Object.keys(response).length === 0) {
      console.log('Received empty response or expectedResponse')
      return { data: response }
    }

    // Attempt to match the response to the expected schema
    const processedResponse = matchJSONtoSchema(response, expectedResponse)

    // If no error in processedResponse, return it
    if (!(typeof processedResponse === 'string' && processedResponse.includes('Error'))) {
      return { data: processedResponse }
    }

    // Fetch a valid OpenAI key if AI assistance is enabled
    const validOpenAiKey = await fetchValidOpenAiKey(aiAssist)
    if (!validOpenAiKey) {
      return { error: { message: 'No valid OpenAI key found', status: 400 } }
    }

    // Get the user ID from aiAssist options, if available
    const userId = aiAssist.userId || undefined

    // Call the AI assistant for help
    const { data: aiAssistData, error: aiAssistError } = await openAiAssist(response, expectedResponse, userId, validOpenAiKey)

    // If there's an error in AI assistance, return it
    if (aiAssistError) {
      return { error: aiAssistError }
    }

    // Return the data processed by the AI assistant
    return { data: aiAssistData }

  } catch (err: any) {
    // Catch any unexpected errors and return them
    return { error: { message: err, status: 500 } }
  }
}
