import OpenAI from "openai"
import { Moderation } from "openai/resources/index.mjs"

// Moderates input with OpenAI
export default async function moderateInputWithOpenAI(key: string, input: string): Promise<Moderation | null> {
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
