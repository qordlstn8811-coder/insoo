
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Intercept Naver Search Advisor verification file requests
    // Pattern: /naver[a-z0-9]+.html
    // Example: /naver5cd9c7298629082.html
    if (pathname.includes('/naver') && pathname.endsWith('.html')) {
        // Extract the filename without extension
        const fileName = pathname.split('/').pop();

        if (fileName && fileName.startsWith('naver')) {
            const verificationCode = fileName.replace('.html', '');
            return new NextResponse(verificationCode, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
