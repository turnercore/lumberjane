import { StandardResponse, UUID } from "@/types";
import { decrypt } from "@/utils/crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';


export default async function fetchAndDecryptKey(keyId: UUID, userId: UUID | null = null, passphrase:string | null = null): Promise<StandardResponse> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let data: string = '';

  if (!userId || !keyId) {
    const error = {
      message: 'User ID and key ID are required to fetch key from supabase.',
      status: 400
    }
    return { error };
  }

  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from('keys')
    .select('value, isSecret')
    .eq('userId', userId)
    .eq('id', keyId);

  if (apiKeyError || !apiKeyData || apiKeyData.length === 0) {
    const error = {
      message: 'Failed to fetch API key from supabase.',
      status: 500,
    }
    return { error };
  }

  const encryptedKey = apiKeyData[0].value;
  const isSecret = apiKeyData[0].isSecret;

  //If the key is secret then the key is double encrypted and needs a decryption key to decrypt it.
  if (isSecret) {
    if (!passphrase) {
      const error = {
        message: 'Passphrase is required to decrypt API key as it is double encrypted.',
        status: 400,
      }
      return { error };
    }
  }

  // Decrypt key (optionally with passphrase)
  const {decrypted, error: decryptError} = isSecret ? await decrypt(encryptedKey, passphrase!) : await decrypt(encryptedKey);
  if (decryptError || !decrypted) {
    const error = {
      message: 'Failed to decrypt API key.',
      status: 500,
    }
    return { error };
  }

  data = decrypted;
  return { data };
}