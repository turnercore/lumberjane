import type { Token, ServerError, StandardResponse } from "@/types";
import { fetchAndDecryptKey } from ".";


type PreparedRequest = {
  headers: { [key: string]: string };
  body: Object;
  method: string;
  endpoint: string;
};

export default async function prepareRequest(decodedToken: Token, requestBody: any): Promise<StandardResponse> {
  const error: ServerError = { message: '', status: 500 };
  console.log(requestBody); 
  // Replace any variables in the request with the values provided in the request
  // Add error handling, if there is a variable but it's not included in the request, throw an error
  const replacedRequest = JSON.stringify(requestBody).replace(/\$\$(.*?)\$\$/g, (match, variable) => {
    console.log('replacing variable:', variable);
    console.log('with value:', requestBody[variable]);
    return requestBody[variable] || '';
  });

  // Replace any variables in the endpoint with the values provided in the request
  // Add error handling, if there is a variable but it's not included in the request, throw an error
  const endpoint = decodedToken.info.endpoint.replace(/\$\$(.*?)\$\$/g, (match, variable) => {
    console.log('replacing variable:', variable);
    console.log('with value:', requestBody[variable]);
    console.log('new endpoint is :' + requestBody[variable]);
    return requestBody[variable] || '';
  });

  // Add any headers to the request if there are any additional headers provided in the jwt (replace variables same as before)
  const headersArray = decodedToken.info.headers || [];
  let headers: { [key: string]: string } = {};

  for (const headerObj of headersArray) {
    for (const [key, value] of Object.entries(headerObj)) {
      headers[key] = value.replace(/\$\$(.*?)\$\$/g, (match, variable) => {
        return requestBody[variable] || '';
      });
    }
  }

  // Prepare the request options, including headers and method
  const requestMethod = decodedToken.info.method || 'POST'; // Default to POST if method is not provided

  // If the auth type is bearer token we need to add the token to headers
  if (decodedToken.info.authType === 'bearer') {
    // Get and decode the key
    const userId = decodedToken.info.user;
    const keyId = decodedToken.info.key;
    const passphrase = requestBody.passphrase || '';

    const { data: token, error: keyError } = await fetchAndDecryptKey(userId, keyId, passphrase);

    if (keyError) {
      return { error };
    }

    headers['Authorization'] = `Bearer ${token}`;
  }

  // If the request is a GET request, we need to add the query params to the url TODO
  // if (requestMethod === 'GET') {
  //   const queryParams = Object.entries(requestBody)
  //     .map(([key, value]) => `${key}=${value}`)
  //     .join('&');
  //   const url = `${decodedToken.info.endpoint}?${queryParams}`;
  //   return { preparedRequest: { headers: headers, body: {}, method: requestMethod }, error: undefined };
  // }

  const preparedRequest: PreparedRequest = {
    headers: headers,
    body: JSON.parse(replacedRequest),
    method: requestMethod,
    endpoint,
  };

  return { data: preparedRequest, error: undefined };
}
