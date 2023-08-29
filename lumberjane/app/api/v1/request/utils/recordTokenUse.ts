// Importing the Supabase client and UUID type
import { createClient } from '@supabase/supabase-js'
import type { UUID } from '@/types'

// Reading environment variables for Supabase URL and Service Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

// Function to record the usage of OpenAI tokens
export default async function recordTokenUse(user_id: UUID, tokens: number): Promise<void> {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch the current number of tokens used by the user
    const { data, error } = await supabase.from('profiles').select('openai_tokens_used').eq('id', user_id).single()

    // Error handling for fetching tokens
    if (error || data === null) {
      console.error('Error fetching current tokens used:', error)
      return
    }

    // Calculate the new total of tokens used
    const currentTokensUsed: number = data.openai_tokens_used || 0
    const newTokensUsed = currentTokensUsed + tokens

    // Update the new total of tokens used in the database
    const { error: updateError } = await supabase.from('profiles').update({ 'openai_tokens_used': newTokensUsed }).eq('id', user_id)

    // Error handling for updating tokens
    if (updateError) {
      console.error('Error updating tokens used:', updateError)
    }

    // Log the updated token count (useful for debugging)
    console.log('Updated tokens used by user:', user_id, 'to:', newTokensUsed)
  } catch (err: any) {
    // Catch any unexpected errors and log them
    console.error('Unexpected error:', err)
  }
}
