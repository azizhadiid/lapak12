"use client"
import { Badge } from "@/components/ui/badge";
import { Apple, ChevronLeft, ChevronRight, Cookie, GlassWater, Home } from "lucide-react";
import { useState } from "react";
import MainLayoutPembeli from "../MainLayoutPembeli";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { Input } from "@/components/ui/input";


const mockCategories = [
    { name: 'Makanan', icon: <Apple className="h-10 w-10 text-blue-600" />, bgColor: 'bg-blue-50' },
    { name: 'Minuman', icon: <GlassWater className="h-10 w-10 text-green-600" />, bgColor: 'bg-green-50' },
    { name: 'Snack', icon: <Cookie className="h-10 w-10 text-orange-600" />, bgColor: 'bg-orange-50' },
    { name: 'Rumah Tangga', icon: <Home className="h-10 w-10 text-purple-600" />, bgColor: 'bg-purple-50' },
];

const mockProducts = [
    { id: 1, name: 'Cheetos Puffs', price: 'Rp 5K', img: 'https://placehold.co/300x300/F97316/FFFFFF?text=Cheetos', tag: 'Promo' },
    { id: 2, name: 'Teh Gelas', price: 'Rp 1.5K', img: 'https://placehold.co/300x300/0284C7/FFFFFF?text=Teh+Gelas' },
    { id: 3, name: 'Makaroni', price: 'Rp 6K', img: 'https://placehold.co/300x300/FACC15/FFFFFF?text=Makaroni' },
    { id: 4, name: 'Head & Shoulders', price: 'Rp 7K', img: 'https://placehold.co/300x300/2563EB/FFFFFF?text=Shampoo' },
    { id: 5, name: 'Bimoli 1L', price: 'Rp 10K', img: 'https://placehold.co/300x300/F59E0B/FFFFFF?text=Bimoli', tag: 'Baru' },
    { id: 6, name: 'Indomie Mi Goreng', price: 'Rp 3.5K', img: 'https://placehold.co/300x300/DC2626/FFFFFF?text=Indomie' },
    { id: 7, name: 'Milo', price: 'Rp 6.5K', img: 'https://placehold.co/300x300/166534/FFFFFF?text=Milo' },
    { id: 8, name: 'Kecap Sedaap', price: 'Rp 21K', img: 'https://placehold.co/300x300/1F2937/FFFFFF?text=Kecap' },
];



export default function HomePagePembeli() {
    const [activeTab, setActiveTab] = useState('terbaru');

    const scrollCarousel = (direction: 'left' | 'right') => {
        const carousel = document.getElementById('bestseller-carousel');
        if (carousel) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <MainLayoutPembeli>
            {/* Hero Section */}
            <section className="bg-white rounded-lg shadow-lg">
                <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-24">
                    <div className="flex flex-col justify-center">
                        <Badge variant="outline" className="w-fit">E-Commerce untuk RT 12</Badge>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                            Belanja Grosir <br />
                            <span className="text-blue-600">Mudah & Cepat</span>
                        </h1>
                        <p className="mt-6 text-lg text-gray-600">
                            Platform bisnis Anda. Dapatkan harga grosir terbaik
                            dengan pengiriman cepat dan terpercaya.
                        </p>
                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <Button size="lg" className='bg-blue-600 hover:bg-blue-700' asChild>
                                <Link href="/login">Mulai Belanja</Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="hover:bg-blue-600 hover:text-white"
                                asChild
                            >
                                <Link href='/auth/penjual/register'>Daftar Jadi Seller</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="hidden items-center justify-center md:flex">
                        <img
                            src="/ilustrasi/shope.png"
                            alt="Ilustrasi Warung Modern"
                            className="rounded-3xl shadow-xl"
                        />
                    </div>
                </div>
            </section>

            {/* Kategori Section */}
            <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Telusuri Kategori</h2>
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
                    {mockCategories.map((category) => (
                        <a
                            key={category.name}
                            href="#"
                            className={`group flex flex-col items-center justify-center rounded-2xl p-6 shadow-sm transition-all hover:shadow-lg ${category.bgColor} hover:-translate-y-1`}
                        >
                            <div className="rounded-full bg-white p-4 transition-transform group-hover:scale-110">
                                {category.icon}
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-gray-900">{category.name}</h3>
                        </a>
                    ))}
                </div>
            </section>

            {/* Produk Terlaris (Carousel) */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Produk Terlaris</h2>
                        <div className="hidden items-center gap-2 sm:flex">
                            <Button variant="outline" size="icon" onClick={() => scrollCarousel('left')}>
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => scrollCarousel('right')}>
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="relative mt-10">
                    {/* Wrapper untuk padding agar bayangan kartu terlihat di awal/akhir */}
                    <div
                        id="bestseller-carousel"
                        className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                        style={{ paddingLeft: 'calc((100% - 1152px) / 2 + 1.5rem)', paddingRight: '1.5rem' }}
                    >
                        {mockProducts.concat(mockProducts).map((product, index) => ( // Duplikat untuk demo
                            <div key={index} className="w-72 flex-shrink-0 snap-start px-2">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Produk Unggulan (Tabs) */}
            <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Produk Unggulan</h2>

                {/* Kontrol Tabs (Meniru shadcn/Tabs) */}
                <div className="mt-10 flex justify-center">
                    <div className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1">
                        <button
                            onClick={() => setActiveTab('terbaru')}
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${activeTab === 'terbaru'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Produk Terbaru
                        </button>
                        <button
                            onClick={() => setActiveTab('promo')}
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${activeTab === 'promo'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Promo Spesial
                        </button>
                    </div>
                </div>

                {/* Konten Tabs */}
                <div className="mt-10">
                    {/* Grid Produk (Responsif) */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {activeTab === 'terbaru' && (
                            <>
                                {mockProducts.slice(0, 4).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </>
                        )}
                        {activeTab === 'promo' && (
                            <>
                                {mockProducts.slice(4, 8).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-white rounded-lg shadow-lg py-16 lg:py-24">
                <div className="container mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Jangan Lewatkan Info Terbaru
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Daftar newsletter kami dan dapatkan promo spesial langsung ke email Anda.
                    </p>
                    <form className="mt-10 flex flex-col gap-4 sm:flex-row">
                        <Input
                            type="email"
                            placeholder="Masukkan email Anda"
                            className="h-11 flex-1 text-base"
                            aria-label="Email untuk newsletter"
                        />
                        <Button type="submit" size="lg" className='bg-blue-600'>Berlangganan</Button>
                    </form>
                </div>
            </section>
        </MainLayoutPembeli>
    );
}