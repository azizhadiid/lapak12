
import { Button } from "@/components/ui/button";
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { LogOut, UserCircle } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
    const supabase = createServerComponentClient({ cookies });

    // 1. Ambil informasi sesi pengguna
    const { data: { session } } = await supabase.auth.getSession();

    // 2. Jika tidak ada sesi (belum login), "pental" ke halaman login
    if (!session) {
        redirect('/login');
    }

    // 3. Jika ada sesi, ambil data profil dari tabel 'users' kita
    const { data: user, error } = await supabase
        .from('users')
        .select(`username, email`)
        .eq('id', session.user.id)
        .single();

    if (error || !user) {
        // Handle kasus jika user ada di auth tapi tidak ada di tabel profil
        // Ini jarang terjadi jika trigger Anda bekerja dengan baik
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <p>Gagal memuat data pengguna. Silakan coba <Link href="/login" className="text-blue-600">login kembali</Link>.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-blue-600">Lapak12</h1>
                    <p className="text-gray-600 mt-2">Selamat datang di dasbor Anda!</p>
                </header>

                <Card className="shadow-lg border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle className="text-2xl">Profil Pengguna</CardTitle>
                            <CardDescription>Informasi akun Anda yang terdaftar.</CardDescription>
                        </div>
                        <UserCircle className="w-12 h-12 text-gray-300" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium text-gray-500">Username</p>
                            <p className="text-lg font-semibold text-gray-800">{user.username}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                        </div>

                        {/* Tombol Logout sekarang ada di dalam form agar bisa memanggil Server Action */}
                        <form action="/api/auth/signout" method="post">
                            <Button
                                variant="destructive"
                                className="w-full mt-4"
                                type="submit"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Keluar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
