'use client'; // Tambahkan ini jika menggunakan Next.js App Router

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';

// Definisikan tipe untuk state agar TypeScript tidak error
type FormErrors = {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

type ToastState = {
    message: string;
    type: 'success' | 'error';
};

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Gunakan tipe yang sudah didefinisikan
    const [errors, setErrors] = useState<FormErrors>({});
    const [toast, setToast] = useState<ToastState | null>(null);

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

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Tipe event di sini adalah untuk form, bukan button click
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateForm()) {
            showToast('Registrasi berhasil! Selamat datang di Lapak12 🎉', 'success');
            console.log('Form data:', formData);
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
        } else {
            showToast('Mohon periksa kembali form Anda', 'error');
        }
    };

    // Beri tipe pada event handler
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
            {toast && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
                    <Alert className={`${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} shadow-lg flex items-center gap-3`}>
                        {/* Ikon dan AlertDescription sekarang menjadi anak langsung dari Alert */}
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <AlertDescription>
                            {toast.message}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

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
                        {/* Gunakan tag <form> dengan onSubmit */}
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            >
                                Daftar Sekarang
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Sudah punya akun?{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
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