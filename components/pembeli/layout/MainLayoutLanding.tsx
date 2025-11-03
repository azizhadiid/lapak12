"use client"

import React, { useState } from "react";
import FooterLandingPage from "./FooterLanding";
import MobileMenu from "./MobileMenuLanding";
import AppHeader from "./NavbarLandingPage";

export default function MainLayoutLanding({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
            {/* Navbar */}
            <AppHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <FooterLandingPage />
        </div>
    );
}