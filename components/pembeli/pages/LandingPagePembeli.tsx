'use client'

import React, { useEffect, useRef } from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';
import {
    ShoppingCart,
    Store,
    Eye,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Utensils, // Mengganti FaBurger
    Cookie,
    Laptop,
    Dumbbell,
    Coffee,
    Ellipsis, // Mengganti FaEllipsisH
} from 'lucide-react';
import MainLayoutLanding from '../layout/MainLayoutLanding';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Product {
    id: string | number;
    name: string;
    price: number;
    imageUrl: string;
    storeName: string;
    isRecommended?: boolean;
    tag?: string;
}


// --- 1. UTILITY FUNCTIONS ---

/**
 * Mengubah angka menjadi format mata uang Rupiah (contoh: 6000 -> Rp. 6.000)
 * @param {number} amount
 * @returns {string}
 */
const formatRupiah = (amount: any) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp. ');
};

// --- 2. MOCK DATA ---

// Menggunakan satu set data produk yang lengkap untuk semua bagian
const mockProducts = [
    {
        id: 1,
        name: 'Es Kopi Susu Segar Dengan Biji Pilihan Terbaik Dari Petani Lokal',
        price: 18000,
        storeName: 'Kopi Kenangan Mantan',
        isRecommended: true,
        imageUrl: 'https://placehold.co/400x400/38bdf8/ffffff?text=Kopi+Susu',
        tag: 'Rekomendasi',
    },
    {
        id: 2,
        name: 'Mie Ayam Jumbo Original',
        price: 15000,
        storeName: 'Warung Mie Legendaris',
        isRecommended: false,
        imageUrl: 'https://placehold.co/400x400/ef4444/ffffff?text=Mie+Ayam',
        tag: 'Tidak Direkomendasikan',
    },
    {
        id: 3,
        name: 'Powerbank 10000 mAh Fast Charge dan Dual Output USB-C',
        price: 245000,
        storeName: 'Toko Elektronik Cepat',
        isRecommended: true,
        imageUrl: 'https://placehold.co/400x400/8b5cf6/ffffff?text=Powerbank',
        tag: 'Rekomendasi',
    },
    {
        id: 4,
        name: 'Bola Kaki Premium Size 5',
        price: 89000,
        storeName: 'Sport Jaya',
        isRecommended: true,
        imageUrl: 'https://placehold.co/400x400/22c55e/ffffff?text=Bola+Kaki',
        tag: 'Tidak Direkomendasikan',
    },
    {
        id: 5,
        name: 'Cemilan Keripik Kentang Original Rasa Pedas Manis',
        price: 12500,
        storeName: 'Snack Seru',
        isRecommended: false,
        imageUrl: 'https://placehold.co/400x400/f97316/ffffff?text=Keripik',
        tag: 'Rekomendasi',
    },
    {
        id: 6,
        name: 'Teh Tarik Hangat',
        price: 9500,
        storeName: 'Kedai Mamak',
        isRecommended: true,
        imageUrl: 'https://placehold.co/400x400/f87171/ffffff?text=Teh+Tarik',
        tag: 'Tidak Direkomendasikan',
    },
    {
        id: 7,
        name: 'Sampo Anti Ketombe',
        price: 21000,
        storeName: 'Toko Sehat',
        isRecommended: true,
        imageUrl: 'https://placehold.co/400x400/2563EB/FFFFFF?text=Shampoo',
        tag: 'Rekomendasi',
    },
    {
        id: 8,
        name: 'Minyak Goreng 2L Pouch',
        price: 35000,
        storeName: 'Sembako Murah',
        isRecommended: false,
        imageUrl: 'https://placehold.co/400x400/F59E0B/FFFFFF?text=Minyak',
        tag: 'Tidak Direkomendasikan',
    },
];

