"use client"

import { House, LogOut, Menu, PackageSearch, ShoppingBasket, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

export default function NavbarPenjual() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { icon: House, label: 'Beranda', href: '/home' },
        { icon: PackageSearch, label: 'Product', href: '/product' },
        { icon: ShoppingBasket, label: 'Keranjang', href: '/keranjang' },
        { icon: User, label: 'Profile', href: '/profile' },
    ];

    return (
        <>
            {/* Header */}
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
                            {navItems.map((item) => {
                                // Logika pengecekan aktif
                                const isActive = pathname.startsWith(item.href);

                                return (
                                    // Mengganti <button> dengan <Link>
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-blue-50'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                            {/* Tombol Logout Terpisah */}
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
                            {navItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        // Menutup menu saat link diklik
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                            : 'text-gray-600 hover:bg-blue-50'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                            {/* Tombol Logout Terpisah (Mobile) */}
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
        </>
    );
}