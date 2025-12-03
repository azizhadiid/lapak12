"use client"

import React, { useState, useEffect } from 'react';
// IMPOR ICON BARU
import { Search, Eye, ShoppingCart, ChevronLeft, ChevronRight, Utensils, Coffee, Cake, Home, Store, CheckCircle, AlertCircle, ShoppingBasket } from 'lucide-react';
import MainLayoutPembeli from "../MainLayoutPembeli";
import Link from 'next/link';
// IMPOR SUPABASE
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { useAuth } from '@/hooks/useAuth'; // Asumsi Anda memiliki hook untuk user/session

// Asumsi path untuk gambar pengganti
const NO_IMAGE_PLACEHOLDER = '/images/nothing.png';
const PRODUCTS_PER_PAGE = 10; // Menampilkan 10 produk per halaman

// Types
interface Product {
    id: string;
    penjual_id: string; // Tambahkan penjual_id untuk validasi toko
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
    // ... (Kategori Anda tetap sama)
    { id: 'makanan-berat', name: 'Makanan Berat', icon: Utensils, color: 'bg-red-500' },
    { id: 'makanan-ringan', name: 'Cemilan/Snack', icon: Cake, color: 'bg-yellow-500' },
    { id: 'minuman-kopi', name: 'Minuman Kopi', icon: Coffee, color: 'bg-amber-800' },
    { id: 'minuman-nonkopi', name: 'Minuman Non-Kopi', icon: Coffee, color: 'bg-cyan-500' },
    { id: 'lainnya', name: 'Lainnya', icon: Home, color: 'bg-gray-500' },
];


