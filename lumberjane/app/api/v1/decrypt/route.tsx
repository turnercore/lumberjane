import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextApiRequest ) {
    const { text } = req.body;
    
    const algorithm = 'aes-256-cbc';
    const masterKey = process.env.LUMBERJANE_MASTER_KEY || 'lumberjanesupersecret';
    
    if (!text) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, masterKey!, iv);
    const decryptedBuffers = [decipher.update(encrypted), decipher.final()];
    const decrypted = Buffer.concat(decryptedBuffers).toString('utf8');
    
    return NextResponse.json({ decrypted });
}