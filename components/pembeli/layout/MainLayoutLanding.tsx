"use client"

import FooterLandingPage from "./FooterLanding";
import AppHeader from "./NavbarLandingPage";

export default function MainLayoutLanding({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
            {/* Navbar */}
            <AppHeader />

            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <FooterLandingPage />
        </div>
    );
}