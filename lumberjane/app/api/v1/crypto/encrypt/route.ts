import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const getDerivedKey = async (userId: string, passphrase: string) => {
    try {
        const response = await fetch('/api/v1/crypto/kdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, passphrase }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch derived key from KDF route.');
        }

        const data = await response.json();
        return data.derivedKey;
    } catch (error) {
        console.error('Error fetching derived key:', error);
        throw error;
    }
}


export async function POST(req: NextRequest) {
  try {
    const { text, userId, passphrase } = JSON.parse(await req.text());
    const derivedKey = await getDerivedKey(userId, passphrase);

    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);

    // Create a cipher using the derived key and the IV
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(derivedKey, 'hex'), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return the IV followed by the encrypted data, both in hex format
    return NextResponse.json({ encryptedData: iv.toString('hex') + encrypted });

  } catch (error) {
    console.error('Error encrypting data:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}