import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// define routes that require authentication
const protectedClientRoutes = ['/dashboard', '/account', '/keys', '/tokens', '/subscribed']
const protectedApiRoutes = ['/api/v1/auth',  '/api/v1/keys', '/api/v1/profiles', '/api/v1/tokens']

//This turns off these routes for self-hosting
const commercialRoutes = ['/pricing', '/subscribed', '/api/v1/stripe']
const isCommercial = process.env.NEXT_PUBLIC_ENABLE_COMMERCIAL === 'true'

// !!!!!!MAKE SURE TO UPDATE THE MATCHER AS WELL IF YOU CHANGE/ADD ROUTES!!!!!!!!
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/account/:path*',
        '/keys/:path*',
        '/tokens/:path*',
        '/api/v1/auth/:path*',
        '/api/v1/keys/:path*',
        '/api/v1/profiles/:path*',
        '/api/v1/tokens/:path*',
        '/pricing/:path*',
        '/subscribed/:path*',
        '/api/v1/stripe/:path*',
    ],
}

function isProtectedClientRoute(pathname: string): boolean {
    return protectedClientRoutes.includes(pathname)
}

function isProtectedApiRoute(pathname: string): boolean {
    return protectedApiRoutes.some(route => pathname.startsWith(route))
}

function isCommercialRoute(pathname: string): boolean {
    return commercialRoutes.includes(pathname)
}

function handleUnauthenticatedClient(): NextResponse {
    return NextResponse.redirect('/login')
}

function handleUnauthenticatedApi(): NextResponse {
    return new NextResponse(
        JSON.stringify({ success: false, message: 'authentication failed' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
        )
    }



//-------------- setup middleware ----------------- \\
export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const session = await supabase.auth.getSession()
    const { pathname } = req.nextUrl

    //Disallow access to commercial routes if commercial features are disabled
    if (isCommercialRoute(pathname) && !isCommercial) {
        //if it's in the /api/ path return 401
        if (pathname.startsWith('/api/')) {
            return new NextResponse(
                JSON.stringify({ success: false, message: 'commercial features are disabled' }),
                { status: 401, headers: { 'content-type': 'application/json' } }
            )
        } else {
            //if it's not in the /api path redirect to home '/'
            return NextResponse.redirect('/')
        }
    }
    
    if (!session) {
        if (isProtectedClientRoute(pathname)) {
            return handleUnauthenticatedClient()
        }
        
        if (isProtectedApiRoute(pathname)) {
            return handleUnauthenticatedApi()
        }
    }
    
    return res
}
    