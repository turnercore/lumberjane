// /api/v1/profiles/update.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import type { UserProfile } from '@/types'
import { cookies } from 'next/headers'
export const dynamic = 'force-dynamic'



export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const requestBody = JSON.parse(await req.text())
    if (!requestBody) {
      return NextResponse.json({ error: 'No request body provided' }, { status: 400 })
    }
    const password = requestBody.password // Assuming the user ID is included in the request
    delete requestBody.password
    const updatedProfile: UserProfile = requestBody
    const userId = updatedProfile.id // Assuming the user ID is included in the request

    let passError
    if(password) {
      const { data:passData, error: passError} = await supabase.auth.updateUser({ password })
      console.log('password updated!', passData, passError)
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId.toString(),
        ...updatedProfile,
      })

    if (error || passError ) {
      if (error) console.error('Error updating profile:', error)
      if (passError) console.error('Error updating password:', passError)
      return NextResponse.json({ error: 'error updating the profile data with supabase' }, { status: 500 })
    } else {
      return NextResponse.json({ success: true, data })
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
