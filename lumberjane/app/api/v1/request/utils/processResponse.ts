import type { StandardResponse, UUID } from "@/types"
import { fetchAndDecryptKey, openAiAssist } from "./"
import { matchJSONtoSchema } from "@/utils/utils"
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { Moderation } from "openai/resources/moderations.mjs"

const isCommercial = process.env.NEXT_PUBLIC_ENABLE_COMMERCIAL === 'true' || false
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

type AiAssistOptions = {
  enabled: boolean,
  openAiKeyId?: UUID,
  userId?: UUID,
  passphrase?: string // Used for double encryption
}

// Moderates input with OpenAI
async function moderateInputWithOpenAI(key: string, input: string): Promise<Moderation | null> {
  if (!key || !input) {
    return null
  }

  try {
    // Construct the OpenAI client
    const openai = new OpenAI({
      apiKey: key,
      maxRetries: 1,
      timeout: 20 * 1000,
    })

    // Perform the moderation
    const { results } = await openai.moderations.create({ input })
    if(!results || results.length === 0) {
      return null
    }
    const moderation: Moderation = results[0]

    // Assuming moderation.results contains the moderation object you're interested in
    // Validate the result (you may need to adjust this based on the actual API response)
    if (moderation) {
      return moderation
    } else {
      return null
    }
  } catch (err: any) {
    console.error('Error moderating input with OpenAI:', err)
    return null
  }
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
    const serverOpenAiKey = process.env.OPEN_AI_KEY || ''
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
    return process.env.OPEN_AI_KEY || null
  }
  // If we're here then the user is not allowed to use the server key and does not have a valid key set
  return null
}

export default async function processResponse(response: any, expectedResponse: any = '', aiAssist: AiAssistOptions = { enabled: false }): Promise<StandardResponse> {
  try {
    if (Object.keys(expectedResponse).length === 0 || Object.keys(response).length === 0) {
      console.log('Got empty response or expectedResponse')
      return { data: response }
    }

    const processedResponse = matchJSONtoSchema(response, expectedResponse)
    if (!(typeof processedResponse === 'string' && processedResponse.includes('Error'))) {
      return { data: processedResponse }
    }

    const validOpenAiKey = await fetchValidOpenAiKey(aiAssist)
    if (!validOpenAiKey) {
      return { error: { message: 'No valid OpenAI key found', status: 400 } }
    }

    const { data: aiAssistData, error: aiAssistError } = await openAiAssist(validOpenAiKey, response, expectedResponse)
    if (aiAssistError) {
      return { error: aiAssistError }
    }

    return { data: aiAssistData }

  } catch (err: any) {
    return { error: { message: err, status: 500 } }
  }
}
