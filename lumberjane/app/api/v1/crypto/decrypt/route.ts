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

export async function decrypt(req: NextRequest) {
    try {
      const { encryptedText, userId, passphrase } = JSON.parse(await req.text());
      const derivedKey = await getDerivedKey(userId, passphrase);
  
      // Extract the IV from the beginning of the encrypted data
      const iv = Buffer.from(encryptedText.slice(0, 32), 'hex');
  
      // Extract the actual encrypted data after the IV
      const encryptedData = encryptedText.slice(32);
  
      // Create a decipher using the derived key and the IV
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(derivedKey, 'hex'), iv);
  
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
  
      return NextResponse.json({ decryptedText: decrypted });
  
    } catch (error) {
      console.error('Error decrypting data:', error);
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  }