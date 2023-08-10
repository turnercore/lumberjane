// /api/v1/keys/update/route.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Key } from '@/types';

export async function PUT(req: NextRequest) {
    try {
        const supabase = createServerComponentClient({cookies});
        const requestBody = JSON.parse(await req.text());
        const keysToUpdate: Partial<Key>[] = Array.isArray(requestBody) ? requestBody : [requestBody];

        const responses = await Promise.all(keysToUpdate.map(async (key) => {
            if (!key.id) {
                return { error: 'ID is required for updating.' };
            }

            const { data, error } = await supabase
                .from('keys')
                .update(key)
                .eq('id', key.id);
            return { data, error };
        }));

        const errors = responses.filter(r => r.error);
        if (errors.length) {
            return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
        } else {
            return NextResponse.json({ success: true });
        }
    } catch(error) {
        console.error('Error updating keys:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
