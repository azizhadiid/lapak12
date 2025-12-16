import { NextResponse } from "next/server";

export async function POST() {
    // Daftar cookie yang ingin kamu hapus


    const cookiesToDelete = [
        "__next_hmr_refresh_hash__",   // contohnya dari gambar yang kamu kirim
        "sb-zmhvafeistkzljdxwxwk-auth-token",
    ];

    const response = NextResponse.json({ message: "Logged out" });

    // Hapus semua cookie yang disebutkan
    cookiesToDelete.forEach((cookieName) => {
        response.cookies.set(cookieName, "", {
            path: "/",
            expires: 0,
        });
    });

    return response;
}
