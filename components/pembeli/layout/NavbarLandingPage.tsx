import Link from "next/link"; // 1. Impor Link untuk navigasi
import { Button, buttonVariants } from "@/components/ui/button"; // 2. Impor buttonVariants
import { User } from "lucide-react";
import { cn } from "@/lib/utils"; // (Asumsi Anda punya utility `cn` dari shadcn)

// 3. Tambahkan kembali prop onMenuClick
export default function AppHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo (Selalu di Kiri) */}
                <Link href="/" className="flex flex-shrink-0 items-center gap-2">
                    {/* Ganti <a> dengan <Link> untuk navigasi Next.js */}
                    <div className="flex items-center justify-center rounded-lg">
                        <img
                            src="/logo.png"
                            alt="Lapak12 Logo"
                            className="h-11 w-auto"
                            onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.src =
                                    "https://placehold.co/100x44/cccccc/333333?text=Logo&font=sans";
                                target.alt = "Gagal memuat logo";
                            }}
                        />
                    </div>
                </Link>

                {/* Aksi (Selalu di Kanan) */}
                <div className="flex items-center gap-2">

                    {/* Tombol Auth Desktop (Tampil di 'lg' ke atas) */}
                    <div className="hidden items-center gap-2 lg:flex">
                        {/* 4. Gunakan Link yang diberi style seperti Button */}
                        <Link
                            href="/login"
                            className={buttonVariants({ variant: "ghost" })}
                        >
                            Masuk
                        </Link>
                        <Button className='bg-blue-600 hover:bg-blue-700' asChild>
                            <Link
                                href="/register"
                            >
                                Buat Akun
                            </Link>
                        </Button>
                    </div>

                    {/* Tombol Auth & Menu Mobile (Tampil di bawah 'lg') */}
                    <div className="flex items-center gap-1 lg:hidden">
                        {/* 5. Tombol "Masuk" dengan TULISAN + IKON di mobile */}
                        <Link
                            href="/login"
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                "flex items-center gap-1.5" // Tambahkan gap untuk ikon
                            )}
                        >
                            <User className="h-5 w-5" />
                            <span>Masuk</span>
                        </Link>
                    </div>

                </div>
            </div>
        </header>
    );
}