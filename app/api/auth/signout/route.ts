import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
        // Hapus sesi pengguna (logout)
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Supabase signOut Error:", error);
            // Jika ada error dari Supabase, kita tetap coba redirect
        }

    } catch (e) {
        // Ini menangkap error jika Supabase client gagal inisialisasi (misal, karena Env Vars)
        console.error("Critical Logout Error:", e);
        // Penting: Meskipun terjadi error, kita harus tetap mencoba redirect
    }

    // Arahkan pengguna kembali ke halaman login.
    return NextResponse.redirect(new URL('/login', req.url), {
        status: 302,
    });
}