const mockCategories = [
    {
        name: 'Makanan',
        icon: Utensils, // Mengganti FaBurger
        href: '/product',
        bgColor: 'bg-yellow-500/10 text-yellow-800',
        iconBg: 'bg-yellow-500',
        hoverRing: 'ring-yellow-500',
    },
    {
        name: 'Minuman',
        icon: Coffee,
        href: '/product',
        bgColor: 'bg-blue-500/10 text-blue-800',
        iconBg: 'bg-blue-500',
        hoverRing: 'ring-indigo-500',
    },
    {
        name: 'Cemilan',
        icon: Cookie,
        href: '/product',
        bgColor: 'bg-green-500/10 text-green-800',
        iconBg: 'bg-green-500',
        hoverRing: 'ring-green-500',
    },
    {
        name: 'Teknologi',
        icon: Laptop,
        href: '/product',
        bgColor: 'bg-indigo-500/10 text-indigo-800',
        iconBg: 'bg-indigo-500',
        hoverRing: 'ring-indigo-500',
    },
    {
        name: 'Olahraga',
        icon: Dumbbell,
        href: '/product',
        bgColor: 'bg-red-500/10 text-red-800',
        iconBg: 'bg-red-500',
        hoverRing: 'ring-red-500',
    },
    {
        name: 'Lainnya',
        icon: Ellipsis,
        href: '/product',
        bgColor: 'bg-gray-500/10 text-gray-800',
        iconBg: 'bg-gray-500',
        hoverRing: 'ring-gray-500',
    },
];

// --- 3. PRODUCT CARD COMPONENT ---

