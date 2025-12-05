'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
    ShoppingCart,
    Store,
    Eye,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Utensils,
    Cookie,
    Laptop,
    Dumbbell,
    Coffee,
    Ellipsis,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MainLayoutLanding from '../layout/MainLayoutLanding';
// Import MainLayoutPembeli diasumsikan tersedia di root/layouts

// Asumsi path untuk gambar pengganti
const NO_IMAGE_PLACEHOLDER = 'https://placehold.co/400x400/60a5fa/ffffff?text=Produk';

// --- Types ---
interface Product {
    id: string;
    penjual_id: string; // Diperlukan untuk validasi keranjang
    nama_produk: string;
    harga: number;
    gambar: string | null;
    stok: number;
    jenis_produk: string | null;
    profile_penjual: {
        store_name: string;
        status: boolean; // TRUE: Rekomendasi, FALSE: Non-Rekomendasi
    } | null;
}

// --- 1. UTILITY FUNCTIONS ---

const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp. ');
};

// --- 2. KATEGORI (Data Mock) ---

const categories = [
    { id: 'makanan', name: 'Makanan', icon: Utensils, href: '/product?category=makanan', bgColor: 'bg-yellow-500/10 text-yellow-800', iconBg: 'bg-yellow-500', hoverRing: 'ring-yellow-500', },
    { id: 'minuman', name: 'Minuman', icon: Coffee, href: '/product?category=minuman', bgColor: 'bg-blue-500/10 text-blue-800', iconBg: 'bg-blue-500', hoverRing: 'ring-indigo-500', },
    { id: 'cemilan', name: 'Cemilan', icon: Cookie, href: '/product?category=cemilan', bgColor: 'bg-green-500/10 text-green-800', iconBg: 'bg-green-500', hoverRing: 'ring-green-500', },
    { id: 'teknologi', name: 'Elektronik', icon: Laptop, href: '/product?category=teknologi', bgColor: 'bg-indigo-500/10 text-indigo-800', iconBg: 'bg-indigo-500', hoverRing: 'ring-indigo-500', },
    { id: 'olahraga', name: 'Olahraga', icon: Dumbbell, href: '/product?category=olahraga', bgColor: 'bg-red-500/10 text-red-800', iconBg: 'bg-red-500', hoverRing: 'ring-red-500', },
    { id: 'lainnya', name: 'Lainnya', icon: Ellipsis, href: '/product?category=lainnya', bgColor: 'bg-gray-500/10 text-gray-800', iconBg: 'bg-gray-500', hoverRing: 'ring-gray-500', },
];

// --- 3. PRODUCT CARD COMPONENT ---

