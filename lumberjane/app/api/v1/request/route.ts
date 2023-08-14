import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import type { BaseRestriction, ExpirationRestriction, JwtToken, UUID } from '@/types';
import { decrypt } from '@/utils/crypto';
import openAiAssist from './utils/openAiAssist';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const jwtSecret = process.env.LUMBERJANE_MASTER_KEY || '';

export async function POST(req: NextRequest) {
  //Setup errors string array
  const errors: string[] = [];

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // This route accepts a previously created JWT token.
    const requestBody = JSON.parse(await req.text());
    const token = requestBody.lumberjane_token;
    if (!token) {
      errors.push('Lumberjane token is required.');
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check to make sure the token is valid and not expired.
    let decodedToken: JwtToken;
    try {
      decodedToken = jwt.verify(token, jwtSecret) as JwtToken;
    } catch (err) {
      errors.push('Invalid token.');
      return NextResponse.json({ errors }, { status: 401 });
    }

    // Check for expiration in the database (optional, only if you want to log or handle database errors)
    const { data: tokenRecord, error: dbError } = await supabase
      .from('tokens')
      .select('expiration')
      .eq('id', decodedToken.info.id);

    if (dbError) {
      console.error('Database error when checking token expiration:', dbError);
    }

    if (tokenRecord && tokenRecord[0]?.expiration && new Date(tokenRecord[0].expiration) < new Date()) {
      errors.push('Token has expired.');
      return NextResponse.json({ errors }, { status: 401 });
    }

    // Check for expiration in the token restrictions
    const expirationRestriction = decodedToken.restrictions?.find((r: any) => r.type === 'expirationDate') as ExpirationRestriction | undefined;
    if (expirationRestriction && new Date(expirationRestriction.rule.date) < new Date()) {
      errors.push('Token has expired.');
      return NextResponse.json({ errors }, { status: 401 });
    }

    // Make sure none of the token's restrictions are valid.
    // TODO: Implement logic to check token restrictions.

    // Check to make sure the token has not been revoked by checking the database.
    const { data, error } = await supabase
      .from('tokens')
      .select('status')
      .eq('id', decodedToken.info.id)
      .single();
    if (error || data.status !== 'active') {
      errors.push('Token has been revoked or frozen.');
      return NextResponse.json({ errors }, { status: 403 });
    }

    // Replace any variables in the request with the values provided in the request.
    const replacedRequest = JSON.stringify(requestBody).replace(/\$\$(.*?)\$\$/g, (match, variable) => {
      return requestBody[variable] || '';
    });

    // If the values are missing but the jwt has variables in it then return an error.
    let requestTokenString = '';
    const variablesInJwt = JSON.stringify(decodedToken).match(/\$\$(.*?)\$\$/g);
    if (variablesInJwt) {
      let isMissingVariables = false;
      for (const variable of variablesInJwt) {
        const variableName = variable.replace(/\$\$/g, '');
        if (!requestBody[variableName]) {
          isMissingVariables = true;
          errors.push(`Missing value for variable: ${variableName}`);
        }
      }
      if (isMissingVariables) {
        return NextResponse.json({ errors }, { status: 400 });
      }
      // Create a copy of the decoded token to modify
      requestTokenString = JSON.stringify(decodedToken);
  
      // Replace variables in the token with values from the request body
      for (const variable of variablesInJwt) {
        const variableName = variable.replace(/\$\$/g, '');
        const value = JSON.stringify(requestBody[variableName]);
        const regex = new RegExp(`\\$\\$${variableName}\\$\\$`, 'g');
        requestTokenString = requestTokenString.replace(regex, value);
      }
    }

    // Parse the modified string back into an object
    const requestToken = variablesInJwt ? JSON.parse(requestTokenString) : decodedToken;
    // Now requestToken has the variables replaced and can be used in the rest of the code


    // Add any headers to the request if there are any additional headers provided in the jwt (replace variables same as before).
    const headersArray = decodedToken.info.headers || [];
    let headers: { [key: string]: string } = {};
    
    for (const headerObj of headersArray) {
      for (const [key, value] of Object.entries(headerObj)) {
        headers[key] = value.replace(/\$\$(.*?)\$\$/g, (match, variable) => {
          return requestBody[variable] || '';
        });
      }
    }    

    // Using the user id and the key id, look up and decrypt the user's API key. If the key is not found, return an error.
    const userId: UUID = decodedToken.info.user;
    const keyId: UUID = decodedToken.info.key; // Assuming the key ID is stored in the token
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('keys')
      .select('value, isSecret')
      .eq('userId', userId)
      .eq('id', keyId);

    if (apiKeyError || !apiKeyData || apiKeyData.length === 0) {
      errors.push('Failed to retrieve API key.');
      return NextResponse.json({ errors }, { status: 404 });
    }

    const encryptedKey = apiKeyData[0].value;
    const isSecret = apiKeyData[0].isSecret;

    //If the key is secret then the key is double encrypted and needs a decryption key to decrypt it.
    if (isSecret) {
      if (!requestBody.passphrase) {
        errors.push('Passphrase is required to decrypt API key as it is double encrypted.')
        return NextResponse.json({ errors }, { status: 401 });
      }
    }

    const decryptedKey = isSecret ? await decrypt(encryptedKey, requestBody.passphrase) : await decrypt(encryptedKey); // Assuming a decrypt function is available

    if (!decryptedKey) {
      errors.push('Failed to decrypt API key.');
      return NextResponse.json({ errors }, { status: 500 });
    }

    // Authenticate the request using Bearer token by default, but allow for other types of authentication in the future.

    // Use the token to make an API request to the endpoint.
    // Get the endpoint URL and request method from the token
    const endpointUrl = decodedToken.info.endpoint;
    const requestMethod = decodedToken.info.method || 'POST'; // Default to GET if method is not provided

    // Prepare the request options, including headers and method
    const requestOptions: RequestInit = {
      method: requestMethod,
      headers: headers,
    };

    // Include the request body if needed (e.g., for POST, PUT, PATCH requests)
    if (['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
      requestOptions.body = replacedRequest;
    }

     // Check if logging is enabled in the token
    if (decodedToken.log?.enabled) {
      // Prepare the log entry
      const logEntry = {
        request: replacedRequest, // The request data
        token: decodedToken.info.id, // The token ID
        // response will be added later when the response is received
      };

      // Insert the log entry into the Supabase 'logs' table
      const { error: logError } = await supabase
        .from('logs')
        .insert(logEntry);

      if (logError) {
        // Handle any errors when inserting the log entry
        console.error('Failed to log request:', logError);
        // You may choose to continue processing the request even if logging fails, or return an error response
        errors.push('Failed to log request.');
      }
    }

   // Make the API request to the endpoint
    try {
      const response = await fetch(decodedToken.info.endpoint, {
        method: decodedToken.info.method,
        headers: {
          'Authorization': `Bearer ${decryptedKey}`,
          ...headers,
        },
        body: replacedRequest,
      });

      if (!response.ok) {
        // Handle the error response here
        console.error('API request error:', response.statusText);
        errors.push('Failed to make API request.');
        return NextResponse.json({ errors }, { status: response.status });
      }

      const responseData = await response.json();

      // If logs are enabled for response, log the response
      if (decodedToken.log?.log_response) {
        await supabase
          .from('logs')
          .update({ response: responseData })
          .eq('token', decodedToken.info.id);
      }

      // Check to see if there is an expected response
      const expectedResponse = decodedToken.expectedResponse;
      if (!expectedResponse) {
        // If there is no expected response, return success and the response
        return NextResponse.json({ success: true, data: responseData, errors }, { status: 200 });
      } else {
        // TODO: Implement logic to match the expected response
        // ...

        // If the response matches the expected response
        let responseMatches = true;
        //TODO Add logic to check for expected response
        if (responseMatches) {
          return NextResponse.json({ success: true, data: responseData }, { status: 200 });
        } else {
          // If the response does not match the expected response
          // Check if the token is ai enabled
          if (decodedToken.info.ai_enabled) {
            // Get OpenAI Api key from the token
            const openAIKeyId = decodedToken.info.ai_key;
            const { data: openAIKeyData, error: openAIKeyError } = await supabase
              .from('keys')
              .select('value')
              .eq('id', openAIKeyId)
              .eq('userId', decodedToken.info.user);

            //Make sure there is an OpenAI Key
            if (openAIKeyError || !openAIKeyData || openAIKeyData.length === 0) {
              errors.push('OpenAI key not found.');
              return NextResponse.json({ errors }, { status: 404 });
            }

            // Make request to openAI
            const openAIResponse = await openAiAssist(openAIKeyData[0].value, replacedRequest, expectedResponse);

            // If there is an error with the openAI response, return an error
            if (openAIResponse.error) {
              errors.push(openAIResponse.error);
              return NextResponse.json({ errors }, { status: 400 });
            }

            // Otherwise return the response from openAI
            return NextResponse.json({ success: true, data: openAIResponse }, { status: 200 });
          }
          errors.push('Response does not match expected response.');
          return NextResponse.json({ errors }, { status: 400 });
        }
      } 
    } catch (error) {
      // Handle any other errors here (e.g., network errors)
      console.error('API request error:', error);
      errors.push('Failed to make API request.');
      return NextResponse.json({ errors }, { status: 500 });
    }
  } catch(error) {
    console.error('ERROR ERRROR IN REQUEST:', error);
    errors.push('Internal server error.')
    return NextResponse.json({ errors }, { status: 500 });
  }
}


/*
General Suggestions:

Consider adding comments to describe the overall flow and purpose of the code, especially for complex sections.
Make sure that all the necessary dependencies and utility functions (e.g., decrypt, openAiAssist) are properly imported and defined.
Ensure that the database schema and token structure align with the code (e.g., fields like decodedToken.log.log_response, decodedToken.expectedResponse, decodedToken.info.ai_enabled, etc.).
Consider breaking down the code into smaller functions or modules to enhance readability and maintainability. This can make it easier to test individual parts of the logic.
Potential Issue:

In the section where you replace variables in the JWT, you create a new requestToken object but don't seem to use it later in the code. Make sure that this object is used as intended, or remove the related code if it's not needed.
Overall, the code is comprehensive and well-thought-out. It's clear that you've considered a wide range of scenarios and implemented robust handling for them. Make sure to thoroughly test the code with different scenarios to ensure that all the paths and edge cases are handled correctly.
*/