import { NextRequest, NextResponse } from 'next/server';
import { makeApiRequest, prepareRequest, validateToken, processResponse, logRequest } from './utils';
export const dynamic = 'force-dynamic'


export async function POST(req: NextRequest) {
  try {
    const requestBody = JSON.parse(await req.text());
    console.log(requestBody);
    const token = requestBody.lumberjane_token;
    let ip = req.ip ?? req.headers.get('x-real-ip');
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (!ip && forwardedFor) {
      ip = forwardedFor.split(',').at(0) ?? 'Unknown';
    }
    const isLocalRequest = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:' || ip === '0:0:0:0:0:0:0:1' || ip === '::ffff:127.0.0.1';
    const isTest = req.headers.get('X-Lumberjane-Test') === 'true' && isLocalRequest;

    // Validate the token
    const { data: decodedToken, error: validateError } = await validateToken(token, isTest);
    if (validateError || !decodedToken) {
      return NextResponse.json({ error: [validateError ? validateError.message : 'error validating token'] }, { status: validateError ? validateError.status : 500 });
    }

    //Log the request
    const { data: logResponse, error: logError } = await logRequest(decodedToken, requestBody);
    if (logError || !logResponse) {
      console.error('Error logging request:', logError);
    }

    // Prepare the request
    const { data: preparedRequest, error: prepareError } = await prepareRequest(decodedToken, requestBody);
    if (prepareError || !preparedRequest) {
      return NextResponse.json({ error: [prepareError ? prepareError.message : 'error preparing request'] }, { status: prepareError ? prepareError.status : 500}); 
    }

    // Make the API request
    const { data: responseData, error: apiError } = await makeApiRequest(
      decodedToken.info.method || 'POST', 
      preparedRequest.endpoint, 
      preparedRequest.headers, 
      preparedRequest.body);
    if (apiError ) {
      return NextResponse.json({ error: [apiError.message] }, { status: apiError.status });
    }

    // TODO log the response if enabled

    // If there is an expected response, try to fit the response into the expected response schema
    if(decodedToken.info.formatResponse) {
      const { data: formattedResponse, error: processResponseError } = await processResponse(responseData, decodedToken.expectedResponse, decodedToken.info.ai_enabled);
      if (processResponseError) {
        return NextResponse.json({ error: [processResponseError.message] }, { status: processResponseError.status });
      }
      console.log('success, returning formatted response');
      console.log(formattedResponse);
      return NextResponse.json(formattedResponse, { status: 200 });
    // If there is no expected response, just return the response as is
    } else {     
      console.log('success, returning response');
      console.log(responseData);
      return NextResponse.json(responseData, { status: 200 });
    }

    // TODO log the ai assisted response, if enabled

  } catch (error) {
    console.error('ERROR IN REQUEST:', error);
    return NextResponse.json({ errors: ['Internal server error.'] }, { status: 500 });
  }
}
