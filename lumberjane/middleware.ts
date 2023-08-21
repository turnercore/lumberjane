import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// define routes that require authentication
const protectedClientRoutes = ['/dashboard', '/account', '/keys', '/tokens'];
const protectedApiRoutes = ['/api/v1/auth',  '/api/v1/keys', '/api/v1/profiles', '/api/v1/tokens'];

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
        '/api/v1/tokens/:path*'
    ],
};


function isProtectedClientRoute(pathname: string): boolean {
    return protectedClientRoutes.includes(pathname);
}

function isProtectedApiRoute(pathname: string): boolean {
    return protectedApiRoutes.some(route => pathname.startsWith(route));
}

function handleUnauthenticatedClient(): NextResponse {
    return NextResponse.redirect('/login');
}

function handleUnauthenticatedApi(): NextResponse {
    return new NextResponse(
        JSON.stringify({ success: false, message: 'authentication failed' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
        );
    }
    
    export async function middleware(req: NextRequest) {
        //setup middleware
        const res = NextResponse.next();
        const supabase = createMiddlewareClient({ req, res });
        const session = await supabase.auth.getSession();
        const { pathname } = req.nextUrl;
        
        if (!session) {
            if (isProtectedClientRoute(pathname)) {
                return handleUnauthenticatedClient();
            }
            
            if (isProtectedApiRoute(pathname)) {
                return handleUnauthenticatedApi();
            }
        }
        
        return res;
    }
    