import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { TokenFormFields } from '@/types'
import createToken from '@/utils/createToken'

export const dynamic = 'force-dynamic'

interface TestFormFields extends TokenFormFields {
  additionalVariables: any
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    let requestBody: TestFormFields = JSON.parse(await req.text())
    console.log(requestBody)
    let additionalVariables = requestBody.additionalVariables || {}
    console.log(additionalVariables)
  
    if (requestBody.additionalVariables) {
      delete requestBody.additionalVariables
    }

    //Get the supabase user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  
    if (sessionError || !sessionData || !sessionData.session) {
      console.log('Error: No user session detected.')
      return NextResponse.json({ success: false, error: sessionError ? sessionError.message : 'No user session detected.' }, { status: 401 })
    }
  
    const user = sessionData.session.user

    const { tokenData, token } = await createToken(user, requestBody)

    const payload: Record<string, any> = { 
      "lumberjane_token": token,
    }
    for(const [key, value] of Object.entries(additionalVariables)) {
      payload[key] = value
    }
    console.log('payload:', payload)

    // Send the request to the /api/v1/request endpoint
    const response = await fetch(`/api/v1/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lumberjane-Test': 'true'
     },
      body: JSON.stringify(payload),
    })

    // Get the response body
    const responseBody = await response.json()

    // Log the response body
    console.log('Response body:', responseBody)

    // Return the response body to the requester
    return NextResponse.json(responseBody, { status: response.status })
  } catch(err) {
    console.log('Error:', err)
    return NextResponse.json({ success: false, error: err }, { status: 500 })
  }
}