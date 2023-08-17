import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { TokenFormFields } from '@/types';
import createJwtToken from '../utils/createJwtToken'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const requestBody: TokenFormFields = JSON.parse(await req.text());

    //Get the supabase user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
    if (sessionError || !sessionData || !sessionData.session) {
      console.log('Error: No user session detected.');
      return NextResponse.json({ success: false, error: sessionError ? sessionError.message : 'No user session detected.' }, { status: 401 });
    }
  
    const user = sessionData.session.user;

    const { tokenData, token } = await createJwtToken(user, requestBody);

    // Send the request to the /api/v1/request endpoint
    const response = await fetch(`http://localhost:3000/api/v1/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lumberjane-Test': 'true'
     },
      body: JSON.stringify({"lumberjane_token": token}),
    });

    // Get the response body
    const responseBody = await response.json();

    // Log the response body
    console.log('Response body:', responseBody);

    // Return the response body to the requester
    return NextResponse.json(responseBody, { status: response.status });
  } catch(err) {
    console.log('Error:', err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}