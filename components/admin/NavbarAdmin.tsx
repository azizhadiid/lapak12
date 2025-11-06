"use client"

import React, { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";

export default function NavbarAdmin() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <img
                            src="/logo.png"
                            alt="Lapak12 Logo"
                            className="w-auto h-11"
                            onError={(e) => {
                                // Menambahkan fallback jika gambar gagal dimuat
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = 'https://placehold.co/44x44/cccccc/333333?text=Logo&font=sans';
                                target.alt = 'Gagal memuat logo';
                            }}
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-1 items-center">
                        <form action="/api/auth/signout" method="post">
                            <button
                                type="submit"
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </form>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden py-4 space-y-1 border-t border-blue-100">
                        <form action="/api/auth/signout" method="post">
                            <button
                                type="submit"
                                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all text-gray-600 hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </form>

                    </nav>
                )}
            </div>
        </header>
    );
}