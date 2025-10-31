import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fungsi helper untuk menentukan halaman "home" berdasarkan role
const getHomePath = (role: string) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'penjual') return '/penjual/home';
    return '/home'; // Default untuk 'pembeli'
};

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // 1. Refresh sesi dan ambil datanya
    const { data: { session } } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;
    const loginUrl = new URL('/login', req.url); // URL Halaman login

    // --- 2. LOGIKA UNTUK GUEST (BELUM LOGIN) ---
    if (!session) {
        // Jika guest mencoba mengakses halaman yang diproteksi, redirect ke login
        if (pathname.startsWith('/admin') || pathname.startsWith('/penjual') || pathname.startsWith('/pembeli')) {
            return NextResponse.redirect(loginUrl);
        }
        // Jika guest di halaman publik (spt /login), biarkan saja
        return res;
    }

    // --- 3. LOGIKA UNTUK USER (SUDAH LOGIN) ---

    // Ambil role pengguna dari tabel 'public.users'
    // Ini penting karena role ada di tabel custom Anda, bukan di data auth default
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

    // Jika gagal ambil role (misal: user baru daftar tapi data belum sinkron),
    // lebih aman logout dan paksa login ulang.
    if (userError || !userData) {
        console.error('Middleware Error: Gagal mengambil role pengguna.', userError?.message);
        await supabase.auth.signOut();
        return NextResponse.redirect(loginUrl);
    }

    const role = userData.role; // 'admin', 'penjual', atau 'pembeli'
    const homePath = getHomePath(role);

    // --- 4. ATURAN PROTEKSI BERDASARKAN ROLE ---

    // Aturan untuk ADMIN
    if (role === 'admin') {
        // Admin TIDAK BOLEH akses halaman penjual atau pembeli
        if (pathname.startsWith('/penjual') || pathname.startsWith('/home') || pathname.startsWith('/profile')) {
            return NextResponse.redirect(new URL(homePath, req.url));
        }
    }

    // Aturan untuk PENJUAL
    else if (role === 'penjual') {
        // Penjual TIDAK BOLEH akses halaman admin atau pembeli
        if (pathname.startsWith('/admin') || pathname.startsWith('/home') || pathname.startsWith('/profile')) {
            return NextResponse.redirect(new URL(homePath, req.url));
        }
    }

    // Aturan untuk PEMBELI
    else if (role === 'pembeli') {
        // Pembeli TIDAK BOLEH akses halaman admin atau penjual
        if (pathname.startsWith('/admin') || pathname.startsWith('/penjual')) {
            return NextResponse.redirect(new URL(homePath, req.url));
        }
    }

    // --- 5. Aturan Tambahan: Redirect user yang sudah login dari halaman auth ---
    // (Bagian ini sama seperti sebelumnya dan sudah benar)
    if (pathname === '/login' || pathname === '/register') {
        return NextResponse.redirect(new URL(homePath, req.url));
    }

    // Jika lolos dari semua aturan di atas, izinkan akses
    return res;
}

// Konfigurasi matcher Anda sudah benar, tidak perlu diubah.
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