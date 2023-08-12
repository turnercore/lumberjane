// /api/v1/keys/add/route.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Key } from '@/types';
import { encrypt } from '@/utils/crypto';

export async function POST(req: NextRequest) {
    try {
        console.log('adding a key to supabase');
        const supabase = createServerComponentClient({cookies});
        const requestBody = JSON.parse(await req.text());
        const keysToAdd: Key[] = Array.isArray(requestBody) ? requestBody : [requestBody];

        // Encrypt the keys
        for (const key of keysToAdd) {
            const { encrypted } = await encrypt(key.decryptedValue as string);
            key.value = encrypted as string;
            //remove decryptedValue from the key object
            delete key.decryptedValue;
        }

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
