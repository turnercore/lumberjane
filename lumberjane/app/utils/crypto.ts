// @/utils/crypto.ts
// import fetch from 'isomorphic-unfetch';
import crypto from 'crypto';

async function getDerivedKey(userId: string, passphrase: string = ''): Promise<string> {
  try {
    const response = await fetch('/api/v1/kdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, passphrase }),
    });

    const data = await response.json();
    return data.derivedKey;
  } catch (error) {
    console.error('Error fetching derived key:', error);
    throw new Error('Failed to fetch derived key.');
  }
}

export async function encrypt(text: string, userId: string, passphrase?: string): Promise<string> {
  const derivedKey = await getDerivedKey(userId, passphrase);
  const cipher = crypto.createCipher('aes-256-cbc', derivedKey);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export async function decrypt(encryptedText: string, userId: string, passphrase?: string): Promise<string> {
  const derivedKey = await getDerivedKey(userId, passphrase);
  const decipher = crypto.createDecipher('aes-256-cbc', derivedKey);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
