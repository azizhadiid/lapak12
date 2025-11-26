"use client"

import React, { useState } from 'react';
import { Search, Eye, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayoutPembeli from "../MainLayoutPembeli";
import Link from 'next/link';

// Asumsi path untuk gambar pengganti
const NO_IMAGE_PLACEHOLDER = '/images/nothing.png';
const PRODUCTS_PER_PAGE = 10; // Menampilkan 10 produk per halaman

// Types
interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
    category: string;
}

// Mock Data - Menggunakan path gambar dummy (misalnya: /images/keju.png)
const categories = [
    { id: 'food', name: 'Food', icon: '🛒' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'snack', name: 'Snack', icon: '🍪' },
    { id: 'household', name: 'Household', icon: '🧴' },
];

const products: Product[] = [
    { id: 1, name: 'Cheetos Puffs', price: 'Rp 5K', image: '/images/keju.png', category: 'snack' },
    { id: 2, name: 'Teh Gelas', price: 'Rp 1.5K', image: '/images/teh.png', category: 'drinks' },
    { id: 3, name: 'Makaroni', price: 'Rp 6K', image: '/images/makaroni.png', category: 'food' },
    { id: 4, name: 'Head & Shoulders', price: 'Rp 7K', image: '/images/shampoo.png', category: 'household' },
    { id: 5, name: 'Bimoli 1L', price: 'Rp 10K', image: '', category: 'food' },
    { id: 6, name: 'Indomie Mi Goreng', price: 'Rp 3.5K', image: '/images/indomie.png', category: 'food' },
    { id: 7, name: 'Milo', price: 'Rp 6.5K', image: '/images/milo.png', category: 'drinks' },
    { id: 8, name: 'Indomie Soto Mie', price: 'Rp 3.5K', image: '/images/indomie.png', category: 'food' },
    { id: 9, name: 'Indomie Kari Ayam', price: 'Rp 3.5K', image: '/images/indomie.png', category: 'food' },
    { id: 10, name: 'Indomie Rendang', price: 'Rp 3.5K', image: '/images/indomie.png', category: 'food' },
    { id: 11, name: 'Indomie Mi Goreng Pedas', price: 'Rp 3.5K', image: '/images/indomie.png', category: 'food' },
    { id: 12, name: 'Indomie Mi Goreng Hype Abis', price: 'Rp 3.5K', image: '/images/indomie.png', category: 'food' },
    { id: 13, name: 'Kecap Sedaap 700 gram', price: 'Rp 21K', image: '/images/kecap.png', category: 'food' },
    { id: 14, name: 'Kecap Sedaap 275 ml', price: 'Rp 5K', image: '/images/kecap.png', category: 'food' },
    { id: 15, name: 'Desaku bubuk opor', price: 'Rp 1.5K', image: '/images/bumbu.png', category: 'food' },
    { id: 16, name: 'Desaku kunyit bubuk', price: 'Rp 1.5K', image: '/images/bumbu.png', category: 'food' },
    { id: 17, name: 'Desaku ketumbar bubuk', price: 'Rp 1.5K', image: '/images/bumbu.png', category: 'food' },
    { id: 18, name: 'Ladaku Merica Bubuk', price: 'Rp 1.5K', image: '/images/bumbu.png', category: 'food' },
    { id: 19, name: 'Garam Kasar', price: 'Rp 10K', image: '/images/garam.png', category: 'food' },
    { id: 20, name: 'Beras SPH 5kg', price: 'Rp 75K', image: '/images/beras.png', category: 'food' },
    { id: 21, name: 'Sarden ABC 155 gram', price: 'Rp 20K', image: '/images/sarden.png', category: 'food' },
    { id: 22, name: 'Frisian Flag Susu Kental Manis 260g', price: 'Rp 10K', image: '/images/susu.png', category: 'drinks' },
    { id: 23, name: 'Nescafe Classic Cappuccino', price: 'Rp 3.5K', image: '/images/kopi.png', category: 'drinks' },
    { id: 24, name: 'Gulaku Gula Pasir Brand 1kg', price: 'Rp 20K', image: '/images/gula.png', category: 'food' },
    { id: 25, name: 'Wafer Coklat 10pcs', price: 'Rp 10K', image: '/images/wafer.png', category: 'snack' },
];


const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [imageSrc, setImageSrc] = useState(product.image || NO_IMAGE_PLACEHOLDER);

    const handleImageError = () => {
        if (imageSrc !== NO_IMAGE_PLACEHOLDER) {
            setImageSrc(NO_IMAGE_PLACEHOLDER);
        }
    };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="object-contain w-full h-full max-w-[80%] max-h-[80%] transform group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                    style={{
                        objectFit: imageSrc === NO_IMAGE_PLACEHOLDER ? 'contain' : 'contain',
                        fontSize: imageSrc === NO_IMAGE_PLACEHOLDER ? '3rem' : 'initial'
                    }}
                />

                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    New
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[40px]">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg">{product.price}</span>
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
                        onClick={() => alert(`Added ${product.name} to cart!`)}
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
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    // State untuk Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // 1. Filter Produk berdasarkan kategori dan pencarian
    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // 2. Hitung jumlah halaman
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    // 3. Hitung produk yang akan ditampilkan pada halaman saat ini
    const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // 4. Fungsi untuk ganti halaman
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            // Opsional: scroll ke atas halaman saat ganti halaman
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // 5. Array untuk nomor halaman
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
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                        {/* Tombol 'All' */}
                        <button
                            onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }} // Reset ke halaman 1
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
                                onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); }} // Reset ke halaman 1
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

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-16 md:py-20 bg-white rounded-xl shadow-lg">
                            <div className="text-6xl md:text-7xl mb-4">🔍</div>
                            <p className="text-gray-500 text-lg">No products found</p>
                        </div>
                    ) : (
                        <>
                            {/* PENYESUAIAN GRID DENGAN 1 KOLOM DI MOBILE */}
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
                    )}
                </section>
            </main>
        </MainLayoutPembeli>
    );
}