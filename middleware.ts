import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Buat Supabase client yang bisa bekerja di Middleware
    const supabase = createMiddlewareClient({ req, res });

    // Refresh sesi jika sudah kedaluwarsa. Ini penting untuk menjaga user tetap login.
    await supabase.auth.getSession();

    return res;
}

// Konfigurasi ini memastikan middleware hanya berjalan pada path yang diperlukan.
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
