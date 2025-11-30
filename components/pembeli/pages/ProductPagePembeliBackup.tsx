"use client"

import React, { useState, useEffect } from 'react';
// IMPOR ICON BARU
import { Search, Eye, ShoppingCart, ChevronLeft, ChevronRight, Utensils, Coffee, Cake, Home, Store, CheckCircle, AlertCircle } from 'lucide-react';
import MainLayoutPembeli from "../MainLayoutPembeli";
import Link from 'next/link';
// IMPOR SUPABASE
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Asumsi path untuk gambar pengganti
const NO_IMAGE_PLACEHOLDER = '/images/nothing.png';
const PRODUCTS_PER_PAGE = 10; // Menampilkan 10 produk per halaman

// Types
interface Product {
    id: string;
    nama_produk: string;
    harga: number;
    gambar: string | null;
    jenis_produk: string | null;
    stok: number;
    profile_penjual: {
        store_name: string;
        status: boolean;
    } | null;
}


// Helper untuk format harga ke Rupiah
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// --- Kategori Baru (Dengan Lucide Icons & Warna) ---
const categories = [
    // Ganti 'food' dengan 'makanan' dan 'drinks' dengan 'minuman' (sesuai skema DB)
    { id: 'makanan-berat', name: 'Makanan Berat', icon: Utensils, color: 'bg-red-500' },
    { id: 'makanan-ringan', name: 'Cemilan/Snack', icon: Cake, color: 'bg-yellow-500' },
    { id: 'minuman-kopi', name: 'Minuman Kopi', icon: Coffee, color: 'bg-amber-800' },
    { id: 'minuman-nonkopi', name: 'Minuman Non-Kopi', icon: Coffee, color: 'bg-cyan-500' },
    { id: 'lainnya', name: 'Lainnya', icon: Home, color: 'bg-gray-500' },
];


