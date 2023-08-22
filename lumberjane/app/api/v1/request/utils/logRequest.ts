import { Token, StandardResponse } from "@/types";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const tokenSecret = process.env.LUMBERJANE_MASTER_KEY || '';

export default async function logRequest(decodedToken: Token, requestBody: any): Promise<StandardResponse> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: tokenRecord, error: dbError } = await supabase
    .from('tokens')
    .select('*')
    .eq('id', decodedToken.info.id)
    .single();
  if (dbError) {
    const error = {
      message: 'Error querying token.',
      status: 500,
    };
    return { error };
  }

  // add 1 to the request count
  const { data: updatedTokenRecord, error: updateError } = await supabase
    .from('tokens')
    .update({ request_count: tokenRecord.request_count + 1 })
    .eq('id', decodedToken.info.id)
    .single();

  if (updateError) {
    const error = {
      message: 'Error updating token.',
      status: 500,
    };
    return { error };
  }

  // Add the request to the request log, if enabled, include the request body, ip address, headers, and timestamp, otherwise just include the timestamp
  // TODO: add ip address and headers, remember to omit the lumberjane_token from the request body, and the authorization header from the headers
  // Also omit any other sensitive information from the request body and headers like 'password' field or 'authorization' header

  

  return { data: updatedTokenRecord };
} 