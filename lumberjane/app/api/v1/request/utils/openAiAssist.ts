import { StandardResponse } from "@/types"
import OpenAI from "openai"
import { ChatCompletion } from "openai/resources/chat/index.mjs"

export default async function openAiAssist(apiKey: string, request: string, expectedResponse: string): Promise<StandardResponse> {
  const content = `
  Response:
  ${request}
  
  Expected Response Schema:
  ${expectedResponse}
  `

  const openai = new OpenAI({
    apiKey
  })

  const response:ChatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system",
        "content": "You are a JSON parser assistant. You are to take an incoming JSON string that does not match an expected schema. Look at the expected schema and fit the JSON response into the expected response. Your response should consist only of a JSON object. If you cannot fit the response into the expected schema, return a JSON object with {\"error\" : \"error message\"}.\n\nExample:\nResponse:\n{\"data\": { \"user\": {\"name\": \"mary\" }}\n\nExpected Response Schema:\n{\"name\" : string }\n\nAI Reply:\n{\"name\": \"mary\"}"
      },
      {
        "role": "user",
        "content": content
      }
    ],
    temperature: 0.15,
    max_tokens: 600,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  // Get JSON from AI response
  const aiResponse = response.choices[0]?.message?.content // get the content of the message from the first choice
  if (!aiResponse) {
    return { error: { message: 'No response from AI.', status: 500 } }
  }
  // Delete everything before the first { and after the last }
  const json = aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1)

  // Parse the JSON to check for errors
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
