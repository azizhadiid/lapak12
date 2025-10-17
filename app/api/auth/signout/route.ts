import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });

    // Hapus sesi pengguna (logout)
    await supabase.auth.signOut();

    // Arahkan pengguna kembali ke halaman utama
    return NextResponse.redirect(new URL('/login', req.url), {
        status: 302,
    });
}
