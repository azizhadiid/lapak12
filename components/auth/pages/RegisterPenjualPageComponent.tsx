"use client"

import React, { useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    User,
    XCircle,
} from "lucide-react";
import MainLayoutAuth from "../MainLayoutAuth";
import SectionIlustrationAuthPenjual from "../components/SectionIlustrationPenjual";
import supabase from "@/lib/db";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormErrors = {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

type AlertState = {
    message: string;
    type: 'success' | 'error';
}

export default function RegisterPenjualPageComponent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<AlertState | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAlertMessage(null); // Reset alert setiap kali submit

        if (!validateForm()) {
            setAlertMessage({
                type: 'error',
                message: 'Mohon periksa kembali form yang Anda isi.',
            });
            return;
        }

        setIsLoading(true);

        try {
            // 🟡 1️⃣ Cek apakah email sudah ada di tabel users
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
                setAlertMessage({
                    type: 'error',
                    message: 'Email sudah terdaftar. Gunakan email lain atau masuk.',
                });
                setIsLoading(false);
                return;
            }

            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                        role: 'penjual',
                    },
                },
            });

            if (error) {
                setAlertMessage({
                    type: 'error',
                    message: error.message || "Terjadi kesalahan, coba lagi.",
                });
            } else {
                setAlertMessage({
                    type: 'success',
                    message: 'Registrasi Berhasil! Silakan cek email untuk verifikasi.',
                });
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err) {
            setAlertMessage({
                type: 'error',
                message: "Terjadi kesalahan pada sistem. Coba lagi nanti.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    return (
        <MainLayoutAuth>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                {/* Kiri - Ilustrasi & Info (Diubah untuk Penjual) */}
                <SectionIlustrationAuthPenjual />

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
                                Isi data diri Anda untuk mulai berbisnis.
                            </p>
                        </div>

                        {/* Meniru CardContent */}
                        <form
                            onSubmit={handleSubmit}
                            className="p-6 sm:p-8 pt-0 space-y-5 lg:-mt-10"
                        >
                            {alertMessage && (
                                <Alert
                                    variant={
                                        alertMessage.type === "error" ? "destructive" : "default"
                                    }
                                    className={
                                        alertMessage.type === "success"
                                            ? "bg-green-50 border-green-200 text-green-800"
                                            : ""
                                    }
                                >
                                    {alertMessage.type === "success" ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <XCircle className="h-4 w-4" />
                                    )}
                                    <AlertTitle>
                                        {alertMessage.type === "success"
                                            ? "Berhasil"
                                            : "Gagal Mendaftar"}
                                    </AlertTitle>
                                    <AlertDescription>{alertMessage.message}</AlertDescription>
                                </Alert>
                            )}

                            {/* Username */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium leading-none"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Masukkan username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`flex h-10 w-full rounded-md border ${errors.username ? "border-red-300" : "border-gray-200"
                                            } bg-white px-3 py-2 text-sm ring-offset-white file:border-0 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10`}
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-red-600">{errors.username}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="text"
                                        placeholder="Masukkan email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`flex h-10 w-full rounded-md border ${errors.email ? "border-red-300" : "border-gray-200"
                                            } bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10`}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Masukkan password"
                                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Konfirmasi Password */}
                            <div className="space-y-2 mb-10">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium"
                                >
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Konfirmasi password Anda"
                                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                            >
                                {isLoading ? "Mendaftar..." : (
                                    <span className="relative flex items-center justify-center gap-2">
                                        Registrasi
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Meniru CardFooter */}
                        <div className="flex items-center justify-center p-6 sm:p-8 pt-0 lg:-mt-10">
                            <p className="text-sm text-gray-600">
                                Sudah punya akun?{' '}
                                <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline">
                                    Masuk sekarang
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayoutAuth>
    );
}