import OpenAI from "openai"
import { ChatCompletion } from "openai/resources/chat/index.mjs"
import recordTokenUse from "./recordTokenUse"
import type { StandardResponse, UUID } from "@/types"

const serverKey = process.env.OPENAI_API_KEY || ''

export default async function openAiAssist(request: string, expectedResponse: string, userId: UUID | undefined, apiKey: string = ''): Promise<StandardResponse> {
  // Initialize flag for recording tokens
  let isRecordingTokens = false

  // Check if the API key being used is the server key
  if (apiKey === process.env.SERVER_KEY) {
    isRecordingTokens = true
  }

  const content = `
    Response:
    ${request}
    
    Expected Response Schema:
    ${expectedResponse}
    `

  const openai = new OpenAI({
    apiKey
  })

  let response: ChatCompletion
  try {
    response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a JSON parser assistant. ..."
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.15,
      max_tokens: 600,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
  } catch (e) {
    return { error: { message: 'OpenAI API call failed.', status: 500 } }
  }

  // Record token usage if we are recording tokens, we are using the server's key, and we have a userId to record for
  if (isRecordingTokens && apiKey === serverKey && userId) {
    recordTokenUse(userId, response.usage?.total_tokens || 0)
  }

  const aiResponse = response.choices[0]?.message?.content
  if (!aiResponse) {
    return { error: { message: 'No response from AI.', status: 500 } }
  }

  const json = aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1)

  try {
    const parsedResponse = JSON.parse(json)
    if (parsedResponse.error) {
      return { error: { message: 'Error: ' + parsedResponse.error, status: 500 } }
    }
    return { data: parsedResponse }
  } catch (e) {
    return { error: { message: 'Invalid JSON returned.', status: 400 } }
  }
}
