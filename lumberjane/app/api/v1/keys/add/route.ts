// /api/v1/keys/add/route.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NewKeyData } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const supabase = createServerComponentClient({cookies});
        const requestBody = JSON.parse(await req.text());
        const keysToAdd: NewKeyData[] = Array.isArray(requestBody) ? requestBody : [requestBody];

        const { data, error } = await supabase
            .from('keys')
            .insert(keysToAdd);

        if (error) {
            return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
        } else {
            return NextResponse.json({ success: true, data });
        }
    } catch(error) {
        console.error('Error adding keys:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
