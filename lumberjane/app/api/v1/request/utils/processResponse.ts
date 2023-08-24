import { StandardResponse } from "@/types";
import type { UUID } from "crypto";
import { fetchAndDecryptKey, openAiAssist } from "./";
import { matchJSONtoSchema } from "@/utils/utils";

type AiAssistOptions = {
  enabled: boolean,
  openAiKeyId?: UUID,
  userId?: UUID,
  passphrase?: string // Used for double encryption
}

export default async function processResponse(response: any, expectedResponse: any = '', aiAssist: AiAssistOptions = { enabled: false }): Promise<StandardResponse> {
  try {
    // If there is no expected Response to try to conform to, just return the response
    if (Object.keys(expectedResponse).length === 0 || Object.keys(response).length === 0) {
      console.log('got empty repsonse or expectedResponse')
      return { data: response };
    }

    const processedResponse = matchJSONtoSchema(response, expectedResponse);
    //If there are no errors ( this could be cleaned up ) then return the response
    if (!(typeof processedResponse === 'string' && processedResponse.includes('Error'))) {
      return { data: processedResponse }
    }

    // At this point we've failed to process. If aiAssist.enabled, then get the key from the database
    if (aiAssist.enabled && aiAssist.openAiKeyId) {
      const { data: keyData, error: keyError } = await fetchAndDecryptKey(aiAssist.openAiKeyId, aiAssist.userId || undefined, aiAssist.passphrase || undefined);
      if (keyError) {
        return { error: keyError };
      }
      const key = keyData?.key || '';

      const { data: aiAssistData, error: aiAssistError } = await openAiAssist(key, response, expectedResponse);

      if (aiAssistError) {
        return { error: aiAssistError };
      }

      return { data: aiAssistData };
    }
    // Otherwise return the error
    return { error: { message: processedResponse, status: 400 } };

  } catch (err: any) {
    return { error: { message: err, status: 500 } };
  }
}
