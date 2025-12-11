"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Minus, Plus, ArrowLeft, X, Loader2, Store, ShoppingBasket, Phone, CheckCircle, AlertCircle, Trash2, Tag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayoutPembeli from '../MainLayoutPembeli';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner'; // Asumsi Toast System terpasang

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
import Swal from 'sweetalert2';


// Interface untuk Profile Penjual (diambil dari join)
interface PenjualProfile {
    store_name: string;
    phone: string;
    status: boolean;
}

// Interface untuk data Produk (diambil dari join)
interface KeranjangProduct {
    nama_produk: string;
    harga: number; // Harga satuan
    stok: number;
    gambar: string | null;
    profile_penjual: PenjualProfile;
}

// Interface untuk Item Keranjang (dari tabel 'keranjang')
interface CartItem {
    id: string; // ID item keranjang
    user_id: string;
    produk_id: string;
    jumlah_produk_dipilih: number;
    total: number; // Total harga item (jumlah * harga)
    created_at: string;

    // Hasil join
    produk: KeranjangProduct;
}

// Interface baru untuk data user yang diambil dari public.users
interface UserProfile {
    id: string;
    username: string;
    email: string;
}


export default function KeranjangPagePembeli() {
    const supabase = createClientComponentClient();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isClearCartDialogOpen, setIsClearCartDialogOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);

    // --- Helpers ---
    const formatRupiah = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    // Mengganti showNotification dengan toast
    const showNotification = (type: 'success' | 'error', message: string) => {
        if (type === 'success') {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };


    // --- Fetch Data Keranjang ---
    const fetchCartItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("Anda harus login untuk melihat keranjang.");
            setIsLoading(false);
            return;
        }

        // Ambil data user profile (username, email)
        const { data: userData } = await supabase
            .from('users')
            .select('id, username, email')
            .eq('id', user.id)
            .single();

        setUserProfile(userData || null);

        try {
            const { data, error } = await supabase
                .from('keranjang')
                .select(`
                    id,
                    user_id,
                    produk_id,
                    jumlah_produk_dipilih,
                    total,
                    created_at,
                    produk:produk_id (
                        nama_produk,
                        harga,
                        stok,
                        gambar,
                        profile_penjual:penjual_id (
                            store_name,
                            phone,
                            status
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const mappedItems: CartItem[] = (data || []).map(item => {
                const rawProduct = item.produk as unknown as Record<string, unknown>;

                const rawProfileSource = rawProduct.profile_penjual as unknown;

                const rawProfile = Array.isArray(rawProfileSource)
                    ? (rawProfileSource[0] as Record<string, unknown>)
                    : (rawProfileSource as Record<string, unknown> | undefined);

                return {
                    id: item.id,
                    user_id: item.user_id,
                    produk_id: item.produk_id,
                    jumlah_produk_dipilih: item.jumlah_produk_dipilih,
                    total: Number(item.total),
                    created_at: item.created_at,
                    produk: {
                        nama_produk: rawProduct.nama_produk as string,
                        harga: Number(rawProduct.harga),
                        stok: (rawProduct.stok as number | undefined) ?? 0,
                        gambar: rawProduct.gambar as string,
                        profile_penjual: {
                            store_name: (rawProfile?.store_name as string | undefined) || "Toko Tidak Dikenal",
                            phone: (rawProfile?.phone as string | undefined) || "N/A",
                            status: (rawProfile?.status as boolean | undefined) ?? false,
                        }
                    }
                };
            });

            setCartItems(mappedItems);

        } catch (err: unknown) {
            console.error("Error fetching cart:", err);

            let message = "Unknown error";

            if (err instanceof Error) {
                message = err.message;
            }

            setError(`Gagal memuat keranjang: ${message}`);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);


    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);


    // ///////////////////////////////////////////////////////////////////////////////
    // FUNGSI UTAMA: CHECKOUT VIA WHATSAPP & CLEAR KERANJANG
    // ///////////////////////////////////////////////////////////////////////////////
    const handleCheckoutWA = async () => {
        setIsCheckoutProcessing(true);
        setNotification({ type: null, message: '' });

        if (cartItems.length === 0 || !userProfile || !sellerInfo) {
            showNotification('error', 'Keranjang kosong atau data penjual/pembeli tidak lengkap.');
            setIsCheckoutProcessing(false);
            return;
        }

        const waNumber = sellerInfo.phone;
        const storeName = sellerInfo.store_name;
        const totalHarga = formatRupiah(subtotal);
        const buyerName = userProfile.username;
        const buyerEmail = userProfile.email;
        const currentUserId = userProfile.id;

        if (!waNumber || waNumber === "N/A") {
            showNotification('error', `Nomor WhatsApp Toko ${storeName} tidak ditemukan.`);
            setIsCheckoutProcessing(false);
            return;
        }

        // 1. Buat Pesan Detail Item
        const itemDetails = cartItems.map((item, index) =>
            `${index + 1}. ${item.produk.nama_produk} (${item.jumlah_produk_dipilih}x) - ${formatRupiah(item.total)}`
        ).join('\n');


        // 2. Susun Pesan WhatsApp Final
        const waMessage = `
Halo Toko ${storeName}, saya *${buyerName}* (${buyerEmail}) ingin melakukan pemesanan (keranjang) berikut:
------------------------------------------
*DETAIL PESANAN*
${itemDetails}
------------------------------------------
*TOTAL KESELURUHAN*: ${totalHarga}
------------------------------------------
Mohon konfirmasi pesanan ini dan panduan pembayarannya. Terima kasih.
        `.trim();

        const encodedMessage = encodeURIComponent(waMessage);
        const waUrl = `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodedMessage}`;

        // 3. Arahkan ke WhatsApp
        window.open(waUrl, '_blank');

        // 4. Hapus Isi Keranjang setelah redirect (Asumsi transaksi WA berhasil)
        setTimeout(async () => {
            const { error: deleteError } = await supabase
                .from('keranjang')
                .delete()
                .eq('user_id', currentUserId);

            if (deleteError) {
                // Notifikasi ke user bahwa keranjang gagal dikosongkan (meski WA sudah terkirim)
                console.error("Gagal membersihkan keranjang setelah checkout:", deleteError);
                showNotification('error', 'Pesanan terkirim via WA, namun gagal mengosongkan keranjang di sistem.');
            } else {
                showNotification('success', 'Pesanan berhasil diteruskan ke WhatsApp! Keranjang Anda telah dikosongkan.');
            }

            // Muat ulang keranjang (akan menjadi kosong)
            fetchCartItems();
            setIsCheckoutProcessing(false);

        }, 1000); // Tunggu 1 detik sebelum membersihkan DB
    };


    // ///////////////////////////////////////////////////////////////////////////////
    // FUNGSI KERANJANG LAINNYA (Update/Delete/ClearCart) - Tetap sama
    // ///////////////////////////////////////////////////////////////////////////////

    // FUNGSI UPDATE KUANTITAS (TAMBAH/KURANG)
    const updateQuantity = async (itemId: string, currentItem: CartItem, change: number) => {
        setNotification({ type: null, message: '' });

        const newQuantity = currentItem.jumlah_produk_dipilih + change;
        const productStok = currentItem.produk.stok;
        const productPrice = currentItem.produk.harga;

        if (newQuantity < 1) {
            showNotification('error', 'Jumlah produk minimal adalah 1. Gunakan tombol hapus untuk menghilangkan item.');
            return;
        }

        if (newQuantity > productStok) {
            showNotification('error', `Gagal: Stok produk (${currentItem.produk.nama_produk}) hanya tersisa ${productStok}.`);
            return;
        }

        const newTotal = productPrice * newQuantity;

        const { error: updateError } = await supabase
            .from('keranjang')
            .update({
                jumlah_produk_dipilih: newQuantity,
                total: newTotal
            })
            .eq('id', itemId);

        if (updateError) {
            console.error("Error updating quantity:", updateError);
            showNotification('error', `Gagal mengupdate jumlah: ${updateError.message}`);
            return;
        }

        showNotification('success', `Jumlah produk ${currentItem.produk.nama_produk} berhasil diubah menjadi ${newQuantity}.`);
        fetchCartItems();
    };

    // FUNGSI HAPUS ITEM KERANJANG
    const removeItem = async (itemId: string, productName: string) => {
        // Reset notifikasi lama
        setNotification({ type: null, message: '' });

        // Tampilkan konfirmasi SweetAlert2
        const result = await Swal.fire({
            title: "Hapus Produk?",
            html: `Apakah Anda yakin ingin menghapus <b>${productName}</b> dari keranjang?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            reverseButtons: true,
        });

        // Jika user klik batal → berhenti
        if (!result.isConfirmed) return;

        // Proses hapus item dari database
        const { error: deleteError } = await supabase
            .from("keranjang")
            .delete()
            .eq("id", itemId);

        if (deleteError) {
            console.error("Error deleting item:", deleteError);

            Swal.fire({
                icon: "error",
                title: "Gagal!",
                text: `Gagal menghapus item: ${deleteError.message}`,
            });

            return;
        }

        // Jika sukses
        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: `Produk ${productName} berhasil dihapus dari keranjang.`,
            timer: 1800,
            showConfirmButton: false,
        });

        // Refresh keranjang
        fetchCartItems();
    };

    // FUNGSI BERSIHKAN KERANJANG
    const handleClearCart = async () => {
        setNotification({ type: null, message: '' });

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            showNotification('error', 'Anda harus login untuk membersihkan keranjang.');
            return;
        }

        const { error: deleteError } = await supabase
            .from('keranjang')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error("Error clearing cart:", deleteError);
            showNotification('error', `Gagal membersihkan keranjang: ${deleteError.message}`);
            return;
        }

        showNotification('success', 'Keranjang berhasil dikosongkan.');
        setIsClearCartDialogOpen(false);
        fetchCartItems();
    };


    // --- Logika Perhitungan Total ---
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const sellerInfo = cartItems.length > 0 ? cartItems[0].produk.profile_penjual : null;
    const finalTotal = subtotal;

    // --- Render Komponen ---

    if (isLoading) {
        return (
            <MainLayoutPembeli>
                <div className="container mx-auto px-4 py-20 text-center">
                    <Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600">Memuat data keranjang...</p>
                </div>
            </MainLayoutPembeli>
        );
    }

    if (error) {
        return (
            <MainLayoutPembeli>
                <div className="container mx-auto px-4 py-8">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            </MainLayoutPembeli>
        );
    }

    if (cartItems.length === 0) {
        return (
            <MainLayoutPembeli>
                <div className="container mx-auto px-4 py-20 text-center">
                    <ShoppingBasket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h1>
                    <p className="text-gray-600 mb-6">Yuk, temukan produk menarik dari penjual di RT 12!</p>
                    <Link href="/product" passHref>
                        <Button className="bg-blue-600 hover:bg-blue-700">Mulai Belanja</Button>
                    </Link>
                </div>
            </MainLayoutPembeli>
        );
    }

    // Tampilkan loading saat proses checkout
    if (isCheckoutProcessing) {
        return (
            <MainLayoutPembeli>
                <div className="container mx-auto px-4 py-20 text-center">
                    <Loader2 className="w-10 h-10 mx-auto animate-spin text-green-600 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Memproses Pesanan...</h1>
                    <p className="text-gray-600">Anda akan segera diarahkan ke WhatsApp Penjual.</p>
                </div>
            </MainLayoutPembeli>
        );
    }

    return (
        <MainLayoutPembeli>
            <div className="container mx-auto px-4 py-10 md:py-12">
                {/* Notifikasi */}
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

                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Keranjang Belanja
                    </h1>
                    {sellerInfo && (
                        <div className="
        flex flex-wrap items-center gap-2 
        text-md text-gray-700 
        p-3 bg-blue-50 border border-blue-200 
        rounded-xl 
        shadow-sm
        max-w-full sm:max-w-fit
    ">
                            <Store className="w-5 h-5 text-blue-600" />
                            <span className='font-medium'>
                                Pesanan dari Toko:
                                <span className="font-bold text-blue-700 ml-1">
                                    {sellerInfo.store_name}
                                </span>
                            </span>
                            {/* Status Toko */}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sellerInfo.status === false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {sellerInfo.status === false ? 'Rekomendasi' : 'Non-Rekomendasi'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Cart Items List */}
                        {cartItems.map(item => (
                            <Card key={item.id} className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-600 relative">
                                {/* Pastikan Card memiliki class 'relative' */}

                                {/* Tombol Silang (X) di pojok kanan atas untuk Hapus Item */}
                                <button
                                    onClick={() => removeItem(item.id, item.produk.nama_produk)}
                                    // Posisi absolute, di luar aliran grid
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors z-20"
                                    title={`Hapus ${item.produk.nama_produk}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <CardContent className="p-4 md:p-6">
                                    {/* Grid Item (Mobile & Desktop) */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                        {/* Product Info (Col 1-5) */}
                                        <div className="md:col-span-5 flex gap-4 items-start pr-8"> {/* Menambahkan pr-8 agar teks tidak menabrak tombol X */}
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden shadow-md">
                                                <img
                                                    src={item.produk.gambar || "/images/nothing.png"}
                                                    alt={item.produk.nama_produk}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 pt-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-lg">{item.produk.nama_produk}</h3>
                                                <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                                                    <AlertCircle className='w-4 h-4' /> Stok Tersisa: {item.produk.stok}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                                    <Tag className='w-4 h-4' /> Harga Satuan:
                                                    <span className='font-semibold text-gray-800'>
                                                        {formatRupiah(item.produk.harga)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Separator Mobile */}
                                        <div className='block md:hidden border-t pt-4 mt-4'></div>


                                        {/* Quantity & Update (Col 6-8) */}
                                        <div className="md:col-span-4 flex md:justify-center items-center gap-2">
                                            <span className="md:hidden font-semibold text-gray-700 mr-2">Ubah Jumlah:</span>

                                            <div className="flex items-center gap-1 border border-gray-300 rounded-xl shadow-sm overflow-hidden">
                                                {/* Tombol Minus */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item, -1)}
                                                    disabled={item.jumlah_produk_dipilih <= 1}
                                                    className="h-10 w-10 p-0 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Minus className="w-5 h-5" />
                                                </Button>

                                                <span className="w-12 text-center font-bold text-lg text-gray-900">{item.jumlah_produk_dipilih}</span>

                                                {/* Tombol Plus */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item, 1)}
                                                    disabled={item.jumlah_produk_dipilih >= item.produk.stok}
                                                    className="h-10 w-10 p-0 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Total (Col 9-12) */}
                                        <div className="md:col-span-3 flex md:justify-end items-center gap-2">
                                            <span className="md:hidden font-semibold text-gray-700">Subtotal Item:</span>
                                            <span className="font-extrabold text-xl text-green-600">
                                                {formatRupiah(item.total)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Action Buttons Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full">
                            <Link href="/product" passHref className="w-full sm:w-auto">
                                <Button variant="outline" className="flex items-center gap-2 h-11 w-full sm:w-auto">
                                    <ArrowLeft className="w-4 h-4" />
                                    Lanjutkan Berbelanja
                                </Button>
                            </Link>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-50 h-11 w-full sm:w-auto"
                                    onClick={() => setIsClearCartDialogOpen(true)}
                                    disabled={cartItems.length === 0}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Bersihkan Keranjang
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Pemesanan Section */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-2xl border-t-4 border-green-600 sticky top-4 rounded-xl">
                            <CardContent className="p-6 md:p-8">
                                <h2 className="text-2xl font-extrabold mb-6 pb-3 border-b-2 border-green-600 text-gray-900 flex items-center gap-2">
                                    <ShoppingBasket className='w-6 h-6 text-green-600' /> Ringkasan Pesanan
                                </h2>

                                {/* Subtotal */}
                                <div className="flex justify-between mb-4 text-lg">
                                    <span className="text-gray-700 font-medium">Subtotal ({cartItems.length} Item)</span>
                                    <span className="font-bold text-gray-900">{formatRupiah(subtotal)}
                                    </span>
                                </div>

                                {/* Ongkir (Dummy/Placeholder) */}
                                <div className="flex justify-between mb-4 text-lg">
                                    <span className="text-gray-700 font-medium flex items-center gap-1">
                                        <Truck className='w-5 h-5 text-gray-400' /> Biaya Kirim (Internal)
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        Gratis
                                    </span>
                                </div>


                                {/* Info Penjual */}
                                {sellerInfo && (
                                    <div className="flex flex-col gap-1 pt-4 border-t border-dashed mb-4">
                                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                            <Store className="w-4 h-4 text-purple-600" /> Penjual
                                        </span>
                                        <span className="text-base text-blue-700 font-bold ml-1">
                                            {sellerInfo.store_name}
                                        </span>
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                            <Phone className="w-4 h-4" /> Kontak: {sellerInfo.phone}
                                        </span>
                                    </div>
                                )}


                                {/* Total Akhir */}
                                <div className="flex justify-between mb-6 pt-4 border-t-2 border-gray-300">
                                    <span className="text-xl font-extrabold text-gray-900">Total Pembayaran</span>
                                    <span className="text-3xl font-extrabold text-green-600">{formatRupiah(finalTotal)}
                                    </span>
                                </div>

                                {/* Checkout Button (WA) */}
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 h-14 text-xl font-bold shadow-xl shadow-green-400/30 transition-all duration-300"
                                    onClick={handleCheckoutWA}
                                    disabled={cartItems.length === 0 || !userProfile || isCheckoutProcessing}
                                >
                                    {isCheckoutProcessing ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-3 animate-spin" /> Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <FaWhatsapp className="w-7 h-7 mr-3" />
                                            Proses Pesanan (WhatsApp)
                                        </>
                                    )}
                                </Button>

                                <p className='text-xs text-center text-gray-500 mt-3'>*Pembayaran dilakukan langsung ke Penjual via WhatsApp untuk konfirmasi pesanan.</p>

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ////////////////////////////////////////////////////////////////////////////////
                ALERT DIALOG KONFIRMASI BERSIHKAN KERANJANG
            //////////////////////////////////////////////////////////////////////////////// */}
            <AlertDialog open={isClearCartDialogOpen} onOpenChange={setIsClearCartDialogOpen}>
                <AlertDialogContent className='rounded-xl shadow-xl'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-2xl font-bold text-red-600">
                            <Trash2 className='w-6 h-6 mr-2' /> Konfirmasi Bersihkan Keranjang
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin **menghapus semua** ({cartItems.length} item) produk dari keranjang belanja Anda? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='font-semibold'>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClearCart}
                            className='bg-red-600 hover:bg-red-700 font-semibold'
                        >
                            Ya, Bersihkan Sekarang
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </MainLayoutPembeli>
    );
}