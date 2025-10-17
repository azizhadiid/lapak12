'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, UserCircle } from "lucide-react";

// Di masa depan, data ini akan diambil dari Supabase setelah user login.
// Untuk sekarang, kita gunakan data statis sebagai contoh.
const userData = {
    username: 'Aziza',
    email: 'aziza@email.com',
};

export default function HomePage() {
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
                            <p className="text-lg font-semibold text-gray-800">{userData.username}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-lg font-semibold text-gray-800">{userData.email}</p>
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full mt-4"
                            // Fungsi logout akan kita implementasikan nanti
                            onClick={() => alert('Fungsi logout belum diimplementasikan.')}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Keluar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
