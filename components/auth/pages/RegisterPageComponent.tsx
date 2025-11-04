"use client"

import React, { useState } from "react";
import Link from "next/link"; // <-- Impor Link
import { useRouter } from "next/navigation"; // <-- Impor useRouter
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // <-- Impor Supabase
import Swal from 'sweetalert2'; // <-- Impor SweetAlert2
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Loader2 } from "lucide-react";
import MainLayoutAuth from "../MainLayoutAuth";
import SectionIlustrationAuth from "../components/SectionIlustration";

// Tipe untuk validasi error
type FormErrors = {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

export default function RegisterPageComponent() {
    // --- State dari UI Baru ---
    const [showPassword, setShowPassword] = useState(false);
    // Tambahkan state untuk konfirmasi password
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- State & Hooks dari Logika Lama ---
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const supabase = createClientComponentClient();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // --- Logika Validasi dari Form Lama ---
    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username wajib diisi';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username minimal 3 karakter';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password minimal 8 karakter';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Logika HandleChange dari Form Lama ---
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

    // --- Logika HandleSubmit dari Form Lama (diadaptasi ke SweetAlert) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi form
        if (!validateForm()) {
            const firstError = Object.values(errors).find(err => err);
            Swal.fire({
                title: 'Validasi Gagal',
                text: firstError || 'Mohon periksa kembali data Anda.',
                icon: 'warning',
                confirmButtonColor: '#3B82F6',
            });
            return;
        }

        setIsLoading(true);

        try {
            // 1. Cek apakah email sudah ada (logika custom dari form lama)
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('email')
                .eq('email', formData.email)
                .maybeSingle();

            if (checkError) {
                console.error('Supabase check error:', checkError);
                throw new Error('Gagal memeriksa email.');
            }

            if (existingUser) {
                Swal.fire({
                    title: 'Gagal Mendaftar',
                    text: 'Email sudah terdaftar. Gunakan email lain atau masuk.',
                    icon: 'error',
                    confirmButtonColor: '#3B82F6',
                });
                setIsLoading(false);
                return;
            }

            // 2. Jika email aman, daftarkan user
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                        role: 'pembeli', // Otomatis set role 'pembeli'
                    },
                },
            });

            if (error) {
                Swal.fire({
                    title: 'Gagal Mendaftar',
                    text: error.message || "Terjadi kesalahan, coba lagi.",
                    icon: 'error',
                    confirmButtonColor: '#3B82F6',
                });
            } else {
                // 3. Tampilkan sukses dan redirect
                await Swal.fire({
                    title: 'Registrasi Berhasil!',
                    text: 'Silakan cek email Anda untuk verifikasi.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                router.push('/login');
            }
        } catch (err) {
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
                                Buat Akun
                            </h3>
                            <p className="text-sm text-gray-600">
                                Isi data diri Anda untuk mulai berbelanja.
                            </p>
                        </div>

                        {/* Meniru CardContent */}
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-0 space-y-5 lg:-mt-10">
                            {/* Username */}
                            <div className="space-y-2">
                                {/* Meniru Label shadcn */}
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    {/* Meniru Input shadcn */}
                                    <input
                                        type="text"
                                        id="username"
                                        name="username" // <-- Pastikan 'name' ada
                                        value={formData.username}
                                        onChange={handleChange} // <-- Hubungkan handler
                                        placeholder="Masukkan nama"
                                        // Tambahkan style error
                                        className={`flex h-10 w-full rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-200'} bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10`}
                                    />
                                </div>
                                {/* Tampilkan pesan error inline */}
                                {errors.username && (
                                    <p className="text-xs text-red-600 mt-1">{errors.username}</p>
                                )}
                            </div>

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
                                        className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-200'} bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10`}
                                    />
                                </div>
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
                                        placeholder="Minimal 8 karakter"
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
                                {errors.password && (
                                    <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirmasi Password */}
                            <div className="space-y-2 mb-10">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium leading-none"
                                >
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        // Gunakan state showConfirmPassword
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Konfirmasi Password Anda"
                                        className={`flex h-10 w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10 pr-10`}
                                    />
                                    <button
                                        type="button"
                                        // Ganti onClick ke state yang benar
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                        aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    >
                                        {/* Ganti ke state yang benar */}
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Tombol Submit (Gaya Asli + Fokus shadcn) */}
                            <button
                                type="submit"
                                className="group relative w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
                                disabled={isLoading} // <-- Tambahkan disabled
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Mendaftarkan...
                                        </>
                                    ) : (
                                        <>
                                            Registrasi
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Meniru CardFooter */}
                        <div className="flex items-center justify-center p-6 sm:p-8 pt-0 lg:-mt-10">
                            <p className="text-sm text-gray-600">
                                Sudah punya akun?{' '}
                                <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline">
                                    Masuk sekarang
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayoutAuth>
    );
}