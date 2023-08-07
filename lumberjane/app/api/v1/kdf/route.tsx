// /pages/api/v1/kdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// This is your server's secret key. It should be kept private and not exposed.
const LUMBERJANE_MASTER_KEY = process.env.LUMBERJANE_MASTER_KEY || 'defaultSecret'; // You should set this in your environment variables.
const iterations = process.env.ITERATIONS ? parseInt(process.env.ITERATIONS) : 100000; // You can adjust this based on security requirements.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    const { user_id, passphrase = '' } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required.' });
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
    return res.status(200).json({ derivedKey });

  } catch (error) {
    console.error('Error generating derived key:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
