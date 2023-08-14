import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { JwtToken, JwtTokenRequest } from '@/types';

const jwtSecret = process.env.LUMBERJANE_MASTER_KEY || 'super-secret-jwt-key-seriously-you-should-change-this';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const requestBody: JwtTokenRequest = JSON.parse(await req.text());
  
    //Get the supabase user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
    if (sessionError || !sessionData || !sessionData.session) {
      return NextResponse.json({ success: false, error: sessionError ? sessionError.message : 'No user session detected.' }, { status: 401 });
    }
  
    const user = sessionData.session.user;
  
    const tokenData: JwtToken = {
      info: {
        user: user.id,
        name: requestBody.name,
        description: requestBody.description,
        method: requestBody.method,
        headers: requestBody.headers || undefined,
        auth: requestBody.auth || undefined,
        endpoint: requestBody.endpoint,
        ai_enabled: requestBody.aiEnabled || false,
        ai_key: requestBody.openAIKey || undefined,
      },
      restrictions: requestBody.restrictions || [],
      request: requestBody.request,
      expectedResponse: requestBody.expectedResponse || undefined,
      log: {
        enabled: requestBody.logEnabled || false,
        log_level: requestBody.logLevel || 'info',
        log_response: requestBody.logResponse || false,
      }
    };

    // Create the JWT token
    const token = jwt.sign(tokenData, jwtSecret);
  
    // Insert the token into the database
    const { data, error } = await supabase
      .from('tokens')
      .insert([{
        name: tokenData.info.name,
        description: tokenData.info.description,
        user_id: user.id,
        token
      }]);
  
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  
    // Return success state to the requester
    return NextResponse.json({ success: true, token }, { status: 201 });
  } catch(err) {
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
