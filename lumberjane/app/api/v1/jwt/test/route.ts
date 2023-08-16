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
      return NextResponse.json({ success: false, error: sessionError ? sessionError.message : 'No user session detected.' }, { status: 401 });
    }
  
    const user = sessionData.session.user;

    const { tokenData, token } = await createJwtToken(user, requestBody);

    // Send the request to the /api/v1/request endpoint
    const response = await fetch(`/api/v1/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lumberjane-Test': 'true'
     },
      body: JSON.stringify(tokenData.request),
    });

    // Get the response body
    const responseBody = await response.json();

    // Return the response body to the requester
    return NextResponse.json(responseBody, { status: response.status });
  } catch(err) {
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}