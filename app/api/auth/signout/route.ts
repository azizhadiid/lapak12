import { NextResponse } from "next/server";

export async function POST() {
    console.log("--- START LOGOUT DEBUGGING (FIXED) ---");

    const cookiesToDelete = [
        "sb-zmhvafeistkzljdxwxwk-auth-token",
        // Hapus cookie internal Next.js jika masih mengganggu
        "__next_hmr_refresh_hash__",
    ];

    // Daftar Path di mana cookie mungkin terikat
    const relevantPaths = [
        "/",          // Root path (Pembeli)
        "/penjual",   // Path Penjual
        "/admin",     // Path Admin
    ];

    const response = NextResponse.json({ message: "Logged out", status: "success" });

    // Lakukan loop untuk setiap cookie DAN setiap path
    cookiesToDelete.forEach((cookieName) => {
        relevantPaths.forEach((path) => {
            console.log(`Menghapus cookie: ${cookieName} dengan Path: ${path} (HttpOnly: true)`);
            response.cookies.set({
                name: cookieName,
                value: "",
                path: path,
                maxAge: 0, // Set Max-Age 0 untuk menghapus segera
                httpOnly: true, // <--- INI KUNCI UTAMA (Harus dicocokkan dengan cookie asli)
                // secure: process.env.NODE_ENV === 'production', // Tambahkan ini jika sudah di hosting HTTPS
            });
        });
    });

    console.log("Status: Berhasil membuat Response untuk menghapus cookie.");
    console.log("--- END LOGOUT DEBUGGING (FIXED) ---");

    return response;
}