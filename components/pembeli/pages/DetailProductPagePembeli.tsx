"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Star, ShoppingCart, Plus, Minus, Store, MessageSquare, Clock, ArrowLeft, CheckCircle, Phone, DollarSign, XCircle, Package, AlertCircle, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MainLayoutPembeli from "../MainLayoutPembeli";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Import komponen Shadcn UI untuk Alert Konfirmasi
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Import komponen Shadcn UI untuk Notifikasi
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// =========================================================================
// INTERFACE UNTUK ULASAN DARI DATABASE
// =========================================================================
interface Review {
    id: string;
    rating: number;
    ungkapan_ulasan: string | null;
    created_at: string;
    // Data dari Join (menggunakan alias 'ulasan_pembeli')
    ulasan_pembeli: {
        full_name: string | null;
        foto_url: string | null;
        users: {
            username: string;
        }
    } | null;
}

// Interface untuk data produk yang lebih jelas
interface ProductData {
    id: string;
    penjual_id: string;
    nama_produk: string;
    harga: number;
    gambar: string | null;
    deskripsi: string | null;
    stok: number;
    keunggulan_produk: string | null;
    jenis_produk: string | null;
    profile_penjual: {
        store_name: string | null;
        phone: string | null;
        status: boolean;
    } | null;
}

// Interface baru untuk data user yang diambil dari public.users
interface UserProfile {
    id: string;
    username: string;
    email: string;
}


