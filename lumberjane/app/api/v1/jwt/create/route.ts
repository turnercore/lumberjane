import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { JwtTokenRequest } from '@/types';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const requestBody = JSON.parse(await req.text());


  console.log('requestBody', requestBody);

  return NextResponse.json({ success: true });
}
