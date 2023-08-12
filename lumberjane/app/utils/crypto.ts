import crypto from 'crypto';

// Read the secret key from the environment variables
const SECRET_KEY = Buffer.from(process.env.LUMBERJANE_MASTER_KEY || '', 'hex');

export async function encrypt(text: string): Promise<{ encrypted?: string; error?: Error; }> {
  try {
    // Generate a random initialization vector (IV)
    const iv = crypto.randomBytes(16);

    // Create a cipher using the secret key and the IV
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return the IV followed by the encrypted data, both in hex format
    return { encrypted: iv.toString('hex') + encrypted };
  } catch (err: any) {
    return { error: err };
  }
}


export async function decrypt(encryptedText: string): Promise<{ decrypted?: string; error?: Error; }> {
  try {
    // Extract the IV from the beginning of the encrypted data
    const iv = Buffer.from(encryptedText.slice(0, 32), 'hex');
    // Extract the actual encrypted data after the IV
    const encryptedData = encryptedText.slice(32);

    // Create a decipher using the secret key and the IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return { decrypted };
  }
  catch (err: any) {
    return { error: err };
  }
}