// Komponen ProductCard (Menerima handler sebagai props)
const ProductCard: React.FC<{ product: Product, onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => {
    const [imageSrc, setImageSrc] = useState(product.gambar || NO_IMAGE_PLACEHOLDER);
    const storeProfile = product.profile_penjual;

    const handleImageError = () => {
        if (imageSrc !== NO_IMAGE_PLACEHOLDER) {
            setImageSrc(NO_IMAGE_PLACEHOLDER);
        }
    };

    const storeName = storeProfile?.store_name || "Toko Tidak Dikenal";

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
                        onClick={() => onAddToCart(product)} // Panggil handler dari parent
                        className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Tambah ke Keranjang"
                        disabled={product.stok === 0}
                    >
                        {product.stok === 0 ? <AlertCircle className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
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
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State Notifikasi
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    // Helper untuk menampilkan notifikasi dan menghilangkannya
    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
    };


    // --- LOGIKA ADD TO CART (UTAMA) ---
    const handleAddToCart = async (product: Product) => {
        setNotification({ type: null, message: '' }); // Reset notifikasi

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            showNotification('error', 'Anda harus login untuk menambahkan produk ke keranjang.');
            return;
        }

        if (product.stok === 0) {
            showNotification('error', 'Stok produk ini sudah habis.');
            return;
        }

        const user_id = user.id;
        const produk_id = product.id;
        const jumlah_produk_dipilih = 1; // Default menambah 1 unit
        const total_harga_item = product.harga * jumlah_produk_dipilih;
        const new_store_name = product.profile_penjual?.store_name || "Toko Tidak Dikenal";
        const new_penjual_id = (product as any).penjual_id; // Ambil penjual_id (sudah ada di Product interface tapi Supabase-select perlu dijamin)


        // =========================================================================
        // 1. VALIDASI TOKO BERBEDA (BUSINESS LOGIC)
        // =========================================================================

        // Ambil ID Penjual (toko) dari semua item yang sudah ada di keranjang user
        const { data: cartItems, error: cartError } = await supabase
            .from('keranjang')
            .select(`
                produk_id,
                produk:produk_id (penjual_id, profile_penjual (store_name))
            `)
            .eq('user_id', user_id);

        if (cartError) {
            console.error("Error fetching cart items:", cartError);
            showNotification('error', 'Gagal memuat keranjang untuk validasi.');
            return;
        }

        if (cartItems && cartItems.length > 0) {
            // Ambil ID Penjual pertama yang ada di keranjang
            const firstCartItem = cartItems[0];
            const existing_penjual_id = (firstCartItem.produk as any).penjual_id;
            const existing_store_name = ((firstCartItem.produk as any).profile_penjual as any)?.store_name;

            // Cek apakah produk baru berasal dari toko yang berbeda
            if (existing_penjual_id && existing_penjual_id !== new_penjual_id) {
                showNotification('error', `Produk harus dari toko yang sama. Keranjang Anda sudah berisi produk dari toko ${existing_store_name}.`);
                return;
            }
        }

        // =========================================================================
        // 2. INSERT atau UPDATE (UPSERT)
        // =========================================================================

        // Cek apakah produk sudah ada di keranjang
        const existingItem = cartItems?.find(item => item.produk_id === produk_id);
        let new_quantity = jumlah_produk_dipilih;

        if (existingItem) {
            // Jika produk sudah ada, kita harus mengambil jumlah lama untuk diupdate.
            const { data: currentItem, error: fetchError } = await supabase
                .from('keranjang')
                .select('jumlah_produk_dipilih')
                .eq('user_id', user_id)
                .eq('produk_id', produk_id)
                .single();

            if (fetchError || !currentItem) {
                // Handle error saat fetch jumlah produk yang sudah ada
                console.error("Error fetching existing item quantity:", fetchError);
                showNotification('error', 'Gagal memverifikasi item di keranjang.');
                return;
            }

            new_quantity = currentItem.jumlah_produk_dipilih + jumlah_produk_dipilih;

            // Cek Stok lagi setelah penambahan
            if (new_quantity > product.stok) {
                showNotification('error', `Gagal: Stok hanya tersisa ${product.stok}. Anda sudah memilih ${currentItem.jumlah_produk_dipilih}.`);
                return;
            }

            // Lakukan UPDATE
            const { error: updateError } = await supabase
                .from('keranjang')
                .update({
                    jumlah_produk_dipilih: new_quantity,
                    total: product.harga * new_quantity, // Hitung ulang total
                })
                .eq('user_id', user_id)
                .eq('produk_id', produk_id);

            if (updateError) {
                console.error("Error updating cart item:", updateError);
                showNotification('error', `Gagal mengupdate keranjang: ${updateError.message}`);
                return;
            }

            showNotification('success', `Jumlah ${product.nama_produk} di keranjang berhasil ditambahkan menjadi ${new_quantity}!`);

        } else {
            // Jika produk belum ada, lakukan INSERT
            const { error: insertError } = await supabase
                .from('keranjang')
                .insert({
                    user_id: user_id,
                    produk_id: produk_id,
                    jumlah_produk_dipilih: new_quantity,
                    total: total_harga_item,
                });

            if (insertError) {
                console.error("Error inserting cart item:", insertError);
                showNotification('error', `Gagal menambahkan produk ke keranjang: ${insertError.message}`);
                return;
            }

            showNotification('success', `Produk ${product.nama_produk} berhasil ditambahkan ke keranjang! Toko: ${new_store_name}`);
        }
    };


    // --- LOGIKA FETCH DATA DARI SUPABASE --- 
    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true);
            setErrorMessage(null);

            let query = supabase
                .from('produk')
                .select(`
                    id, 
                    nama_produk, 
                    harga, 
                    gambar, 
                    jenis_produk,
                    stok,
                    penjual_id,  
                    profile_penjual:penjual_id (store_name, status)
                `);

            if (selectedCategory !== 'all') {
                query = query.eq('jenis_produk', selectedCategory);
            }

            if (searchQuery) {
                query = query.ilike('nama_produk', `%${searchQuery}%`);
            }

            try {
                const { data, error } = await query
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Map data untuk memastikan harga, stok, dan relasi adalah tipe yang benar
                const mappedData: Product[] = (data ?? []).map(p => {
                    // Pastikan profile_penjual diolah dari hasil join array/objek menjadi objek tunggal.
                    const rawProfile = Array.isArray(p.profile_penjual)
                        ? p.profile_penjual[0]
                        : p.profile_penjual;

                    return {
                        id: p.id as string,
                        nama_produk: p.nama_produk as string,
                        harga: parseFloat(p.harga as string),
                        gambar: p.gambar as string | null,
                        jenis_produk: p.jenis_produk as string | null,
                        stok: p.stok ?? 0,
                        penjual_id: p.penjual_id as string,
                        // Olah profile_penjual agar sesuai dengan interface Product
                        profile_penjual: rawProfile ? {
                            store_name: rawProfile.store_name as string,
                            status: rawProfile.status as boolean,
                        } : null,
                    };
                });

                setProducts(mappedData);

            } catch (error) {
                console.error("Error fetching products:", error);
                setErrorMessage("Gagal memuat daftar produk. Silakan coba lagi.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();

    }, [supabase, selectedCategory, searchQuery]);

    // --- LOGIKA PAGINATION --- (tetap sama)
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

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
                {/* ... (Konten Header dan Search Bar) ... */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            E-Commerce RT 12
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Mudah menggunakan paltform untuk jual beli pada RT 12.
                        </p>
                    </div>
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
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari Produk Berdasarkan Nama..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                    />
                </div>
            </header>

            <main>
                {/* Kategori */}
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
                        {/* Tombol Kategori Lain */}
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); }}
                                className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl transition-all duration-200 min-h-[100px] 
                                    ${selectedCategory === category.id
                                        ? `${category.color} text-white shadow-lg`
                                        : 'bg-white hover:bg-blue-50 text-gray-800 shadow-md hover:shadow-lg border border-gray-200'
                                    }`}
                            >
                                <category.icon className="w-8 h-8 md:w-10 md:h-10 mb-2" />
                                <div className="font-semibold text-sm md:text-base">{category.name}</div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Notifikasi / Alert */}
                {notification.type && (
                    <Alert
                        variant={notification.type === 'error' ? 'destructive' : 'default'}
                        className={`mb-4 ${notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-300' : ''}`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>{notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}</AlertTitle>
                        <AlertDescription>{notification.message}</AlertDescription>
                    </Alert>
                )}

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
                                        onAddToCart={handleAddToCart} // Pass handler
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