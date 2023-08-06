import { NextResponse } from 'next/server';
import type { NextApiRequest } from 'next';
import crypto from 'crypto';

export async function POST(req: NextApiRequest) {
    if (!req.body || !req.body.text) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const { text } = req.body;

    const algorithm = 'aes-256-cbc';
    const masterKey = process.env.LUMBERJANE_MASTER_KEY || 'lumberjanesupersecret';
    const iv = crypto.randomBytes(16);

    if (!text) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cipher = crypto.createCipheriv(algorithm, masterKey!, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return NextResponse.json({ encrypted: `${iv.toString('hex')}:${encrypted}` });
}