// /api/v1/keys/create/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Key } from '@/types';
import { encrypt } from '@/utils/crypto';

export async function POST(req: NextRequest) {
    try {
        console.log('!!!!!!adding a key to supabase!!!!!');
        const supabase = createRouteHandlerClient({cookies});
        const requestBody = JSON.parse(await req.text());
        if (!requestBody) {
            return NextResponse.json({ error: 'No request body provided' }, { status: 400 });
        }

        const doubleEncryptPassword = requestBody.isSecret ? requestBody.password : undefined;
        delete requestBody.password;
        const keysToAdd: Key[] = Array.isArray(requestBody) ? requestBody : [requestBody];

        // Encrypt the keys
        for (const key of keysToAdd) {
            const { encrypted } = await encrypt(key.decryptedValue as string, doubleEncryptPassword);
            key.value = encrypted as string;
            //remove decryptedValue from the key object
            delete key.decryptedValue;

            console.log('key to add:', key);
        }

        const { data, error } = await supabase
            .from('keys')
            .insert(keysToAdd);

        if (error) {
            console.error('Error adding keys:', error);
            return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
        } else {
            console.log('keys added:', data);
            return NextResponse.json({ success: true, data });
        }
    } catch(error) {
        console.log('Error adding keys:', error);
        console.error('Error adding keys:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
