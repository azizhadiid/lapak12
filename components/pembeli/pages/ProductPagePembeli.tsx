"use client"

import React, { useState, useEffect, useCallback } from 'react';
// Tambahkan Loader2 untuk indikator loading
import { Search, Eye, ShoppingCart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import MainLayoutPembeli from "../MainLayoutPembeli";
import Link from 'next/link';
// Import Supabase Client dari lib/db
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
const supabase = createClientComponentClient();


// Asumsi path untuk gambar pengganti
const NO_IMAGE_PLACEHOLDER = '/images/nothing.png';
const PRODUCTS_PER_PAGE = 10; // Menampilkan 10 produk per halaman

// --- Tipe Data Baru untuk JOIN Supabase ---
interface ProfilePenjual {
    id: string;
    store_name: string | null;
}

// Tipe Product yang Diperbarui (Menggunakan struktur hasil JOIN)
interface Product {
    id: string;
    nama_produk: string;
    harga: string;
    gambar: string | null;
    jenis_product: string | null;
    profile_penjual: {
        id: string;
        store_name: string | null;
    } | null;
}


// Mock Categories (Tetap statis)
const categories = [
    { id: 'food', name: 'Food', icon: '🛒' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'snack', name: 'Snack', icon: '🍪' },
    { id: 'household', name: 'Household', icon: '🧴' },
];
// ----------------------------------------------------

// --- Komponen Card Produk yang Diperbarui ---
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [imageSrc, setImageSrc] = useState(product.gambar || NO_IMAGE_PLACEHOLDER);

    const handleImageError = () => {
        if (imageSrc !== NO_IMAGE_PLACEHOLDER) {
            setImageSrc(NO_IMAGE_PLACEHOLDER);
        }
    };

    // Fungsi format harga: Mengubah string harga menjadi format Rupiah
    const formatPrice = (priceStr: string) => {
        const price = parseFloat(priceStr);
        if (isNaN(price)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100">
            {/* Bagian Gambar */}
            <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
                <img
                    src={imageSrc}
                    alt={product.nama_produk}
                    className="object-contain w-full h-full max-w-[80%] max-h-[80%] transform group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                    style={{
                        objectFit: imageSrc === NO_IMAGE_PLACEHOLDER ? 'contain' : 'contain',
                        fontSize: imageSrc === NO_IMAGE_PLACEHOLDER ? '3rem' : 'initial'
                    }}
                />
            </div>

            <div className="p-4">
                {/* Tampilkan Nama Toko dari hasil JOIN */}
                <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                    Toko: <span className="font-medium text-gray-700">
                        {product.profile_penjual?.store_name
                            || 'Toko tidak terdaftar'}
                    </span>
                </p>

                <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[40px]">
                    {product.nama_produk}
                </h3>

                <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg">
                        {formatPrice(product.harga)}
                    </span>
                </div>

                {/* Tombol Detail dan Keranjang */}
                <div className="flex items-center justify-between mt-3 gap-2">
                    <Link
                        // Menggunakan product.id (string UUID) untuk rute dinamis
                        href={`/product/${product.id}`}
                        className="flex items-center justify-center flex-1 gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                        <Eye className="w-4 h-4" />
                        Detail
                    </Link>
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
// ----------------------------------------------------


export default function ProductPagePembeli() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // --- State Baru untuk Data dari Supabase ---
    const [productsData, setProductsData] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // -------------------------------------------

    // Fungsi Fetch Data dari Supabase
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Query Supabase dengan SELECT untuk JOIN
            // user_id!inner(id, store_name) akan JOIN products.user_id ke profile_penjual.id 
            let query = supabase
                .from('products')
                .select(`
                    id,
                    nama_produk,
                    harga,
                    gambar,
                    jenis_product,
                    profile_penjual!inner (
                        id,
                        store_name
                    )
                `)
                .order('created_at', { ascending: false });


            // 2. Terapkan Filter Pencarian
            if (searchQuery) {
                query = query.ilike('nama_produk', `%${searchQuery}%`);
            }

            // 3. Terapkan Filter Kategori
            if (selectedCategory !== 'all') {
                query = query.eq('jenis_product', selectedCategory);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Supabase Fetch Error:", error);
                throw new Error(error.message || 'Gagal mengambil data produk dari server.');
            }

            setProductsData(data as Product[]);

        } catch (err) {
            setError((err as Error).message);
            setProductsData([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    // Panggil fungsi fetch saat komponen mount atau dependencies (filter/search) berubah
    useEffect(() => {
        fetchProducts();
        // Reset halaman ke 1 setiap kali filter/search berubah
        setCurrentPage(1);
    }, [fetchProducts]);

    // --- Logika Pagination (Menggunakan productsData) ---
    const filteredProducts = productsData;

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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
                            E-Commerce for RT 12
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Easy-to-use platform to sell and buy products from warung
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
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                    />
                </div>
            </header>

            <main>
                {/* Categories */}
                <section className="mb-8 md:mb-12">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                        {/* Tombol 'All' */}
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl transition-all duration-200 min-h-[100px] ${selectedCategory === 'all'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white hover:bg-blue-50 text-gray-800 shadow-md hover:shadow-lg border border-gray-200'
                                }`}
                        >
                            <div className="text-3xl md:text-4xl mb-2">🛍️</div>
                            <div className="font-semibold text-sm md:text-base">All</div>
                        </button>
                        {/* Tombol Kategori Lain */}
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl transition-all duration-200 min-h-[100px] ${selectedCategory === category.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white hover:bg-blue-50 text-gray-800 shadow-md hover:shadow-lg border border-gray-200'
                                    }`}
                            >
                                <div className="text-3xl md:text-4xl mb-2">{category.icon}</div>
                                <div className="font-semibold text-sm md:text-base">{category.name}</div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Products */}
                <section>
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Products</h2>
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                            {filteredProducts.length} items total
                        </span>
                    </div>

                    {/* Tampilkan Loading */}
                    {isLoading && (
                        <div className="text-center py-16 md:py-20 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-blue-600 text-lg">Loading products...</p>
                        </div>
                    )}

                    {/* Tampilkan Error */}
                    {error && !isLoading && (
                        <div className="text-center py-16 md:py-20 bg-red-50 rounded-xl shadow-lg">
                            <div className="text-6xl md:text-7xl mb-4">⚠️</div>
                            <p className="text-red-600 text-lg font-medium">Error Fetching Data:</p>
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        </div>
                    )}

                    {/* Tampilkan Data */}
                    {!isLoading && !error && filteredProducts.length === 0 ? (
                        <div className="text-center py-16 md:py-20 bg-white rounded-xl shadow-lg">
                            <div className="text-6xl md:text-7xl mb-4">🔍</div>
                            <p className="text-gray-500 text-lg">No products found</p>
                        </div>
                    ) : (
                        !isLoading && !error && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
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
                        )
                    )}
                </section>
            </main>
        </MainLayoutPembeli>
    );
}