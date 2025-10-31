"use client"

import { Heart, LayoutDashboard, LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import React, { useState } from "react";

export default function NavbarPenjual() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: false },
        { icon: ShoppingBag, label: 'Pesanan Saya', active: false },
        { icon: Heart, label: 'Wishlist', active: false },
        { icon: User, label: 'Profile', active: true },
        { icon: LogOut, label: 'Logout', active: false }
    ];

    return (
        <>
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Lapak 12
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-1">
                            {navItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${item.active
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
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
                            {navItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all ${item.active
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                        : 'text-gray-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    )}
                </div>
            </header>
        </>
    );
}