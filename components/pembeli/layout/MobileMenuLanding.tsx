import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, X } from "lucide-react";

export default function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            />
            {/* Konten Sheet */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm transform bg-white shadow-xl transition-transform lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col p-6">
                    <div className="flex items-center justify-between">
                        {/* Logo di Menu */}
                        <a href="#" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Lapak12</span>
                        </a>
                        <Button onClick={onClose} variant="ghost" size="icon">
                            <X className="h-6 w-6" />
                            <span className="sr-only">Tutup Menu</span>
                        </Button>
                    </div>

                    {/* Search Bar Mobile */}
                    <div className="relative mt-6">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input type="search" placeholder="Cari produk..." className="w-full pl-9" />
                    </div>

                    {/* Link Navigasi Mobile */}
                    <nav className="mt-8 flex flex-col gap-4">
                        <a href="#" className="text-lg font-medium text-gray-900">Home</a>
                        <a href="#" className="text-lg font-medium text-gray-700">Kategori</a>
                        <a href="#" className="text-lg font-medium text-gray-700">Promo</a>
                        <a href="#" className="text-lg font-medium text-gray-700">Menjadi Seller</a>
                    </nav>
                </div>
            </div>
        </>
    );
}