const ProductCard = ({ product }: { product: Product }) => {
    // Komponen untuk badge Rekomendasi
    const RecommendationBadge = ({ isRecommended }: { isRecommended: boolean }) => (
        <span
            className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-md 
        ${isRecommended
                    ? 'bg-green-600 text-white' // Lebih mencolok
                    : 'bg-red-600 text-white' // Lebih mencolok
                }`
            }
        >
            {isRecommended ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {product.tag || 'Produk'}
        </span>
    );

    // Mengganti alert() dengan console.log() untuk kepatuhan aturan
    const handleDetailClick = () => console.log(`Membuka detail produk: ${product.name}`);
    const handleCartClick = () => console.log(`Menambahkan ${product.name} ke keranjang!`);

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-indigo-500"
        >
            {/* Badge Rekomendasi/Tag */}
            <RecommendationBadge isRecommended={!!product.isRecommended} />

            {/* Gambar Produk */}
            <div className="aspect-square w-full overflow-hidden">
                <img
                    src={product.imageUrl}
                    alt={`Gambar ${product.name}`}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src =
                            'https://placehold.co/400x400/60a5fa/ffffff?text=Produk';
                    }}
                />
            </div>

            {/* Detail Produk & Aksi */}
            <div className="flex flex-1 flex-col justify-between p-5">

                {/* Detail Dasar - DIBERI TINGGI MINIMUM AGAR KONSISTEN */}
                {/* Tinggi disesuaikan untuk menampung dua baris teks produk dan satu baris nama toko */}
                <div className="min-h-[5.5rem]">
                    {/* Nama Toko */}
                    <div className="mb-2 flex items-center text-sm font-medium text-gray-500">
                        <Store className="mr-1.5 h-4 w-4 text-indigo-500" />
                        {product.storeName}
                    </div>
                    {/* Nama Produk */}
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                        {product.name}
                    </h3>
                </div>

                {/* Harga dan Tombol Aksi */}
                <div className="mt-4">
                    <p className="text-3xl font-extrabold text-indigo-700">
                        {formatRupiah(product.price)}
                    </p>

                    <div className="mt-4 flex gap-2">
                        {/* Tombol Detail (Mengganti komponen Button) */}
                        <button
                            onClick={handleDetailClick}
                            className="flex-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <Eye className="inline h-4 w-4 mr-2" /> Detail
                        </button>

                        {/* Tombol Keranjang (Mengganti komponen Button) */}
                        <button
                            onClick={handleCartClick}
                            className="flex-shrink-0 rounded-xl bg-indigo-600 p-3 text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LandingPagePembeli = () => {
    const carouselRef = useRef<HTMLDivElement | null>(null); // ✅ aman

    // Mengganti AOS.init() yang tidak tersedia
    useEffect(() => {
        // Efek kosmetik: animasi sederhana pada load (tidak menggunakan AOS)
        console.log("Aplikasi Landing Page Pembeli dimuat.");
    }, []);

    // Scroll function for carousel
    const scrollCarousel = (direction: any) => {
        if (carouselRef.current) {
            const scrollAmount = 320; // Disesuaikan sedikit
            if (direction === 'left') {
                carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    // Duplikat produk untuk membuat efek carousel lebih panjang
    const carouselProducts = [...mockProducts, ...mockProducts, ...mockProducts];

    // Filter produk untuk Tabs
    const latestProducts = mockProducts.filter(p => p.tag === 'Rekomendasi').slice(0, 4);

    useEffect(() => {
        AOS.init({ duration: 900, once: true });
    }, []);

    return (
        <MainLayoutLanding>
            <main>
                {/* Hero Section */}
                <section className="bg-white w-full">
                    <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-24">

                        {/* LEFT TEXT CONTENT */}
                        <div
                            className="flex flex-col justify-center"
                            data-aos="fade-right"
                        >
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
                                    <Link href="/product">Mulai Belanja</Link>
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

                        {/* RIGHT IMAGE */}
                        <div
                            className="hidden items-center justify-center md:flex"
                            data-aos="fade-left"
                        >
                            <img
                                src="/ilustrasi/shope.png"
                                alt="Ilustrasi Warung Modern"
                                className="rounded-3xl shadow-xl float-animation"
                            />
                        </div>

                    </div>
                </section>


                {/* Kategori Section */}
                <section id="kategori" className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl text-center">
                        Telusuri Kategori
                    </h2>

                    <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 md:gap-6">
                        {mockCategories.map((category) => (
                            <a
                                key={category.name}
                                href={category.href}
                                className={`
                                group flex flex-col items-center justify-center p-6 sm:p-8 
                                rounded-3xl ${category.bgColor} 
                                shadow-xl ring-1 ring-gray-900/5 
                                transition-all duration-300 ease-in-out 
                                hover:shadow-2xl hover:-translate-y-2 hover:ring-4 ${category.hoverRing} 
                                cursor-pointer
                                `}
                            >
                                <div className={`
                                rounded-2xl p-4 
                                ${category.iconBg} text-white 
                                transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg
                                `}>
                                    <category.icon className="h-8 w-8" />
                                </div>

                                <h3 className="mt-6 text-lg font-bold text-gray-900 text-center">
                                    {category.name}
                                </h3>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Produk Carousel Section */}
                <section id="produk" className="py-16 lg:py-24 bg-gray-50 font-sans">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                                Produk Saat Ini
                            </h2>

                            {/* Kontrol Carousel di Desktop */}
                            <div className="hidden items-center gap-3 sm:flex">
                                <button
                                    onClick={() => scrollCarousel('left')}
                                    className="p-3 rounded-full bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Scroll Kiri"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => scrollCarousel('right')}
                                    className="p-3 rounded-full bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Scroll Kanan"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-10">
                        {/* Karusel Produk */}
                        <div
                            ref={carouselRef}
                            id="product-carousel"
                            className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                            // Padding diatur agar kartu pertama dan terakhir sejajar dengan konten di atasnya
                            style={{ paddingLeft: 'calc((100% - min(1152px, 100% - 2rem)) / 2 + 1.5rem)', paddingRight: '1.5rem' }}
                        >
                            {carouselProducts.map((product, index) => (
                                <div key={index} className="w-[300px] flex-shrink-0 snap-start pr-4 pb-4">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                            {/* Marker untuk padding terakhir */}
                            <div className="w-0 flex-shrink-0" style={{ minWidth: '1.5rem' }}></div>
                        </div>

                        {/* Kontrol Carousel di Mobile (opsional, sebagai indikasi) */}
                        <div className="sm:hidden mt-4 text-center text-sm text-gray-500">
                            Geser ke samping untuk melihat lebih banyak produk.
                        </div>
                    </div>

                </section>

                {/* Produk Unggulan (Tabs) */}
                <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Produk Unggulan
                    </h2>

                    <div className="mt-10">
                        {/* Grid Produk (Responsif) */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {latestProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}

                            {/* Jika ingin gabungkan tidakdirekomen juga tinggal aktifkan: */}
                            {/* 
            {tidakdirekomenProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            */}
                        </div>

                        <div className="mt-12 text-center">
                            <a
                                href="/product"
                                className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-6 py-3 text-base font-semibold text-gray-700 shadow-md transition-colors hover:bg-gray-200"
                            >
                                Lihat Semua Produk
                            </a>
                        </div>
                    </div>
                </section>

            </main>
        </MainLayoutLanding>
    );
}

export default LandingPagePembeli;