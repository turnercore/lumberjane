import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { KeyId } from '@/types';

export const dynamic = 'force-dynamic'


export async function DELETE(req: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({cookies});
        const requestBody = JSON.parse(await req.text());
        let idsToDelete:KeyId[] = [];

        // Check for various possible fields in the request body
        if (requestBody.keyId) {
            idsToDelete.push(requestBody.keyId);
        } else if (requestBody.id) {
            idsToDelete.push(requestBody.id);
        } else if (requestBody.keyIds) {
            idsToDelete = idsToDelete.concat(requestBody.keyIds);
        } else if (requestBody.ids) {
            idsToDelete = idsToDelete.concat(requestBody.ids);
        } else if (requestBody.keys) {
            idsToDelete = idsToDelete.concat(requestBody.keys);
        }

        // Remove duplicates
        idsToDelete = Array.from(new Set(idsToDelete));

        if (!idsToDelete.length) {
            return NextResponse.json({ error: 'No valid IDs provided.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('keys')
            .delete()
            .in('id', idsToDelete);

        if (error) {
            return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
        } else {
            return NextResponse.json({ success: true });
        }
    } catch(error) {
        console.error('Error deleting keys:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
