"use client"

import React, { useState } from 'react';
import { ShoppingCart, Eye, EyeOff, Mail, Lock, User, MapPin, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        address: ''
    });
    const [focused, setFocused] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 rounded-full"></div>
                            <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-2xl shadow-lg">
                                <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            Lapak12
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left Side - Illustration & Info */}
                    <div className="hidden lg:block space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                Mulai Berjualan Sekarang
                            </div>
                            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                                Bergabung dengan<br />
                                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    Ribuan Seller
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-md">
                                Daftar gratis dan mulai jual produk Anda ke seluruh Indonesia dengan mudah dan cepat.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-4">
                            {[
                                'Gratis biaya pendaftaran',
                                'Dashboard seller yang mudah',
                                'Dukungan berbagai metode pembayaran',
                                'Jangkauan pelanggan luas'
                            ].map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-700 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        {/* Illustration */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 blur-3xl opacity-10 rounded-full"></div>
                            <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 p-8 rounded-3xl">
                                <svg viewBox="0 0 400 300" className="w-full h-auto">
                                    {/* Store */}
                                    <rect x="100" y="120" width="200" height="150" fill="#3B82F6" rx="8" />
                                    <path d="M100 120 Q150 80, 200 120 Q250 80, 300 120" fill="#2563EB" />
                                    <rect x="100" y="115" width="200" height="12" fill="#1E40AF" rx="6" />

                                    {/* Shelves */}
                                    <rect x="120" y="150" width="30" height="40" fill="#60A5FA" rx="4" />
                                    <rect x="160" y="150" width="30" height="40" fill="#60A5FA" rx="4" />
                                    <rect x="120" y="200" width="30" height="40" fill="#60A5FA" rx="4" />
                                    <rect x="160" y="200" width="30" height="40" fill="#60A5FA" rx="4" />

                                    {/* Products */}
                                    <rect x="125" y="155" width="8" height="15" fill="#DBEAFE" rx="2" />
                                    <rect x="137" y="155" width="8" height="15" fill="#DBEAFE" rx="2" />
                                    <rect x="165" y="155" width="8" height="18" fill="#DBEAFE" rx="2" />
                                    <rect x="177" y="155" width="8" height="18" fill="#DBEAFE" rx="2" />

                                    {/* Person */}
                                    <circle cx="250" cy="190" r="20" fill="#1E3A8A" />
                                    <rect x="235" y="210" width="30" height="40" fill="#60A5FA" rx="6" />
                                    <rect x="230" y="220" width="15" height="25" fill="#3B82F6" rx="4" />
                                    <rect x="255" y="220" width="15" height="25" fill="#3B82F6" rx="4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full">
                        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 p-6 sm:p-8 lg:p-10">
                            <div className="mb-8">
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    Buat Akun
                                </h3>
                                <p className="text-gray-600">
                                    Isi data diri Anda untuk mendaftar
                                </p>
                            </div>

                            <div className="space-y-5">
                                {/* Username */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Username
                                    </label>
                                    <div className={`relative transition-all ${focused === 'username' ? 'scale-[1.01]' : ''}`}>
                                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl blur-sm transition-opacity ${focused === 'username' ? 'opacity-20' : 'opacity-0'}`}></div>
                                        <div className="relative">
                                            <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'username' ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('username')}
                                                onBlur={() => setFocused('')}
                                                placeholder="Masukkan nama"
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Email
                                    </label>
                                    <div className={`relative transition-all ${focused === 'email' ? 'scale-[1.01]' : ''}`}>
                                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl blur-sm transition-opacity ${focused === 'email' ? 'opacity-20' : 'opacity-0'}`}></div>
                                        <div className="relative">
                                            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('email')}
                                                onBlur={() => setFocused('')}
                                                placeholder="Masukkan email"
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Password
                                    </label>
                                    <div className={`relative transition-all ${focused === 'password' ? 'scale-[1.01]' : ''}`}>
                                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl blur-sm transition-opacity ${focused === 'password' ? 'opacity-20' : 'opacity-0'}`}></div>
                                        <div className="relative">
                                            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'password' ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('password')}
                                                onBlur={() => setFocused('')}
                                                placeholder="Masukkan nomor telepon"
                                                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Alamat
                                    </label>
                                    <div className={`relative transition-all ${focused === 'address' ? 'scale-[1.01]' : ''}`}>
                                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl blur-sm transition-opacity ${focused === 'address' ? 'opacity-20' : 'opacity-0'}`}></div>
                                        <div className="relative">
                                            <MapPin className={`absolute left-4 top-4 w-5 h-5 transition-colors ${focused === 'address' ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('address')}
                                                onBlur={() => setFocused('')}
                                                placeholder="Masukkan alamat lengkap"
                                                rows={3}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="group relative w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative flex items-center justify-center gap-2">
                                        Registrasi
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Sudah punya akun?{' '}
                                    <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                                        Masuk sekarang
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Layanan Bantuan</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Bantuan</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Hubungi Kami</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Jelajahi Lapak12</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Tentang Kami</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Pembayaran</h4>
                            <div className="flex flex-wrap gap-2">
                                <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">QRIS</div>
                                <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">DANA</div>
                                <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">OVO</div>
                                <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">GoPay</div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Ikuti Kami</h4>
                            <div className="flex gap-3">
                                <a href="#" className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-600">
                            © Lapak12 2025. Hak Cipta Dilindungi
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}