const ProductCard: React.FC<{ product: Product, onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => {

    // Status rekomendasi di DB: profile_penjual.status
    // Asumsi: Status TRUE di DB = Direkomendasikan
    const isRecommended = product.profile_penjual?.status ?? false;
    const storeName = product.profile_penjual?.store_name || "Toko Tidak Dikenal";
    const tagLabel = isRecommended ? 'Toko Rekomendasi' : 'Non-Rekomendasi';

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-blue-500"
        >
            {/* Badge Rekomendasi/Tag */}
            <span
                className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-md 
            ${isRecommended
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`
                }
            >
                {isRecommended ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {tagLabel}
            </span>

            {/* Gambar Produk */}
            <div className="aspect-square w-full overflow-hidden">
                <img
                    src={product.gambar || NO_IMAGE_PLACEHOLDER}
                    alt={`Gambar ${product.nama_produk}`}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = NO_IMAGE_PLACEHOLDER;
                    }}
                />
            </div>

            {/* Detail Produk & Aksi */}
            <div className="flex flex-1 flex-col justify-between p-5">

                {/* Detail Dasar */}
                <div className="min-h-[5.5rem]">
                    {/* Nama Toko */}
                    <div className="mb-2 flex items-center text-sm font-medium text-gray-500">
                        <Store className="mr-1.5 h-4 w-4 text-blue-500" />
                        {storeName}
                    </div>
                    {/* Nama Produk */}
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                        {product.nama_produk}
                    </h3>
                </div>

                {/* Harga dan Tombol Aksi */}
                <div className="mt-4">
                    <p className="text-3xl font-extrabold text-blue-700">
                        {formatRupiah(product.harga)}
                    </p>

                    <div className="mt-4 flex gap-2">
                        {/* Tombol Detail (Link ke halaman detail produk) */}
                        <Link href={`/product/${product.id}`} passHref className="flex-1">
                            <Button
                                variant="secondary"
                                className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Detail
                            </Button>
                        </Link>

                        {/* Tombol Keranjang */}
                        <Button
                            onClick={() => onAddToCart(product)}
                            className="flex-shrink-0 rounded-xl bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            disabled={product.stok === 0}
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LandingPagePembeli = () => {
    const supabase = createClientComponentClient();
    const carouselRef = useRef<HTMLDivElement | null>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    // Helper untuk notifikasi
    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
    };

    // --- FETCH DATA PRODUK ---
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('produk')
                .select(`
                    id,
                    penjual_id,
                    nama_produk,
                    harga,
                    gambar,
                    stok,
                    jenis_produk,
                    profile_penjual:penjual_id (
                        store_name,
                        status
                    )
                `)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const mappedData: Product[] = (data || []).map(p => ({
                id: p.id as string,
                penjual_id: p.penjual_id as string,
                nama_produk: p.nama_produk as string,
                harga: parseFloat(p.harga as string),
                gambar: p.gambar as string | null,
                stok: p.stok as number,
                jenis_produk: p.jenis_produk as string | null,
                profile_penjual: Array.isArray(p.profile_penjual) ? p.profile_penjual[0] : p.profile_penjual,
            }));

            setProducts(mappedData);

        } catch (err: any) {
            console.error("Error fetching products:", err);
            setError("Gagal memuat produk.");
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        // Ambil user ID saat load
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUserId(user?.id || null);
        });

        fetchProducts();
        AOS.init({ duration: 900, once: true });
    }, [fetchProducts, supabase]);


    // --- LOGIKA ADD TO CART (VALIDASI TOKO) ---
    const handleAddToCart = useCallback(async (product: Product) => {
        setNotification({ type: null, message: '' });

        if (!currentUserId) {
            showNotification('error', 'Anda harus login untuk menambahkan produk ke keranjang.');
            return;
        }

        if (product.stok === 0) {
            showNotification('error', 'Stok produk ini sudah habis.');
            return;
        }

        const user_id = currentUserId;
        const produk_id = product.id;
        const jumlah_produk_dipilih = 1; // Default menambah 1 unit
        const total_harga_item = product.harga * jumlah_produk_dipilih;
        const new_store_name = product.profile_penjual?.store_name || "Toko Tidak Dikenal";
        const new_penjual_id = product.penjual_id;


        // =========================================================================
        // 1. VALIDASI TOKO BERBEDA (CLIENT-SIDE)
        // =========================================================================

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
            const firstCartItem = cartItems[0];
            const existing_penjual_id = (firstCartItem.produk as any)?.penjual_id;
            const existing_store_name = ((firstCartItem.produk as any)?.profile_penjual as any)?.store_name;

            if (existing_penjual_id && existing_penjual_id !== new_penjual_id) {
                showNotification('error', `Produk harus dari toko yang sama. Keranjang Anda sudah berisi produk dari toko ${existing_store_name}.`);
                return;
            }
        }

        // =========================================================================
        // 2. INSERT atau UPDATE (UPSERT)
        // =========================================================================

        const existingItem = cartItems?.find(item => item.produk_id === produk_id);

        if (existingItem) {
            // Jika produk sudah ada, ambil kuantitas lama dan update
            const { data: currentItem } = await supabase
                .from('keranjang')
                .select('jumlah_produk_dipilih')
                .eq('user_id', user_id)
                .eq('produk_id', produk_id)
                .single();

            const currentQuantity = currentItem ? currentItem.jumlah_produk_dipilih : 0;
            const new_total_quantity = currentQuantity + jumlah_produk_dipilih;

            if (new_total_quantity > product.stok) {
                showNotification('error', `Gagal: Stok hanya tersisa ${product.stok}. Jumlah total di keranjang akan melebihi stok.`);
                return;
            }

            const { error: updateError } = await supabase
                .from('keranjang')
                .update({
                    jumlah_produk_dipilih: new_total_quantity,
                    total: product.harga * new_total_quantity,
                })
                .eq('user_id', user_id)
                .eq('produk_id', produk_id);

            if (updateError) {
                console.error("Error updating cart item:", updateError);
                showNotification('error', `Gagal mengupdate keranjang: ${updateError.message}`);
                return;
            }

            showNotification('success', `Jumlah ${product.nama_produk} di keranjang ditambahkan menjadi ${new_total_quantity}!`);

        } else {
            // Jika produk belum ada, lakukan INSERT
            const { error: insertError } = await supabase
                .from('keranjang')
                .insert({
                    user_id: user_id,
                    produk_id: produk_id,
                    jumlah_produk_dipilih: jumlah_produk_dipilih,
                    total: total_harga_item,
                });

            if (insertError) {
                console.error("Error inserting cart item:", insertError);
                showNotification('error', `Gagal menambahkan produk ke keranjang: ${insertError.message}`);
                return;
            }

            showNotification('success', `Produk ${product.nama_produk} berhasil ditambahkan ke keranjang! Toko: ${new_store_name}`);
        }
    }, [currentUserId, supabase]);


    // Scroll function for carousel
    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 320;
            if (direction === 'left') {
                carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    // Data untuk Carousel (ambil 10 produk pertama, lalu duplikat untuk efek loop)
    const carouselProducts = [...products.slice(0, 10), ...products.slice(0, 10)];

    // Produk unggulan (misalnya, 4 produk pertama yang direkomendasikan)
    const latestRecommendedProducts = products.filter(p => p.profile_penjual?.status).slice(0, 4);


    return (
        // ASUMSI MainLayoutPembeli tersedia
        <MainLayoutLanding>
            {/* Notifikasi Umum */}
            {notification.type && (
                <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
                    <Alert
                        variant={notification.type === 'error' ? 'destructive' : 'default'}
                        className={`shadow-lg ${notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-300' : ''}`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>{notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}</AlertTitle>
                        <AlertDescription>{notification.message}</AlertDescription>
                    </Alert>
                </div>
            )}

            <main>
                {/* Hero Section */}
                <section className="w-full">
                    <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-24">

                        {/* LEFT TEXT CONTENT */}
                        <div
                            className="flex flex-col justify-center"
                            data-aos="fade-right"
                        >
                            <Badge variant="outline" className="w-fit">E-Commerce untuk RT 12</Badge>

                            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                Belanja Produk RT <br />
                                <span className="text-blue-600">Mudah & Cepat</span>
                            </h1>

                            <p className="mt-6 text-lg text-gray-600">
                                Dukung UMKM Lokal RT 12. Dapatkan produk terbaik dengan pengiriman cepat dan terpercaya.
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
                            {/* Gambar placeholder */}
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
                        {categories.map((category) => (
                            <Link
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
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Produk Carousel Section */}
                <section id="produk" className="py-16 lg:py-24">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                                Produk Terbaru
                            </h2>

                            {/* Kontrol Carousel di Desktop */}
                            <div className="hidden items-center gap-3 sm:flex">
                                <button
                                    onClick={() => scrollCarousel('left')}
                                    className="p-3 rounded-full bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Scroll Kiri"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => scrollCarousel('right')}
                                    className="p-3 rounded-full bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Scroll Kanan"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-10">
                        {/* Karusel Produk */}
                        {isLoading ? (
                            <div className="text-center py-10">
                                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                                <p className="mt-2 text-gray-600">Memuat produk...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-10 text-red-600">Gagal memuat data: {error}</div>
                        ) : (
                            <div
                                ref={carouselRef}
                                id="product-carousel"
                                className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                                style={{ paddingLeft: 'calc((100% - min(1152px, 100% - 2rem)) / 2 + 1.5rem)', paddingRight: '1.5rem' }}
                            >
                                {carouselProducts.map((product, index) => (
                                    <div key={index} className="w-[300px] flex-shrink-0 snap-start pr-4 pb-4">
                                        <ProductCard product={product} onAddToCart={handleAddToCart} />
                                    </div>
                                ))}
                                <div className="w-0 flex-shrink-0" style={{ minWidth: '1.5rem' }}></div>
                            </div>
                        )}

                        {/* Kontrol Carousel di Mobile (opsional, sebagai indikasi) */}
                        <div className="sm:hidden mt-4 text-center text-sm text-gray-500">
                            Geser ke samping untuk melihat lebih banyak produk.
                        </div>
                    </div>

                </section>

                {/* Produk Unggulan (Hanya Produk yang Direkomendasikan) */}
                <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Pilihan Rekomendasi
                    </h2>

                    <div className="mt-10">
                        {isLoading ? (
                            <div className="text-center py-10">
                                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                            </div>
                        ) : latestRecommendedProducts.length === 0 ? (
                            <p className="text-center text-gray-500">Belum ada produk yang direkomendasikan.</p>
                        ) : (
                            /* Grid Produk (Responsif) */
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {latestRecommendedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                                ))}
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <Link
                                href="/product"
                                className="inline-flex items-center justify-center rounded-xl bg-blue-100 px-6 py-3 text-base font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-200"
                            >
                                Lihat Semua Produk
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
        </MainLayoutLanding>
    );
}

export default LandingPagePembeli;