// FILE: ProductPagePembeli.tsx

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [imageSrc, setImageSrc] = useState(product.gambar || NO_IMAGE_PLACEHOLDER);
    const storeProfile = product.profile_penjual;

    const handleImageError = () => {
        if (imageSrc !== NO_IMAGE_PLACEHOLDER) {
            setImageSrc(NO_IMAGE_PLACEHOLDER);
        }
    };

    // Status FALSE = Good (Rekomendasi)
    const storeName = storeProfile?.store_name || "Toko Tidak Dikenal";
    const isRecommended = storeProfile ? storeProfile.status === false : false;

    return (
        <div className="group min-w-[260px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="relative aspect-square w-full overflow-hidden">
                <img
                    src={imageSrc}
                    alt={product.nama_produk}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* BADGE STATUS TOKO */}
                {storeProfile && (
                    storeProfile.status === true ? (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-20">
                            <CheckCircle className='w-3 h-3' /> Rekomendasi
                        </div>
                    ) : (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-20">
                            <AlertCircle className='w-3 h-3' /> Tidak Direkomendasikan
                        </div>
                    )
                )}
            </div>

            <div className="p-4">
                {/* NAMA TOKO */}
                <div className="flex items-center text-sm text-gray-500 mb-1.5">
                    <Store className="w-3.5 h-3.5 mr-1" />
                    <span className='font-medium truncate'>{storeName}</span>
                </div>

                <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[40px]">
                    {product.nama_produk}
                </h3>
                <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg">{formatRupiah(product.harga || 0)}</span>
                </div>
                {/* Tombol Detail dan Keranjang */}
                <div className="flex items-center justify-between mt-3 gap-2">
                    {/* Tombol Detail (Menggunakan Link) */}
                    <Link
                        href={`/product/${product.id}`}
                        className="flex items-center justify-center flex-1 gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                        <Eye className="w-4 h-4" />
                        Detail
                    </Link>
                    {/* Tombol Add to Cart/Keranjang */}
                    <button
                        onClick={() => alert(`Added ${product.nama_produk} to cart!`)}
                        className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Add to Cart"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ProductPagePembeli() {
    const supabase = createClientComponentClient();

    // State untuk filter, loading, dan data
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [products, setProducts] = useState<Product[]>([]); // Data dari DB
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // --- LOGIKA FETCH DATA DARI SUPABASE ---
    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true);
            setErrorMessage(null);

            // Definisikan Query
            let query = supabase
                // SELECT JOIN: Ambil semua data produk, dan JOIN data store_name & status dari profile_penjual
                .from('produk')
                .select(`
                    id, 
                    nama_produk, 
                    harga, 
                    gambar, 
                    jenis_produk,
                    stok,
                    profile_penjual:penjual_id (store_name, status)
                `);

            // --- FILTER KATEGORI ---
            if (selectedCategory !== 'all') {
                query = query.eq('jenis_produk', selectedCategory);
            }

            // --- FILTER SEARCH ---
            if (searchQuery) {
                query = query.ilike('nama_produk', `%${searchQuery}%`);
            }

            // --- EKSEKUSI QUERY ---
            // Karena kita tidak menghitung total_count di client, kita biarkan Supabase mengambil semua yang difilter.
            // Di produksi, Anda perlu menghitung total count secara terpisah untuk pagination yang akurat.

            try {
                const { data, error } = await query
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Set data
                setProducts((data ?? []) as unknown as Product[]);

            } catch (error) {
                console.error("Error fetching products:", error);
                setErrorMessage("Gagal memuat daftar produk. Silakan coba lagi.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();

    }, [supabase, selectedCategory, searchQuery]);

    // --- LOGIKA PAGINATION (Menggunakan filteredProducts sekarang diubah menjadi state products) ---
    // Karena Supabase sudah melakukan filter, kita hanya perlu melakukan slice untuk pagination
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    // ... (handlePageChange dan Komponen Pagination tetap sama) ...
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Array untuk nomor halaman
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Komponen Pagination
    const Pagination = () => (
        <div className="flex justify-center items-center space-x-2 mt-8">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {pageNumbers.map((number) => (
                <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors text-sm ${number === currentPage
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                        }`}
                >
                    {number}
                </button>
            ))}

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );

    return (
        <MainLayoutPembeli>
            <header className="py-4 md:py-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            E-Commerce RT 12
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Mudah menggunakan paltform untuk jual beli pada RT 12.
                        </p>
                    </div>
                    {/* Ilustrasi Header */}
                    <div className="flex-shrink-0 w-32 md:w-48 h-auto">
                        <img
                            src="/ilustrasi/shopping.png"
                            alt="Ilustrasi Belanja"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = 'https://placehold.co/192x192/f0f9ff/0f172a?text=Ilustrasi&font=sans';
                                target.alt = 'Ilustrasi Gagal Dimuat';
                            }}
                        />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari Produk Berdasarkan Nama..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset ke halaman 1 saat search
                        }}
                        className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                    />
                </div>
            </header>

            <main>
                {/* Categories */}
                <section className="mb-8 md:mb-12">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Kategori</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                        {/* Tombol 'All' */}
                        <button
                            onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                            className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl transition-all duration-200 min-h-[100px] ${selectedCategory === 'all'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white hover:bg-blue-50 text-gray-800 shadow-md hover:shadow-lg border border-gray-200'
                                }`}
                        >
                            <div className="text-3xl md:text-4xl mb-2">🛍️</div>
                            <div className="font-semibold text-sm md:text-base">Semua</div>
                        </button>
                        {/* Tombol Kategori Lain (BARU) */}
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); }}
                                className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl transition-all duration-200 min-h-[100px] 
                                    ${selectedCategory === category.id
                                        ? `${category.color} text-white shadow-lg` // WARNA DARI KATEGORI
                                        : 'bg-white hover:bg-blue-50 text-gray-800 shadow-md hover:shadow-lg border border-gray-200'
                                    }`}
                            >
                                <category.icon className="w-8 h-8 md:w-10 md:h-10 mb-2" />
                                <div className="font-semibold text-sm md:text-base">{category.name}</div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Products */}
                <section>
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Produk</h2>
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                            {products.length} Total Item
                        </span>
                    </div>

                    {errorMessage && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Gagal Memuat Data</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                        <div className="text-center py-16 md:py-20">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                            <p className="text-gray-500 text-lg mt-4">Memuat produk dari toko...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 md:py-20 bg-white rounded-xl shadow-lg">
                            <div className="text-6xl md:text-7xl mb-4">🔍</div>
                            <p className="text-gray-500 text-lg">Tidak ada produk ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            {/* GRID PRODUK */}
                            <div
                                className="
                                grid 
                                grid-cols-1 
                                sm:grid-cols-2 
                                md:grid-cols-2 
                                lg:grid-cols-3 
                                xl:grid-cols-4 
                                gap-4 
                                md:gap-6 
                                xl:gap-8
                            "
                            >
                                {currentProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>

                            {/* Tampilkan Pagination jika total halaman > 1 */}
                            {totalPages > 1 && <Pagination />}
                        </>
                    )}
                </section>
            </main>
        </MainLayoutPembeli>
    );
}