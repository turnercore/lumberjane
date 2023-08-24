import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import createJwtToken from '../../../../utils/createToken'
import type { TokenFormFields } from '@/types'
import { cookies } from 'next/headers'
export const dynamic = 'force-dynamic'


export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const requestBody: TokenFormFields = JSON.parse(await req.text())

    //Get the supabase user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  
    if (sessionError || !sessionData || !sessionData.session) {
      return NextResponse.json({ success: false, error: sessionError ? sessionError.message : 'No user session detected.' }, { status: 401 })
    }
  
    const user = sessionData.session.user

    const {tokenData, token} = await createJwtToken(user, requestBody)
  
    // Insert the token into the database
    const { data, error } = await supabase
      .from('tokens')
      .insert([{
        id: tokenData.info.id,
        name: tokenData.info.name,
        description: tokenData.info.description,
        user_id: user.id,
        token,
        status: 'active',
        expiration: requestBody.restrictions?.find((r: any) => r.type === 'expirationDate')?.rule.date || undefined,
      }])
  
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  
    // Return success state to the requester
    return NextResponse.json({ success: true, token }, { status: 201 })
  } catch(err) {
    return NextResponse.json({ success: false, error: err }, { status: 500 })
  }
}
