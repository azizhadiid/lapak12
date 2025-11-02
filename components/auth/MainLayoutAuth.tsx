import FooterAuth from "./FooterAuth";
import NavbarAuth from "./NavbarAuth";

export default function MainLayoutAuth({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 font-sans">
            <NavbarAuth />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                {children}
            </main>
            <FooterAuth />
        </div>
    );
}