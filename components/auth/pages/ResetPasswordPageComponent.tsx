"use client"

import React, { useState, useEffect } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import MainLayoutAuth from "../MainLayoutAuth";
import SectionIlustrationAuth from "../components/SectionIlustration";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from 'next/navigation'; // Diperlukan untuk redirect

export default function ResetPasswordPageComponent() {
    const supabase = createClientComponentClient();
    const router = useRouter(); // Gunakan useRouter
    const searchParams = useSearchParams();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true); // Mulai sebagai loading
    const [formData, setFormData] = useState({
        // Hapus 'email' dari formData di halaman reset, tidak diperlukan.
        password: '',
        confirmPassword: ''
    });

    // --- Efek untuk Pengecekan Sesi (Guardrail) ---
    useEffect(() => {
        const handleRecovery = async () => {
            const hash = window.location.hash;
            let session = null;

            // 1. Jika ada hash di URL, berarti kita baru saja di-redirect dari email.
            if (hash) {
                // Hapus hash fragment dari URL segera. 
                // Ini mencegah masalah jika pengguna me-refresh halaman, dan membantu SDK Supabase menstabilkan sesi.
                window.history.replaceState(null, '', window.location.pathname);

                // **PERBAIKAN KRUSIAL:** Tambahkan penundaan yang lebih panjang.
                // Ini memberi waktu Supabase SDK (yang mendengarkan perubahan hash) 
                // untuk memproses token di hash dan menyimpannya ke storage (cookies/localStorage).
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // 2. Cek sesi. Sesi seharusnya sudah ada di storage sekarang.
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            session = currentSession;

            if (!session) {
                // JIKA sesi tetap TIDAK ditemukan.
                Swal.fire({
                    icon: "error",
                    title: "Sesi Tidak Ditemukan",
                    text: "Link reset password tidak valid, kadaluarsa, atau gagal diproses. Silakan minta link baru.",
                }).then(() => router.push("/login"));
                return;
            }

            // Jika sesi ditemukan, lanjutkan
            setLoading(false);
        };

        handleRecovery();
    }, [router, supabase]);


    // --- Handler Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Jangan izinkan submit jika masih loading atau belum siap
        if (loading) return;

        // 1. Validasi Password
        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Gagal!",
                text: "Password baru dan konfirmasi password tidak cocok.",
                confirmButtonColor: "#2563eb",
            });
            return;
        }

        if (formData.password.length < 6) {
            Swal.fire({
                icon: "warning",
                title: "Gagal!",
                text: "Password harus memiliki minimal 6 karakter.",
                confirmButtonColor: "#2563eb",
            });
            return;
        }

        setLoading(true);

        // 2. Panggil Supabase untuk update password
        // Operasi ini HANYA akan berhasil jika sesi reset password yang valid sudah aktif.
        const { error } = await supabase.auth.updateUser({
            password: formData.password
        });

        setLoading(false);

        if (error) {
            console.error(error);
            // Error ini mungkin masih "Auth session missing" jika timing masih gagal
            // atau jika token benar-benar kedaluwarsa saat tombol diklik.
            Swal.fire({
                icon: "error",
                title: "Gagal Reset!",
                text: error.message || "Gagal memperbarui password. Coba lagi atau minta link baru.",
                confirmButtonColor: "#2563eb",
            });
            return;
        }

        // 3. Sukses
        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Password Anda berhasil direset. Anda dapat login sekarang.",
            confirmButtonColor: "#2563eb",
        }).then(() => {
            router.push('/login');
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Tampilkan loader di tengah jika masih menunggu sesi Supabase
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg font-medium text-gray-700">Memeriksa Sesi...</span>
            </div>
        );
    }

    // Tampilkan form setelah sesi dipastikan siap
    return (
        <MainLayoutAuth>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* ... (Bagian ilustrasi) ... */}
                <SectionIlustrationAuth />

                {/* Kanan - Form */}
                <div className="w-full">
                    <div className="rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-xl shadow-blue-100/50">
                        {/* Meniru CardHeader */}
                        <div className="flex flex-col space-y-1.5 p-6 sm:p-8">
                            <h3 className="text-2xl sm:text-3xl font-semibold leading-none tracking-tight text-gray-900">
                                Reset Password Akun
                            </h3>
                            <p className="text-sm text-gray-600">
                                Masukkan password baru Anda.
                            </p>
                        </div>

                        {/* Meniru CardContent */}
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-0 space-y-5 lg:-mt-10">
                            {/* Password Baru */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium leading-none"
                                >
                                    Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Masukkan password baru"
                                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Konfirmasi Password */}
                            <div className="space-y-2 mb-10">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium leading-none"
                                >
                                    Konfirmasi Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Konfirmasi Password Anda"
                                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Tombol Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Mengganti Password...
                                        </>
                                    ) : (
                                        <>
                                            Reset Password
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* ... (Bagian footer) ... */}
                        <div className="flex items-center justify-center p-6 sm:p-8 pt-0 lg:-mt-10">
                            <p className="text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <a href="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline">
                                    Daftar sekarang
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayoutAuth>
    );
}