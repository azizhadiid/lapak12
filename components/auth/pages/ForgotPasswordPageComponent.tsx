"use client"

import React, { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import MainLayoutAuth from "../MainLayoutAuth";
import SectionIlustrationAuth from "../components/SectionIlustration";

export default function ForgotPageComponent() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logika untuk submit form
        console.log('Form submitted:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
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
                                Lupa Password Akun
                            </h3>
                            <p className="text-sm text-gray-600">
                                Masukkan Email Anda untuk reset password.
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
                                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                                    />
                                </div>
                            </div>

                            {/* Tombol Submit (Gaya Asli + Fokus shadcn) */}
                            <button
                                type="submit"
                                className="group relative w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    Kirim Email
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </form>

                        {/* Meniru CardFooter */}
                        <div className="flex flex-col items-center justify-center space-y-2 p-6 sm:p-8 pt-0 lg:-mt-10">
                            <p className="text-sm text-gray-600">
                                Sudah punya akun?{' '}
                                <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline">
                                    Masuk sekarang
                                </a>
                            </p>
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