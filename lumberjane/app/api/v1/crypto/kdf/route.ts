import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto';

// This is your server's secret key. It should be kept private and not exposed.
const LUMBERJANE_MASTER_KEY = process.env.LUMBERJANE_MASTER_KEY || 'defaultSecret'; // You should set this in your environment variables.
const iterations = process.env.ITERATIONS ? parseInt(process.env.ITERATIONS) : 100000; // You can adjust this based on security requirements.

export async function POST(req: NextRequest) {
  try {
    if (!req.body) { 
        return NextResponse.json({ error: 'No body provided.' }, { status: 400 });
    }

    const requestBody = await req.text();
    const parsedBody = JSON.parse(requestBody);

    const { user_id, passphrase = '' } = parsedBody;

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Use a cryptographic key derivation function (KDF) to derive the encryption key.
    // Here, we're using PBKDF2, but there are other KDFs like Argon2, scrypt, etc.
    const derivedKey = crypto.pbkdf2Sync(
      `${user_id}${passphrase}`, // Combine user ID and passphrase
      LUMBERJANE_MASTER_KEY, // Use the server's secret key as the salt
      iterations, // Number of iterations (this can be adjusted based on security requirements)
      32, // Length of the derived key
      'sha256' // Digest algorithm
    ).toString('hex'); // Convert to hex format for easier handling

    // Return the derived key to the client.
    return NextResponse.json({ derivedKey });

  } catch (error) {
    console.error('Error generating derived key:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
