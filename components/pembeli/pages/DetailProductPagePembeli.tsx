"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Star, ShoppingCart, Plus, Minus, Store, MessageSquare, Clock, ArrowLeft, CheckCircle, Phone, DollarSign, XCircle, Package, AlertCircle, Send, Loader2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MainLayoutPembeli from "../MainLayoutPembeli";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from 'sonner'; // <-- Import Toast untuk notifikasi umum

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
import Link from 'next/link';

// =========================================================================
// INTERFACE (Tidak Berubah)
// =========================================================================
interface Review {
    id: string;
    rating: number;
    ungkapan_ulasan: string | null;
    created_at: string;
    // Data dari Join
    ulasan_pembeli: {
        full_name: string | null;
        foto_url: string | null;
        users: {
            username: string;
        }
    } | null;
}

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

    // Helper untuk notifikasi keranjang (Ganti ke Toast)
    const showNotification = (type: 'success' | 'error', message: string) => {
        if (type === 'success') {
            toast.success(message);
        } else {
            toast.error(message);
        }
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
            .insert({
                pembeli_id: pembeli_id,
                produk_id: produk_id,
                rating: reviewRating,
                ungkapan_ulasan: reviewText.trim() || null,
            });

        setIsSubmittingReview(false);

        if (error) {
            console.error("Gagal mengirim ulasan:", error);
            // Tambahkan penanganan error jika user mencoba membuat ulasan kedua
            if (error.message.includes('duplicate key value')) {
                showNotification('error', 'Anda sudah memberikan ulasan untuk produk ini.');
            } else {
                showNotification('error', `Gagal mengirim ulasan: ${error.message}.`);
            }
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
                const rawProfile = r.profile_pembeli as unknown;

                const profile = Array.isArray(rawProfile)
                    ? (rawProfile[0] as Record<string, unknown>)
                    : (rawProfile as Record<string, unknown>);

                // Safety check untuk users (yang mungkin berupa array jika nested join)
                const rawUsers = profile?.users as unknown;
                const users = Array.isArray(rawUsers) ? (rawUsers[0] as Record<string, unknown>) : (rawUsers as Record<string, unknown>);


                return {
                    id: r.id,
                    rating: r.rating,
                    ungkapan_ulasan: r.ungkapan_ulasan,
                    created_at: r.created_at,
                    ulasan_pembeli: profile ? {
                        full_name: profile.full_name as string | null,
                        foto_url: profile.foto_url as string | null,
                        users: {
                            username: (users)?.username as string,
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
    // LOGIKA KERANJANG & BELI (Diperbarui untuk menggunakan Toast)
    // ///////////////////////////////////////////////////////////////////////////////
    const handleAddToCart = async () => {
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
                produk_relasi:produk_id (penjual_id, profile_penjual (store_name))
            `)
            .eq('user_id', user_id);

        if (cartError) {
            console.error("Error fetching cart items:", cartError);
            showNotification('error', 'Gagal memuat keranjang untuk validasi.');
            return;
        }

        if (cartItems && cartItems.length > 0) {
            const firstCartItem = cartItems[0];

            // Safety check dan akses data join yang lebih baik
            const relatedProduct = Array.isArray(firstCartItem.produk_relasi)
                ? firstCartItem.produk_relasi[0]
                : firstCartItem.produk_relasi;

            const relatedStoreProfile = Array.isArray(relatedProduct?.profile_penjual)
                ? relatedProduct.profile_penjual[0]
                : relatedProduct?.profile_penjual;

            if (!relatedProduct) {
                showNotification('error', 'Validasi gagal: Produk lama di keranjang tidak ditemukan.');
                return;
            }

            const existing_penjual_id = relatedProduct.penjual_id;
            const existing_store_name = relatedStoreProfile?.store_name || "Toko Tidak Dikenal";

            if (existing_penjual_id && existing_penjual_id !== new_penjual_id) {
                showNotification(
                    'error',
                    `Produk harus dari toko yang sama. Keranjang Anda sudah berisi produk dari toko ${existing_store_name}.`
                );
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
        // Menambahkan validasi jika nomor telepon penjual tidak ada
        if (!product.profile_penjual?.phone) {
            showNotification('error', "Nomor telepon penjual tidak tersedia.");
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

        // Mengambil waNumber dari state (sudah dipastikan string atau null di fetchData)
        const waNumberRaw = product.profile_penjual?.phone;
        const storeName = product.profile_penjual?.store_name || "Penjual";

        if (waNumberRaw) {

            // --- KOREKSI UTAMA: PENANGANAN FORMAT NOMOR WA ---
            // 1. Bersihkan semua karakter non-angka
            // Karena waNumberRaw sekarang dijamin string, .replace() aman.
            const cleanNumber = waNumberRaw.replace(/\D/g, '');

            // 2. Format menjadi prefix 62
            let finalWaNumber: string;

            if (cleanNumber.startsWith('62')) {
                // Sudah dimulai dengan 62
                finalWaNumber = cleanNumber;
            } else if (cleanNumber.startsWith('0')) {
                // Dimulai dengan 0, ganti 0 dengan 62 (misal: 0812... -> 62812...)
                finalWaNumber = `62${cleanNumber.substring(1)}`;
            } else {
                // Angka lain, tambahkan 62 di depan (misal: 812... -> 62812...)
                finalWaNumber = `62${cleanNumber}`;
            }

            // Validasi minimal panjang (opsional)
            if (finalWaNumber.length < 9) {
                setErrorMessage("Nomor telepon penjual tidak valid setelah diformat.");
                setTransactionStatus('error');
                return;
            }
            // --- AKHIR KOREKSI ---


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

            // Gunakan finalWaNumber yang sudah bersih dan terformat
            const waUrl = `https://wa.me/${finalWaNumber}?text=${encodedMessage}`;

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


    // FETCH DATA (Tidak Berubah)
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
                    profile_penjual:penjual_id (
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
                        phone: rawProfile.phone ? String(rawProfile.phone) : null,
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
            <div className="flex gap-0.5"> {/* Mengurangi gap */}
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        // Jika bukan interaktif (display rata-rata), gunakan fill/text-yellow-400 jika star <= displayValue
                        className={`${size} ${star <= displayValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:fill-yellow-400 hover:text-yellow-400 transition-colors' : ''}`}
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
                {/* Skeleton Loading Lebih Modern */}
                <div className="container mx-auto px-4 py-12 max-w-7xl">
                    <div className="animate-pulse space-y-8">
                        {/* Header & Image Placeholder */}
                        <div className="h-8 bg-gray-200 w-40 rounded mb-6"></div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="h-96 bg-gray-100 rounded-xl"></div>
                            <div className="space-y-6">
                                <div className="h-4 bg-gray-200 w-32 rounded"></div>
                                <div className="h-10 bg-gray-300 w-full rounded-lg"></div>
                                <div className="h-6 bg-gray-200 w-1/3 rounded"></div>
                                <div className="flex gap-4">
                                    <div className="h-14 bg-blue-200 w-1/2 rounded-xl"></div>
                                    <div className="h-14 bg-blue-300 w-1/2 rounded-xl"></div>
                                </div>
                            </div>
                        </div>
                        {/* Description Placeholder */}
                        <div className="h-40 bg-gray-100 rounded-xl"></div>
                        {/* Review Placeholder */}
                        <div className="h-60 bg-gray-100 rounded-xl"></div>
                    </div>
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
            {/* Mengganti container py-8 menjadi py-12 dan menambahkan padding lebih lega */}
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Notifikasi Keranjang lama dihapus, ganti dengan Toast di function */}

                {/* Bagian Navigasi/Kembali */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-700 mb-8 hover:text-blue-600 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke Daftar Produk
                </button>

                {/* Product Section */}
                <Card className="mb-10 overflow-hidden shadow-2xl border-t-4 border-blue-600 rounded-xl">
                    <CardContent className="p-0">
                        <div className="grid md:grid-cols-2 gap-0">
                            {/* Product Image */}
                            {/* Memperbesar padding gambar di desktop, mengurangi di mobile */}
                            <div className="p-6 md:p-12 flex items-center justify-center bg-gray-50 border-r border-gray-100">
                                <div className="relative w-full max-w-md h-full min-h-[300px] flex items-center justify-center rounded-xl overflow-hidden shadow-xl">
                                    <img
                                        src={product.gambar || "/images/nothing.png"}
                                        alt={product.nama_produk}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6 md:p-10">
                                <div className="mb-6 space-y-2">
                                    <Badge
                                        variant="secondary"
                                        className="mb-2 bg-purple-100 text-purple-700 font-semibold text-xs py-1 px-3 shadow-sm"
                                    >
                                        <Store className="w-3.5 h-3.5 mr-1" />
                                        {product.profile_penjual?.store_name || "Toko Tidak Dikenal"}
                                    </Badge>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                        {product.nama_produk}
                                    </h1>

                                    {/* RATING DISPLAY BARU */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-2xl font-bold text-yellow-500">{averageRating}</span>
                                            {renderStars(parseFloat(averageRating), false, 'w-5 h-5')}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            ({reviews.length} ulasan)
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    {/* HARGA DINAMIS DITONJOLKAN */}
                                    <div className="text-sm font-semibold text-blue-700 mb-1">Harga Jual:</div>
                                    <div className="text-4xl font-extrabold text-blue-600">
                                        {formatPrice(product.harga)}
                                    </div>

                                    <Badge
                                        className={`mt-3 text-xs font-semibold px-3 py-1 ${isRecommended ? "bg-green-500 hover:bg-green-600 shadow-md" : "bg-red-500 hover:bg-red-600 shadow-md"}`}
                                    >
                                        {isRecommended ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                        {isRecommended ? 'Toko Direkomendasikan' : 'Toko Tidak Direkomendasikan'}
                                    </Badge>
                                </div>

                                <div className={`text-base mb-6 font-medium ${product.stok <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                    Stok tersedia: <span className="font-extrabold">{product.stok}</span>
                                    {product.stok <= 5 && <span className="ml-2 font-medium italic text-sm">(Hampir habis, buruan!)</span>}
                                </div>


                                {/* Quantity Selector */}
                                <div className="mb-8">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Kuantitas</label>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => handleQuantityChange('decrement')}
                                            disabled={quantity <= 1}
                                            className='h-12 w-12 text-lg hover:bg-gray-100'
                                        >
                                            <Minus className="w-5 h-5" />
                                        </Button>
                                        <div className="w-16 text-center font-extrabold text-2xl border-y py-2 rounded-lg">{quantity}</div>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => handleQuantityChange('increment')}
                                            disabled={quantity >= product.stok}
                                            className='h-12 w-12 text-lg hover:bg-gray-100'
                                        >
                                            <Plus className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    {quantity >= product.stok && (
                                        <p className="text-xs text-red-500 mt-2 font-medium">Stok maksimum telah tercapai.</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full py-3 px-4 h-14 text-lg 
                   border-2 border-blue-600 text-blue-600 
                   hover:bg-blue-50 font-semibold 
                   whitespace-normal"
                                        size="lg"
                                        onClick={handleAddToCart}
                                        disabled={product.stok === 0 || !userProfile || quantity === 0}
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-3" />
                                        Tambah ke Keranjang
                                    </Button>

                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 
                   h-14 text-lg font-bold shadow-xl 
                   shadow-green-400/30 whitespace-normal"
                                        size="lg"
                                        onClick={handleBuyNow}
                                        disabled={product.stok === 0 || !userProfile || quantity === 0}
                                    >
                                        <Zap className="w-5 h-5 mr-3" />
                                        {product.stok === 0 ? 'Stok Habis' : (!userProfile ? 'Login Dulu' : 'Beli Langsung')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Description Section */}
                <Card className="mb-10 shadow-xl rounded-xl">
                    <CardHeader className='border-b p-6 md:p-8'>
                        <CardTitle className="text-2xl flex items-center gap-3 text-gray-800 font-bold">
                            <MessageSquare className='w-6 h-6 text-purple-600' /> Deskripsi Produk
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6 md:p-8">
                        <p className="text-gray-700 leading-relaxed text-base">
                            {product.deskripsi || "Tidak ada deskripsi yang tersedia untuk produk ini."}
                        </p>

                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                            <h3 className="font-extrabold text-purple-800 mb-3 text-lg">Keunggulan Produk:</h3>
                            <ul className="space-y-2 text-gray-700">
                                {keunggulan.length > 0 ? (
                                    keunggulan.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-base">
                                            <span className="text-green-600 font-bold mt-1">✓</span>
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
                <Card className="shadow-xl rounded-xl">
                    <CardHeader className='border-b p-6 md:p-8'>
                        <CardTitle className="text-2xl flex items-center gap-3 text-gray-800 font-bold">
                            <Star className="w-6 h-6 text-yellow-500" />
                            Ulasan Pembeli ({reviews.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 p-6 md:p-8">
                        {/* Add Comment FORM */}
                        <div className="bg-gray-50 p-6 rounded-xl space-y-4 border">
                            <h3 className="font-bold text-lg text-gray-900">Berikan Ulasan Anda</h3>

                            {!userProfile ? (
                                <Alert variant="default" className="text-center text-sm border-blue-300">
                                    Silakan <Link href="/login" className="text-blue-600 underline font-semibold">login</Link> untuk dapat memberikan ulasan pada produk ini.
                                </Alert>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Rating (1-5)</label>
                                        {renderStars(0, true, 'w-7 h-7', reviewRating)}
                                    </div>
                                    <Textarea
                                        placeholder="Bagikan pengalaman Anda dengan produk ini..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        className="min-h-[100px] border-gray-300 focus:ring-blue-500"
                                        disabled={isSubmittingReview}
                                    />
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={isSubmittingReview || reviewRating === 0}
                                        className="bg-blue-600 hover:bg-blue-700 font-semibold px-6"
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
                        <div className="space-y-6">
                            {reviews.map((review) => {
                                const reviewerName = review.ulasan_pembeli?.full_name
                                    || review.ulasan_pembeli?.users.username
                                    || 'Pengguna Anonim';
                                const reviewerPhoto = review.ulasan_pembeli?.foto_url;

                                return (
                                    <div key={review.id} className="pb-6 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-start gap-4">
                                            <Avatar className='h-12 w-12'>
                                                {reviewerPhoto && <AvatarImage src={reviewerPhoto} alt={reviewerName} />}
                                                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg">
                                                    {reviewerName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-base">{reviewerName}</h4>
                                                        {renderStars(review.rating, false, 'w-4 h-4')}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 sm:mt-0">
                                                        <Clock className="w-4 h-4" />
                                                        {timeSince(review.created_at)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed text-base">
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
                <AlertDialogContent className='rounded-xl shadow-2xl'>
                    <AlertDialogHeader>
                        {transactionStatus === 'processing' && (
                            <div className="flex flex-col items-center justify-center py-4">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                <AlertDialogTitle className="mt-4 text-xl font-bold text-gray-800">Menyiapkan Pesanan...</AlertDialogTitle>
                                <AlertDialogDescription className='text-center'>Harap tunggu sebentar, kami sedang menyiapkan tautan WhatsApp.</AlertDialogDescription>
                            </div>
                        )}
                        {transactionStatus === 'success' && (
                            <div className="flex flex-col items-center justify-center py-4 text-green-600">
                                <CheckCircle className="w-10 h-10 mb-2" />
                                <AlertDialogTitle className="text-2xl font-bold">Siap Menghubungi Penjual!</AlertDialogTitle>
                                <AlertDialogDescription className="text-center">
                                    Anda akan diarahkan ke WhatsApp Penjual untuk menyelesaikan pemesanan.
                                </AlertDialogDescription>
                            </div>
                        )}
                        {transactionStatus === 'error' && (
                            <div className="flex flex-col items-center justify-center py-4 text-red-600">
                                <XCircle className="w-10 h-10 mb-2" />
                                <AlertDialogTitle className="text-2xl font-bold">Gagal Membuat Tautan</AlertDialogTitle>
                                <AlertDialogDescription className="text-center">
                                    {errorMessage}
                                </AlertDialogDescription>
                            </div>
                        )}
                        {transactionStatus === 'idle' && (
                            <>
                                <AlertDialogTitle className="text-2xl font-bold text-gray-900">Konfirmasi Pembelian</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Pastikan detail pesanan sudah benar. Anda akan dihubungkan ke WhatsApp Penjual.
                                </AlertDialogDescription>
                            </>
                        )}
                    </AlertDialogHeader>

                    {transactionStatus === 'idle' && (
                        <div className="space-y-4 p-5 border rounded-xl bg-blue-50 shadow-inner">
                            <h3 className="text-lg font-extrabold border-b pb-3 flex items-center gap-2 text-blue-800">
                                <DollarSign className="w-5 h-5" /> Detail Bill Transaksi
                            </h3>

                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <span className="text-gray-600 flex items-center gap-1"><Store className="w-4 h-4" /> Toko</span>
                                <span className="font-medium text-right">{product.profile_penjual?.store_name || "Toko Tidak Dikenal"}</span>

                                <span className="text-gray-600 flex items-center gap-1">👤 Pembeli</span>
                                <span className="font-medium text-right">{userProfile?.username || "Loading..."}</span>

                                <span className="text-gray-600 flex items-center gap-1"><Package className="w-4 h-4" /> Produk</span>
                                <span className="font-medium text-right">{product.nama_produk}</span>

                                <span className="text-gray-600 flex items-center gap-1"><Plus className="w-4 h-4" /> Jumlah Beli</span>
                                <span className="font-medium text-right">{quantity} x {formatPrice(product.harga)}</span>
                            </div>

                            <div className="flex justify-between pt-3 border-t border-dashed border-blue-300 mt-4">
                                <span className="text-xl font-bold text-gray-800">Total Harga</span>
                                <span className="text-2xl font-extrabold text-green-600">{formatPrice(totalBill)}</span>
                            </div>

                            <div className="pt-3 border-t mt-4 flex items-center gap-2 text-sm text-green-700 font-semibold bg-green-100 p-3 rounded-lg">
                                <Phone className="w-5 h-5" />
                                <span>Hubungi Penjual (WA): {storePhoneNumber}</span>
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter>
                        {transactionStatus === 'idle' && (
                            <>
                                <AlertDialogCancel
                                    onClick={() => setIsDialogOpen(false)}
                                    className='hover:bg-gray-100 px-6 py-2'
                                >
                                    Batal Membeli
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmPayment}
                                    className='bg-green-600 hover:bg-green-700 font-bold px-6 py-2'
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
                                className='px-6 py-2'
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