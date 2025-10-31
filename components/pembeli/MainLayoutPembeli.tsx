import FooterPembeli from "./FooterPembeli";
import NavbarPenjual from "./NavbarPembeli";

export default function MainLayoutPembeli({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
            <NavbarPenjual />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <FooterPembeli />
        </div>
    );
}