export default function DetailProductPembeli({ params }: { params: { id: string } }) {
    const supabase = createClientComponentClient();

    // STATE UTAMA
    const [product, setProduct] = useState<ProductData | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState<number>(1);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // State Notifikasi Keranjang/Umum
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    // State untuk Ulasan
    const [reviewText, setReviewText] = useState<string>('');
    const [reviewRating, setReviewRating] = useState<number>(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);


    // FUNGSI UTAMA
    const formatPrice = (price: number | string | undefined): string => {
        if (price === undefined || price === null) return 'Harga Tidak Tersedia';
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return `Rp ${new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(numPrice)}`;
    };

    const handleQuantityChange = (type: 'increment' | 'decrement') => {
        if (product && product.stok !== null) {
            if (type === 'increment' && quantity < product.stok) {
                setQuantity(prev => prev + 1);
            } else if (type === 'decrement' && quantity > 1) {
                setQuantity(prev => prev - 1);
            }
        }
    };

    // Helper untuk notifikasi keranjang
    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
    };

    // Helper untuk format tanggal ulasan
    const timeSince = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " tahun yang lalu";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " bulan yang lalu";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " hari yang lalu";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " jam yang lalu";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " menit yang lalu";
        return Math.floor(seconds) + " detik yang lalu";
    }

    // ///////////////////////////////////////////////////////////////////////////////
    // LOGIKA SUBMIT ULASAN BARU
    // ///////////////////////////////////////////////////////////////////////////////
    const handleSubmitReview = async () => {
        if (!userProfile || !product) {
            showNotification('error', 'Anda harus login dan produk harus valid untuk memberikan ulasan.');
            return;
        }
        if (reviewRating === 0) {
            showNotification('error', 'Rating harus diberikan (minimal 1 bintang).');
            return;
        }

        setIsSubmittingReview(true);
        const pembeli_id = userProfile.id;
        const produk_id = product.id;

        const { error } = await supabase
            .from('ulasan')
            .insert({ // Menggunakan INSERT untuk menambah baris baru
                pembeli_id: pembeli_id,
                produk_id: produk_id,
                rating: reviewRating,
                ungkapan_ulasan: reviewText.trim() || null,
            });

        setIsSubmittingReview(false);

        if (error) {
            console.error("Gagal mengirim ulasan:", error);
            showNotification('error', `Gagal mengirim ulasan: ${error.message}.`);
            return;
        }

        showNotification('success', 'Ulasan berhasil terkirim!');
        setReviewText('');
        setReviewRating(0);

        fetchReviews(product.id);
    };

    // ///////////////////////////////////////////////////////////////////////////////
    // LOGIKA FETCH ULASAN 
    // ///////////////////////////////////////////////////////////////////////////////
    const fetchReviews = useCallback(async (productId: string) => {
        if (!productId) return;

        try {
            const { data, error } = await supabase
                .from('ulasan')
                .select(`
                    id,
                    rating,
                    ungkapan_ulasan,
                    created_at,
                    profile_pembeli:pembeli_id (
                        full_name,
                        foto_url,
                        users (
                            username
                        )
                    )
                `)
                .eq('produk_id', productId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Mapping data agar sesuai interface Review
            const mappedReviews: Review[] = (data || []).map(r => {
                const rawProfile = r.profile_pembeli as any;

                // Pastikan profile_pembeli adalah objek
                const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

                return {
                    id: r.id,
                    rating: r.rating,
                    ungkapan_ulasan: r.ungkapan_ulasan,
                    created_at: r.created_at,
                    ulasan_pembeli: profile ? {
                        full_name: profile.full_name as string | null,
                        foto_url: profile.foto_url as string | null,
                        users: {
                            username: profile.users.username as string,
                        }
                    } : null
                };
            });

            setReviews(mappedReviews);

        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    }, [supabase]);


    // ///////////////////////////////////////////////////////////////////////////////
    // LOGIKA KERANJANG & BELI (Tidak berubah)
    // ///////////////////////////////////////////////////////////////////////////////
    const handleAddToCart = async () => {
        setNotification({ type: null, message: '' });

        if (!userProfile) {
            showNotification('error', 'Anda harus login untuk menambahkan produk ke keranjang.');
            return;
        }

        if (!product || product.stok === 0) {
            showNotification('error', 'Produk tidak valid atau stok habis.');
            return;
        }

        if (quantity === 0) {
            showNotification('error', 'Jumlah produk harus lebih dari nol.');
            return;
        }

        const user_id = userProfile.id;
        const produk_id = product.id;
        const jumlah_produk_dipilih = quantity;
        const total_harga_item = product.harga * jumlah_produk_dipilih;
        const new_store_name = product.profile_penjual?.store_name || "Toko Tidak Dikenal";
        const new_penjual_id = product.penjual_id;


        // =========================================================================
        // 1. VALIDASI TOKO BERBEDA (BUSINESS LOGIC)
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
            const existing_penjual_id = (firstCartItem.produk as any).penjual_id;
            const existing_store_name = ((firstCartItem.produk as any).profile_penjual as any)?.store_name;

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
            const { data: currentItem, error: fetchError } = await supabase
                .from('keranjang')
                .select('jumlah_produk_dipilih')
                .eq('user_id', user_id)
                .eq('produk_id', produk_id)
                .single();

            if (fetchError || !currentItem) {
                console.error("Error fetching existing item quantity:", fetchError);
                showNotification('error', 'Gagal memverifikasi item di keranjang.');
                return;
            }

            const new_total_quantity = currentItem.jumlah_produk_dipilih + jumlah_produk_dipilih;

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

            showNotification('success', `Jumlah ${product.nama_produk} di keranjang berhasil ditambahkan menjadi ${new_total_quantity}!`);

        } else {
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
    };


    // LOGIKA PEMBELIAN & KONFIRMASI WA - TIDAK BERUBAH
    const handleBuyNow = () => {
        if (!product) return;
        if (quantity > product.stok) {
            showNotification('error', "Stok tidak mencukupi!");
            return;
        }
        setTransactionStatus('idle');
        setIsDialogOpen(true);
    };

    const confirmPayment = async () => {
        if (!product || !userProfile) {
            setErrorMessage("Data produk atau profil pengguna tidak lengkap.");
            setTransactionStatus('error');
            return;
        }
        setTransactionStatus('processing');
        setErrorMessage('');

        const total_harga_transaksi = product.harga * quantity;
        const waNumber = product.profile_penjual?.phone;
        const storeName = product.profile_penjual?.store_name || "Penjual";

        if (waNumber) {
            const waMessage = `
Halo ${storeName}, saya *${userProfile.username}* (${userProfile.email}) ingin memesan produk:
------------------------------------------
Produk: ${product.nama_produk}
Jumlah: ${quantity}
Harga Satuan: ${formatPrice(product.harga)}
Total Harga: ${formatPrice(total_harga_transaksi)}
------------------------------------------
Mohon konfirmasi pesanan saya. Terima kasih.
            `.trim();

            const encodedMessage = encodeURIComponent(waMessage);
            const waUrl = `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodedMessage}`;

            setTransactionStatus('success');

            setTimeout(() => {
                window.open(waUrl, '_blank');
                setIsDialogOpen(false);
                setTransactionStatus('idle');
            }, 1000);

        } else {
            setErrorMessage("Nomor telepon penjual tidak ditemukan.");
            setTransactionStatus('error');
        }
    };


    // FETCH DATA
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const productId = params.id;

            if (!session) {
                console.error("User belum login.");
                setLoading(false);
                setProduct(null);
                setUserProfile(null);
                return;
            }

            const currentUserId = session.user.id;

            // 1. Fetch data user dari public.users (untuk username dan email)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, username, email')
                .eq('id', currentUserId)
                .single();

            if (userError || !userData) {
                console.error("Gagal memuat profil user:", userError?.message);
            } else {
                setUserProfile(userData);
            }

            // 2. Fetch Product Data
            if (!productId) {
                console.error("ID Produk tidak ditemukan di params.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("produk")
                .select(`
                    id,
                    penjual_id,
                    nama_produk,
                    harga,
                    gambar,
                    stok,
                    deskripsi,
                    keunggulan_produk,
                    jenis_produk,
                    profile_penjual:profile_penjual (
                        store_name, 
                        phone, 
                        status
                    )
                `)
                .eq("id", productId)
                .single();


            if (error) {
                console.error("Gagal memuat produk:", error.message);
                setProduct(null);
            }

            if (data) {
                const rawProfile = Array.isArray(data.profile_penjual)
                    ? data.profile_penjual[0]
                    : data.profile_penjual;

                const productData: ProductData = {
                    id: data.id,
                    penjual_id: data.penjual_id,
                    nama_produk: data.nama_produk,
                    harga: parseFloat(data.harga as string),
                    gambar: data.gambar,
                    deskripsi: data.deskripsi,
                    stok: data.stok ?? 0,
                    keunggulan_produk: data.keunggulan_produk,
                    jenis_produk: data.jenis_produk,
                    profile_penjual: rawProfile ? {
                        store_name: rawProfile.store_name as string,
                        phone: rawProfile.phone as string,
                        status: rawProfile.status as boolean,
                    } : null,
                };
                setProduct(productData);

                // 3. Panggil Fetch Ulasan
                fetchReviews(productId);

            } else {
                setProduct(null);
            }

            setLoading(false);
        }

        fetchData();
    }, [params.id, supabase, fetchReviews]);

    // RENDER STARS (FUNGSI PERBAIKAN BINTANG RATA-RATA)
    const renderStars = (count: number, interactive: boolean = false, size: string = 'w-5 h-5', ratingValue: number = 0) => {
        const displayValue = interactive ? ratingValue : count;

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        // Jika bukan interaktif (display rata-rata), gunakan fill/text-yellow-400 jika star <= displayValue
                        className={`${size} ${star <= displayValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:fill-yellow-400 hover:text-yellow-400' : ''}`}
                        onClick={() => interactive && setReviewRating(star)}
                    />
                ))}
            </div>
        );
    };

    // HITUNG RATA-RATA RATING & TOTAL ULASAN
    const totalRatingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0
        ? (totalRatingSum / reviews.length).toFixed(1)
        : '0.0';

    if (loading) {
        return (
            <MainLayoutPembeli>
                <div className="w-full flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-4">Memuat produk...</p>
                </div>
            </MainLayoutPembeli>
        );
    }

    if (!product) {
        return (
            <MainLayoutPembeli>
                <div className="p-10 text-center text-xl text-red-600">
                    Produk tidak ditemukan, mungkin ID salah.
                </div>
            </MainLayoutPembeli>
        );
    }


    // HITUNG TOTAL BILL
    const totalBill = product.harga * quantity;
    const storePhoneNumber = product.profile_penjual?.phone || "Nomor Tidak Tersedia";

    // SPLIT KEUNGGULAN
    const keunggulan: string[] =
        product.keunggulan_produk
            ?.split(",")
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0)
        ?? [];

    // Tentukan status rekomendasi penjual
    const isRecommended = product.profile_penjual?.status !== true;

    return (
        <MainLayoutPembeli>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Notifikasi Keranjang */}
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

                {/* Bagian Navigasi/Kembali */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-700 mb-6 hover:underline"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali
                </button>
                {/* Product Section */}
                <Card className="mb-8 overflow-hidden shadow-lg">
                    <CardContent className="p-0">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Product Image */}
                            <div className="p-8 flex items-center justify-center">
                                <div className="relative w-full h-full max-h-[480px] min-h-[300px] flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                                    <img
                                        src={product.gambar || "/images/nothing.png"}
                                        alt={product.nama_produk}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                            </div>

                            {/* Product Info */}
                            <div className="p-8">
                                <div className="mb-4">
                                    <Badge variant="secondary" className="mb-2">
                                        <Store className="w-3 h-3 mr-1" />
                                        {product.profile_penjual?.store_name || "Toko Tidak Dikenal"}
                                    </Badge>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.nama_produk}</h1>

                                    {/* RATING DISPLAY BARU (PERBAIKAN BINTANG) */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl font-bold text-yellow-500">{averageRating}</span>
                                        {/* Perbaikan: Menggunakan averageRating untuk mengisi bintang */}
                                        {renderStars(parseFloat(averageRating), false, 'w-5 h-5')}
                                        <span className="text-sm text-gray-600">
                                            ({reviews.length} ulasan)
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    {/* HARGA DINAMIS */}
                                    <div className="text-4xl font-bold text-blue-600 mb-2">
                                        {formatPrice(product.harga)}
                                    </div>

                                    <Badge className={isRecommended ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        {isRecommended ? 'Toko Direkomendasikan' : 'Toko Tidak Direkomendasikan'}
                                    </Badge>
                                </div>

                                <div className={`text-sm mb-4 ${product.stok <= 5 ? 'text-red-500' : 'text-gray-600'}`}>
                                    Stok tersedia: <span className="font-semibold">{product.stok}</span>
                                    {product.stok <= 5 && <span className="ml-1 font-medium italic">(Hampir habis!)</span>}
                                </div>


                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Kuantitas</label>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleQuantityChange('decrement')}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <div className="w-16 text-center font-semibold text-lg">{quantity}</div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleQuantityChange('increment')}
                                            disabled={quantity >= product.stok}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {quantity >= product.stok && (
                                        <p className="text-xs text-red-500 mt-1">Stok maksimum telah tercapai.</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col md:flex-row gap-4 mt-6 w-full">
                                    <Button
                                        variant="outline"
                                        className="flex-1 py-4 text-lg"
                                        size="lg"
                                        onClick={handleAddToCart}
                                        disabled={product.stok === 0 || !userProfile || quantity === 0}
                                    >
                                        Tambah ke Keranjang
                                    </Button>
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                        onClick={handleBuyNow}
                                        disabled={product.stok === 0 || !userProfile || quantity === 0}
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        {product.stok === 0 ? 'Stok Habis' : (!userProfile ? 'Login Dulu' : 'Beli Sekarang')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Description Section */}
                <Card className="mb-8 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Deskripsi Produk</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                            {product.deskripsi || "Tidak ada deskripsi yang tersedia untuk produk ini."}
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">Keunggulan:</h3>
                            <ul className="space-y-2 text-gray-700">
                                {keunggulan.length > 0 ? (
                                    keunggulan.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 italic">Tidak ada keunggulan produk yang dicatat.</li>
                                )}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments Section (ULASAN BARU) */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <MessageSquare className="w-6 h-6" />
                            Ulasan Pembeli ({reviews.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add Comment FORM */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <h3 className="font-semibold text-gray-900">Berikan Ulasan Anda</h3>

                            {!userProfile ? (
                                <Alert variant="default" className="text-center text-sm">
                                    Silakan login untuk dapat memberikan ulasan pada produk ini.
                                </Alert>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-sm text-gray-600 mb-2 block">Rating (1-5)</label>
                                        {renderStars(0, true, 'w-8 h-8', reviewRating)}
                                    </div>
                                    <Textarea
                                        placeholder="Bagikan pengalaman Anda dengan produk ini..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        className="min-h-[100px]"
                                        disabled={isSubmittingReview}
                                    />
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={isSubmittingReview || reviewRating === 0}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmittingReview ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5 mr-2" />
                                        )}
                                        Kirim Ulasan
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {reviews.map((review) => {
                                // Fallback Logic yang disederhanakan: full_name -> username -> Pengguna Anonim
                                const reviewerName = review.ulasan_pembeli?.full_name
                                    || review.ulasan_pembeli?.users.username
                                    || 'Pengguna Anonim';
                                const reviewerPhoto = review.ulasan_pembeli?.foto_url;

                                return (
                                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                                        <div className="flex items-start gap-3">
                                            <Avatar>
                                                {reviewerPhoto && <AvatarImage src={reviewerPhoto} alt={reviewerName} />}
                                                <AvatarFallback className="bg-blue-500 text-white">
                                                    {reviewerName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{reviewerName}</h4>
                                                        <div className="flex items-center gap-2">
                                                            {renderStars(review.rating, false, 'w-4 h-4')}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Clock className="w-4 h-4" />
                                                        {timeSince(review.created_at)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700">
                                                    {review.ungkapan_ulasan || "*Tidak ada teks ulasan.*"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {reviews.length === 0 && (
                                <p className="text-center text-gray-500 italic p-4">Belum ada ulasan untuk produk ini.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* ////////////////////////////////////////////////////////////////////////////////
                ALERT DIALOG KONFIRMASI / BILL
            //////////////////////////////////////////////////////////////////////////////// */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        {transactionStatus === 'processing' && (
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <AlertDialogTitle className="mt-4">Menyiapkan Pesanan...</AlertDialogTitle>
                                <AlertDialogDescription>Harap tunggu sebentar, kami sedang menyiapkan tautan WhatsApp.</AlertDialogDescription>
                            </div>
                        )}
                        {transactionStatus === 'success' && (
                            <div className="flex flex-col items-center justify-center text-green-600">
                                <CheckCircle className="w-10 h-10 mb-2" />
                                <AlertDialogTitle className="text-2xl font-bold">Siap Menghubungi Penjual!</AlertDialogTitle>
                                <AlertDialogDescription className="text-center">
                                    Anda akan diarahkan ke WhatsApp Penjual untuk menyelesaikan pemesanan.
                                </AlertDialogDescription>
                            </div>
                        )}
                        {transactionStatus === 'error' && (
                            <div className="flex flex-col items-center justify-center text-red-600">
                                <XCircle className="w-10 h-10 mb-2" />
                                <AlertDialogTitle className="text-2xl font-bold">Gagal Membuat Tautan</AlertDialogTitle>
                                <AlertDialogDescription className="text-center">
                                    {errorMessage}
                                </AlertDialogDescription>
                            </div>
                        )}
                        {transactionStatus === 'idle' && (
                            <>
                                <AlertDialogTitle className="text-2xl font-bold">Konfirmasi Pembelian</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Pastikan detail pesanan sudah benar. Anda akan dihubungkan ke WhatsApp Penjual.
                                </AlertDialogDescription>
                            </>
                        )}
                    </AlertDialogHeader>

                    {transactionStatus === 'idle' && (
                        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2 text-gray-700">
                                <DollarSign className="w-5 h-5" /> Detail Bill
                            </h3>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1"><Store className="w-4 h-4" /> Toko</span>
                                <span className="font-medium">{product.profile_penjual?.store_name || "Toko Tidak Dikenal"}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1">👤 Pembeli</span>
                                <span className="font-medium">{userProfile?.username || "Loading..."}</span>
                            </div>


                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1"><Package className="w-4 h-4" /> Produk</span>
                                <span className="font-medium">{product.nama_produk}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1"><Plus className="w-4 h-4" /> Jumlah Beli</span>
                                <span className="font-medium">{quantity} x {formatPrice(product.harga)}</span>
                            </div>

                            <div className="flex justify-between pt-2 border-t border-dashed border-gray-300">
                                <span className="text-lg font-bold text-gray-800">Total Harga</span>
                                <span className="text-xl font-extrabold text-blue-600">{formatPrice(totalBill)}</span>
                            </div>

                            <div className="pt-3 border-t mt-4 flex items-center gap-2 text-sm text-blue-600">
                                <Phone className="w-4 h-4" />
                                <span>Hubungi Penjual: {storePhoneNumber}</span>
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter>
                        {transactionStatus === 'idle' && (
                            <>
                                <AlertDialogCancel
                                    onClick={() => setIsDialogOpen(false)}
                                    className='hover:bg-gray-100'
                                >
                                    Batal Membeli
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmPayment}
                                    className='bg-green-600 hover:bg-green-700'
                                    disabled={!userProfile}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Lanjut Pembayaran (WA)
                                </AlertDialogAction>
                            </>
                        )}
                        {/* Tombol tutup jika sukses atau error */}
                        {(transactionStatus === 'success' || transactionStatus === 'error') && (
                            <Button
                                onClick={() => setIsDialogOpen(false)}
                                variant="outline"
                            >
                                Tutup
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </MainLayoutPembeli>
    );
}