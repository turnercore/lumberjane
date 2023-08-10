// /api/v1/profiles/update.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const requestBody = JSON.parse(await req.text());
    const updatedProfile: UserProfile = requestBody;
    const userId = updatedProfile.id; // Assuming the user ID is included in the request

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId.toString(),
        ...updatedProfile,
      });

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    } else {
      return NextResponse.json({ success: true, data });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
