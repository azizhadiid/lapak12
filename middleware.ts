import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fungsi helper untuk menentukan halaman "home" berdasarkan role
const getHomePath = (role: string) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'penjual') return '/penjual/dashboard'; // Menggunakan dashboard, bukan home
    return '/home'; // Default untuk 'pembeli'
};

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // 1. Refresh sesi dan ambil datanya (Wajib dipanggil agar cookies di-refresh)
    // Panggil getSession() tanpa destructuring data dulu
    const { data: { session } } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;
    const loginUrl = new URL('/login', req.url);
    const isAuthPage = pathname === '/login' || pathname === '/register';

    // --- 2. LOGIKA UNTUK GUEST (BELUM LOGIN) ---
    if (!session) {
        // Jika guest mencoba mengakses halaman yang diproteksi, redirect ke login
        if (pathname.startsWith('/admin') || pathname.startsWith('/penjual') || pathname.startsWith('/keranjang') || pathname.startsWith('/home') || pathname.startsWith('/product') || pathname.startsWith('/profile')) {
            return NextResponse.redirect(loginUrl, { headers: res.headers });
        }
        // Jika guest di halaman auth (login/register), biarkan
        if (isAuthPage) {
            return res;
        }
        // Jika di halaman produk/home (publik), biarkan
        return res;
    }

    // --- 3. LOGIKA UNTUK USER (SUDAH LOGIN) ---

    // 3a. Jika user sudah login mencoba akses halaman auth, redirect ke home mereka
    if (isAuthPage) {
        // Kita perlu mendapatkan role untuk menentukan home path
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

        const role = userData?.role || 'pembeli';
        return NextResponse.redirect(new URL(getHomePath(role), req.url), {
            headers: res.headers,
        });
    }


    // 3b. Ambil role untuk cek proteksi (Jika tidak di halaman auth)
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (userError || !userData) {
        console.error('Middleware Error: Gagal mengambil role. Mengarahkan ke logout.');
        // Jika gagal ambil role, paksa signout agar sesi bersih
        // await supabase.auth.signOut();
        return NextResponse.redirect(loginUrl, { headers: res.headers });
    }

    const role = userData.role;
    const homePath = getHomePath(role);


    // --- 4. ATURAN PROTEKSI BERDASARKAN ROLE ---

    // Semua harus startswith homePath mereka kecuali /home, /product, /keranjang (yang sifatnya publik)
    if (role === 'admin' && !pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL(homePath, req.url), {
            headers: res.headers,
        });
    }
    else if (role === 'penjual' && !pathname.startsWith('/penjual')) {
        // Penjual diizinkan melihat /product, /home, /keranjang
        if (pathname.startsWith('/home') || pathname.startsWith('/product') || pathname.startsWith('/keranjang')) {
            return res;
        }
        return NextResponse.redirect(new URL(homePath, req.url), {
            headers: res.headers,
        });
    }
    else if (role === 'pembeli' && (pathname.startsWith('/admin') || pathname.startsWith('/penjual'))) {
        // Pembeli dilarang akses admin atau penjual
        return NextResponse.redirect(new URL(homePath, req.url), {
            headers: res.headers,
        });
    }


    // Jika lolos dari semua aturan, izinkan akses dan pastikan cookies dikembalikan
    return res;
}

// Konfigurasi matcher tetap sama
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};