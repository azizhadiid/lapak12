"use client"

import React, { useEffect, useState } from 'react';
import { Star, ShoppingCart, Plus, Minus, Store, ThumbsUp, MessageSquare, Clock, ArrowLeft, CheckCircle, Phone, DollarSign, XCircle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

interface Comment {
    id: number;
    name: string;
    rating: number;
    date: string;
    text: string;
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
    // Kita tetap menggunakan transactionStatus untuk mengelola tampilan dialog
    const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    // State baru untuk menyimpan data user dari public.users
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // untuk comment
    const [comment, setComment] = useState<string>('');
    const [rating, setRating] = useState<number>(0);
    const [comments, setComments] = useState<Comment[]>([
        { id: 1, name: 'Budi Santoso', rating: 5, date: '2 hari yang lalu', text: 'Indomie goreng terbaik! Rasanya authentic dan bumbu lengkap. Pengiriman cepat.' },
        { id: 2, name: 'Siti Nurhaliza', rating: 5, date: '1 minggu yang lalu', text: 'Selalu beli di sini, stok selalu fresh dan harga terjangkau.' }
    ]);

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

    // LOGIKA PEMBELIAN (Hanya menampilkan dialog)
    const handleBuyNow = () => {
        if (!product) return;
        if (quantity > product.stok) {
            alert("Stok tidak mencukupi!");
            return;
        }
        setTransactionStatus('idle'); // Reset status sebelum buka dialog
        setIsDialogOpen(true); // Tampilkan dialog konfirmasi/bill
    };

    // LOGIKA KONFIRMASI (LANGSUNG KE WA, TANPA DB)
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
            // 1. Susun Pesan WhatsApp dengan data user
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

            // 2. Set status sukses dan direct ke WA
            setTransactionStatus('success');

            setTimeout(() => {
                window.open(waUrl, '_blank');
                // 3. HILANGKAN ALERT DIALOG (SETELAH DIRECT)
                setIsDialogOpen(false);
                setTransactionStatus('idle'); // Reset status untuk next pembelian
            }, 1000);

        } else {
            setErrorMessage("Nomor telepon penjual tidak ditemukan.");
            setTransactionStatus('error');
        }
    };


    // FETCH PRODUCT & USER DATA
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

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
                // Biarkan lanjut, tapi userProfile akan null
            } else {
                setUserProfile(userData);
            }

            // 2. Fetch Product Data
            if (!params.id) {
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
                .eq("id", params.id)
                .single();


            if (error) {
                console.error("Gagal memuat produk:", error.message);
                setProduct(null);
            }

            if (data) {
                const productData: ProductData = {
                    ...data,
                    harga: parseFloat(data.harga as string),
                    stok: data.stok ?? 0,
                    profile_penjual: Array.isArray(data.profile_penjual)
                        ? data.profile_penjual[0]
                        : data.profile_penjual
                };
                setProduct(productData);
            } else {
                setProduct(null);
            }

            setLoading(false);
        }

        fetchData();
    }, [params.id, supabase]);

    // ... (Logika Comment/Rating) ...
    const handleSubmitComment = () => {
        if (comment.trim() && rating > 0) {
            const newComment: Comment = {
                id: comments.length + 1,
                name: 'Anda',
                rating: rating,
                date: 'Baru saja',
                text: comment
            };
            setComments([newComment, ...comments]);
            setComment('');
            setRating(0);
        }
    };

    const renderStars = (count: number, interactive: boolean = false, size: string = 'w-5 h-5') => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${size} ${star <= count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:fill-yellow-400 hover:text-yellow-400' : ''}`}
                        onClick={() => interactive && setRating(star)}
                    />
                ))}
            </div>
        );
    };
    // ... (Akhir Logika Comment/Rating) ...

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
                    Produk tidak ditemukan, mungkin ID salah, atau Anda belum login.
                </div>
            </MainLayoutPembeli>
        );
    }

    // Pengecekan status user
    if (!userProfile) {
        // Tampilkan pesan jika user login tapi profil tidak ditemukan
        return (
            <MainLayoutPembeli>
                <div className="p-10 text-center text-xl text-red-600">
                    Error: Profil pembeli tidak ditemukan. Pastikan Anda sudah login.
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
    const isRecommended = product.profile_penjual?.status !== false;

    return (
        <MainLayoutPembeli>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                                    <div className="flex items-center gap-2 mb-4">
                                        {renderStars(5)}
                                        <span className="text-sm text-gray-600">(5.0) • 247 ulasan</span>
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
                                    <Button variant="outline" className="flex-1 py-4 text-lg" size="lg">
                                        Tambah ke Keranjang
                                    </Button>
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                        onClick={handleBuyNow}
                                        disabled={product.stok === 0 || !userProfile}
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

                {/* Comments Section (tetap seperti aslinya) */}
                <Card className="shadow-lg">
                    {/* ... (Konten Comments Section) */}
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <MessageSquare className="w-6 h-6" />
                            Ulasan Pembeli ({comments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add Comment */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <h3 className="font-semibold text-gray-900">Berikan Ulasan Anda</h3>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Rating</label>
                                {renderStars(rating, true, 'w-8 h-8')}
                            </div>
                            <Textarea
                                placeholder="Bagikan pengalaman Anda dengan produk ini..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <Button
                                onClick={handleSubmitComment}
                                disabled={!comment.trim() || rating === 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Kirim Ulasan
                            </Button>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments.map((c) => (
                                <div key={c.id} className="border-b pb-4 last:border-b-0">
                                    <div className="flex items-start gap-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-blue-500 text-white">
                                                {c.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{c.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(c.rating, false, 'w-4 h-4')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    {c.date}
                                                </div>
                                            </div>
                                            <p className="text-gray-700">{c.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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