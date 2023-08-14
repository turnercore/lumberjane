import { Configuration, OpenAIApi } from "openai";

export default async function openAiAssist(apiKey: string, request: string, expectedResponse: string){
  const content = `
  Response:
  ${request}
  
  Expected Response Schema:
  ${expectedResponse}
  `

  const configuration = new Configuration({
    apiKey
  });
  const openai = new OpenAIApi(configuration);
  
  const response = await openai.createChatCompletion({
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
  });

  //get json from ai response
  const aiResponse = response.data.choices[1].message?.content;
  if (!aiResponse) {
    return '';
  }
  //Delete everything before the first { and after the last }
  const json = aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1);

  //Parse the json to check for errors
  try {
    const parsedResponse = JSON.parse(json);
    if (parsedResponse.error) {
      return 'Error: ' + parsedResponse.error;
    } else {
      return parsedResponse;
    }
  } catch (e) {
    return {error: 'Invalid JSON returned.'};
  }
}
