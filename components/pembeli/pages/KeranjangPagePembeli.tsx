"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Minus, Plus, ArrowLeft, X, Loader2, Store, ShoppingBasket, Phone, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'; // Tambah icon Trash2
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayoutPembeli from '../MainLayoutPembeli';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

export default function KeranjangPagePembeli() {
    const supabase = createClientComponentClient();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    // State baru untuk konfirmasi hapus semua keranjang
    const [isClearCartDialogOpen, setIsClearCartDialogOpen] = useState(false);


    // --- Helpers ---
    const formatRupiah = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
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
                const rawProduct = item.produk as any;
                const rawProfile = Array.isArray(rawProduct.profile_penjual)
                    ? rawProduct.profile_penjual[0]
                    : rawProduct.profile_penjual;

                return {
                    id: item.id,
                    user_id: item.user_id,
                    produk_id: item.produk_id,
                    jumlah_produk_dipilih: item.jumlah_produk_dipilih,
                    total: parseFloat(item.total as any),
                    created_at: item.created_at,
                    produk: {
                        nama_produk: rawProduct.nama_produk,
                        harga: parseFloat(rawProduct.harga),
                        stok: rawProduct.stok ?? 0,
                        gambar: rawProduct.gambar,
                        profile_penjual: {
                            store_name: rawProfile?.store_name || "Toko Tidak Dikenal",
                            phone: rawProfile?.phone || "N/A",
                            status: rawProfile?.status ?? false,
                        }
                    }
                };
            });

            setCartItems(mappedItems);

        } catch (err: any) {
            console.error("Error fetching cart:", err);
            setError(`Gagal memuat keranjang: ${err.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);


    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);


    // ///////////////////////////////////////////////////////////////////////////////
    // FUNGSI UTAMA: MENGHAPUS SEMUA ITEM KERANJANG BERDASARKAN USER_ID
    // ///////////////////////////////////////////////////////////////////////////////
    const handleClearCart = async () => {
        setNotification({ type: null, message: '' });

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            showNotification('error', 'Anda harus login untuk membersihkan keranjang.');
            return;
        }

        // Operasi DELETE: Menghapus semua baris di tabel 'keranjang' milik user saat ini
        const { error: deleteError } = await supabase
            .from('keranjang')
            .delete()
            .eq('user_id', user.id); // RLS Anda menjamin ini hanya menghapus milik user sendiri

        if (deleteError) {
            console.error("Error clearing cart:", deleteError);
            showNotification('error', `Gagal membersihkan keranjang: ${deleteError.message}`);
            return;
        }

        // Sukses
        showNotification('success', 'Keranjang berhasil dikosongkan.');
        setIsClearCartDialogOpen(false); // Tutup dialog
        fetchCartItems(); // Muat ulang data (akan menampilkan Keranjang Kosong)
    };

    // FUNGSI UPDATE KUANTITAS (TAMBAH/KURANG) - TIDAK BERUBAH
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

    // FUNGSI HAPUS ITEM KERANJANG - TIDAK BERUBAH
    const removeItem = async (itemId: string, productName: string) => {
        setNotification({ type: null, message: '' });

        if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${productName}" dari keranjang?`)) {

            const { error: deleteError } = await supabase
                .from('keranjang')
                .delete()
                .eq('id', itemId);

            if (deleteError) {
                console.error("Error deleting item:", deleteError);
                showNotification('error', `Gagal menghapus item: ${deleteError.message}`);
                return;
            }

            showNotification('success', `Produk ${productName} berhasil dihapus dari keranjang.`);
            fetchCartItems();
        }
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
                    <Link href="/produk" passHref>
                        <Button className="bg-blue-600 hover:bg-blue-700">Mulai Belanja</Button>
                    </Link>
                </div>
            </MainLayoutPembeli>
        );
    }

    return (
        <MainLayoutPembeli>
            <div className="container mx-auto px-4 py-8">
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

                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Keranjang Belanja
                    </h1>
                    {sellerInfo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <Store className="w-4 h-4 text-blue-600" />
                            <span>Dari Toko:
                                <span className="font-semibold text-blue-700 ml-1">
                                    {sellerInfo.store_name}
                                </span>
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Header */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b-2 border-blue-600 font-semibold text-gray-700">
                            <div className="col-span-5">PRODUK</div>
                            <div className="col-span-2 text-center">HARGA SATUAN</div>
                            <div className="col-span-3 text-center">JUMLAH</div>
                            <div className="col-span-2 text-center">SUBTOTAL</div>
                        </div>

                        {/* Cart Items */}
                        {cartItems.map(item => (
                            <Card key={item.id} className="shadow-sm relative">

                                {/* Tombol Silang (X) di pojok kanan atas */}
                                <button
                                    onClick={() => removeItem(item.id, item.produk.nama_produk)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                                    title={`Hapus ${item.produk.nama_produk}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <CardContent className="p-4 md:p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                        {/* Product Info */}
                                        <div className="md:col-span-5 flex gap-4 items-center">
                                            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
                                                <img
                                                    src={item.produk.gambar || "/images/nothing.png"}
                                                    alt={item.produk.nama_produk}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{item.produk.nama_produk}</h3>
                                                <p className="text-sm text-red-500">Stok: {item.produk.stok}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                                            <span className="md:hidden font-medium text-gray-700">Harga Satuan:</span>
                                            <span className="font-semibold text-gray-900">
                                                {formatRupiah(item.produk.harga)}
                                            </span>
                                        </div>

                                        {/* Quantity */}
                                        <div className="md:col-span-3 flex md:justify-center items-center gap-2">
                                            <span className="md:hidden font-medium text-gray-700">Jumlah:</span>

                                            <div className="flex items-center gap-2 border rounded-lg">
                                                {/* Tombol Minus (Kurang Jumlah) */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item, -1)}
                                                    disabled={item.jumlah_produk_dipilih <= 1}
                                                    className="h-10 w-10 p-0 hover:bg-gray-100"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>

                                                <span className="w-12 text-center font-medium">{item.jumlah_produk_dipilih}</span>

                                                {/* Tombol Plus (Tambah Jumlah) */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item, 1)}
                                                    disabled={item.jumlah_produk_dipilih >= item.produk.stok}
                                                    className="h-10 w-10 p-0 hover:bg-gray-100"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                                            <span className="md:hidden font-medium text-gray-700">Subtotal Item:</span>

                                            <span className="font-bold text-lg text-blue-600">
                                                {formatRupiah(item.total)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Link href="/produk" passHref>
                                <Button variant="outline" className="flex items-center gap-2" >
                                    <ArrowLeft className="w-4 h-4" />
                                    Lanjutkan Berbelanja
                                </Button>
                            </Link>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Tombol Bersihkan */}
                                <Button
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={() => setIsClearCartDialogOpen(true)} // Tampilkan dialog
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
                        <Card className="shadow-md sticky top-8">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-6 pb-3 border-b-2 border-blue-600">
                                    Ringkasan Pemesanan
                                </h2>

                                {/* Subtotal */}
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-700">Total Produk ({cartItems.length} Item)</span>
                                    <span className="font-semibold">{formatRupiah(subtotal)}
                                    </span>
                                </div>

                                {/* Info Penjual */}
                                {sellerInfo && (
                                    <div className="flex flex-col gap-1 pt-4 border-t mb-4">
                                        <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                                            <Store className="w-4 h-4" /> Penjual
                                        </span>
                                        <span className="text-base text-blue-700 font-medium ml-1">
                                            {sellerInfo.store_name}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Phone className="w-4 h-4" /> No. HP: {sellerInfo.phone}
                                        </span>
                                    </div>
                                )}


                                {/* Total Akhir */}
                                <div className="flex justify-between mb-6 pt-4 border-t-2 border-gray-300">
                                    <span className="text-lg font-bold">Total Pembayaran</span>
                                    <span className="text-2xl font-bold text-blue-600">{formatRupiah(finalTotal)}
                                    </span>
                                </div>

                                {/* Checkout Button (WA) */}
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium mb-4"
                                    // onClick={handleCheckoutWA} // Akan diimplementasikan di revisi selanjutnya
                                    title="Fitur Checkout WA belum diimplementasikan"
                                >
                                    <FaWhatsapp className="w-6 h-6 mr-2" />
                                    Proses Pesanan via WhatsApp
                                </Button>

                                <p className='text-xs text-center text-gray-500 mt-2'>*Pembayaran dilakukan langsung ke Penjual via WhatsApp.</p>

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ////////////////////////////////////////////////////////////////////////////////
                ALERT DIALOG KONFIRMASI BERSIHKAN KERANJANG
            //////////////////////////////////////////////////////////////////////////////// */}
            <AlertDialog open={isClearCartDialogOpen} onOpenChange={setIsClearCartDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-xl text-red-600">
                            <Trash2 className='w-6 h-6 mr-2' /> Konfirmasi Bersihkan Keranjang
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin **menghapus semua** ({cartItems.length} item) produk dari keranjang belanja Anda? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClearCart}
                            className='bg-red-600 hover:bg-red-700'
                        >
                            Ya, Bersihkan Sekarang
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </MainLayoutPembeli>
    );
}