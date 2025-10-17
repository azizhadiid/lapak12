'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, ShoppingBag, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import supabase from '@/lib/db';
import { Checkbox } from '../ui/checkbox';


type FormErrors = {
    email?: string;
    password?: string;
};

type AlertState = {
    message: string;
    type: 'success' | 'error';
}

export default function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<AlertState | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAlertMessage(null); // Reset alert setiap kali submit

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                setAlertMessage({
                    type: 'error',
                    message: "Email atau password salah. Silakan coba lagi.", // Pesan error yang lebih umum
                });
            } else {
                // Tidak perlu menampilkan alert sukses, langsung arahkan
                router.push('/'); // Arahkan ke halaman utama/dashboard setelah login
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">Selamat Datang Kembali</h1>
                    <p className="text-gray-600">Masuk untuk melanjutkan belanja</p>
                </div>

                <Card className="border-gray-100 shadow-xl">
                    <CardHeader>
                        <CardTitle>Masuk ke Akun Anda</CardTitle>
                        <CardDescription>Gunakan email dan password yang terdaftar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {alertMessage && (
                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>Gagal Masuk</AlertTitle>
                                    <AlertDescription>
                                        {alertMessage.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'border-red-300 focus-visible:ring-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password Anda"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? 'border-red-300 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Fitur Ingat Saya & Lupa Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember-me" />
                                    <Label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Ingat Saya
                                    </Label>
                                </div>
                                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                    Lupa Password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                Daftar di sini
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

