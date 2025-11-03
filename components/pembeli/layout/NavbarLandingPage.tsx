import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, ShoppingCart, User } from "lucide-react";

export default function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Tombol Menu Mobile */}
                <div className="lg:hidden">
                    <Button onClick={onMenuClick} variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Buka Menu</span>
                    </Button>
                </div>

                {/* Logo */}
                <a href="#" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Lapak12</span>
                </a>

                {/* Navigasi Desktop */}
                <nav className="hidden items-center gap-6 lg:flex">
                    <a href="#" className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">Home</a>
                    <a href="#" className="text-sm font-medium text-gray-500 transition-colors hover:text-blue-600">Kategori</a>
                    <a href="#" className="text-sm font-medium text-gray-500 transition-colors hover:text-blue-600">Promo</a>
                    <a href="#" className="text-sm font-medium text-gray-500 transition-colors hover:text-blue-600">Menjadi Seller</a>
                </nav>

                {/* Aksi (Search, Cart, User) */}
                <div className="flex items-center gap-2">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input type="search" placeholder="Cari produk..." className="w-full pl-9" />
                    </div>
                    <Button variant="ghost" size="icon">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Keranjang</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Profil</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}