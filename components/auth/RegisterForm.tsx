'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, ShoppingBag, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import supabase from '@/lib/db';

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

export default function RegisterForm() {
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
                        role: 'pembeli',
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">Lapak12</h1>
                    <p className="text-gray-600">Daftar untuk memulai belanja</p>
                </div>

                <Card className="border-gray-100 shadow-xl">
                    <CardHeader>
                        <CardTitle>Buat Akun Baru</CardTitle>
                        <CardDescription>Isi formulir di bawah untuk mendaftar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {alertMessage && (
                                <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'} className={alertMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}>
                                    {alertMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    <AlertTitle>{alertMessage.type === 'success' ? 'Berhasil' : 'Gagal Mendaftar'}</AlertTitle>
                                    <AlertDescription>
                                        {alertMessage.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Masukkan username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={errors.username ? 'border-red-300 focus-visible:ring-red-500' : ''}
                                />
                                {errors.username && (
                                    <p className="text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>

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
                                        placeholder="Minimal 8 karakter"
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
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Ulangi password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={errors.confirmPassword ? 'border-red-300 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Sudah punya akun?{' '}
                            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                Masuk di sini
                            </a>
                        </p>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Dengan mendaftar, Anda menyetujui{' '}
                    <a href="#" className="text-blue-600 hover:underline">Syarat & Ketentuan</a>
                    {' '}dan{' '}
                    <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
                </p>
            </div>
        </div>
    );
}

