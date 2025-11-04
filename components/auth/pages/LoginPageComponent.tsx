"use client"

import React, { useState } from "react";
import Link from "next/link"; // <-- Impor Link
import { useRouter } from "next/navigation"; // <-- Impor useRouter
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // <-- Impor Supabase
import Swal from 'sweetalert2'; // <-- Impor SweetAlert2
import { ArrowRight, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import MainLayoutAuth from "../MainLayoutAuth";
import SectionIlustrationAuth from "../components/SectionIlustration";

type FormErrors = {
    email?: string;
    password?: string;
};

export default function LoginPageComponent() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // --- Logika yang Dimigrasi dari LoginForm ---
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const supabase = createClientComponentClient();

    // Fungsi validasi
    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle perubahan input sekaligus hapus error
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Hapus error saat pengguna mengetik
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Handle submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi form
        if (!validateForm()) {
            // Ambil error pertama untuk ditampilkan
            const firstError = Object.values(errors).find(err => err);
            Swal.fire({
                title: 'Validasi Gagal',
                text: firstError || 'Mohon periksa kembali data Anda.',
                icon: 'warning',
                confirmButtonColor: '#3B82F6', // Warna biru
            });
            return;
        }

        setIsLoading(true);

        try {
            // 1. Proses login
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                Swal.fire({
                    title: 'Gagal Masuk',
                    text: "Email atau password salah. Silakan coba lagi.",
                    icon: 'error',
                    confirmButtonColor: '#3B82F6',
                });
                setIsLoading(false);
                return;
            }

            // 2. Ambil data user yang baru login
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("Gagal mendapatkan sesi user setelah login.");
            }

            // 3. Ambil role dari tabel 'users' menggunakan ID
            const { data: dbUser, error: dbError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id) // <-- LEBIH AMAN pakai user.id
                .single();

            if (dbError) {
                console.error("Gagal mengambil role dari database:", dbError);
                Swal.fire({
                    title: 'Error',
                    text: "Gagal memverifikasi role pengguna. Coba lagi.",
                    icon: 'error',
                    confirmButtonColor: '#3B82F6',
                });
                setIsLoading(false);
                return;
            }

            const role = dbUser?.role;

            // 4. Tampilkan notifikasi sukses
            await Swal.fire({
                title: 'Login Berhasil!',
                text: 'Selamat datang kembali.',
                icon: 'success',
                timer: 1500, // Tutup otomatis setelah 1.5 detik
                showConfirmButton: false,
            });

            // 5. Redirect sesuai role
            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else if (role === 'penjual') {
                router.push('/penjual/dashboard');
            } else {
                router.push('/home'); // Default untuk 'pembeli'
            }

            router.refresh();

        } catch (err) {
            console.error("Error during login:", err);
            Swal.fire({
                title: 'Terjadi Kesalahan',
                text: "Terjadi kesalahan pada sistem. Coba lagi nanti.",
                icon: 'error',
                confirmButtonColor: '#3B82F6',
            });
        } finally {
            setIsLoading(false);
        }
    };
    // --- Akhir dari logika yang dimigrasi ---

    return (
        <MainLayoutAuth>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                {/* Kiri - Ilustrasi & Info (Diubah untuk Pembeli) */}
                <SectionIlustrationAuth />

                {/* Kanan - Form (Gaya shadcn/ui) */}
                <div className="w-full">
                    {/* Meniru Card shadcn */}
                    <div className="rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-xl shadow-blue-100/50">
                        {/* Meniru CardHeader */}
                        <div className="flex flex-col space-y-1.5 p-6 sm:p-8">
                            <h3 className="text-2xl sm:text-3xl font-semibold leading-none tracking-tight text-gray-900">
                                Masuk Akun
                            </h3>
                            <p className="text-sm text-gray-600">
                                Masukkan data diri Anda untuk mulai berbelanja.
                            </p>
                        </div>

                        {/* Meniru CardContent */}
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-0 space-y-5 lg:-mt-10">
                            {/* Email */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium leading-none"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Masukkan email"
                                        // Tambahkan style error
                                        className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-200'} bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10`}
                                    />
                                </div>
                                {/* Tampilkan pesan error inline */}
                                {errors.email && (
                                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium leading-none"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Masukkan password"
                                        // Tambahkan style error
                                        className={`flex h-10 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-200'} bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10 pr-10`}
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
                                {/* Tampilkan pesan error inline */}
                                {errors.password && (
                                    <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Ingatkan Saya & Lupa Password */}
                            <div className="flex items-center justify-between mb-8 mt-8">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="remember-me"
                                        // Menggunakan rounded-full untuk membuatnya "bulat"
                                        className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="remember-me"
                                        className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                                    >
                                        Ingatkan Saya
                                    </label>
                                </div>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    Lupa Password?
                                </Link>
                            </div>

                            {/* Tombol Submit (Gaya Asli + Fokus shadcn) */}
                            <button
                                type="submit"
                                className="group relative w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Login
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Meniru CardFooter */}
                        <div className="flex items-center justify-center p-6 sm:p-8 pt-0 lg:-mt-10">
                            <p className="text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <a href="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline">
                                    Buat sekarang
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayoutAuth>
    );
}