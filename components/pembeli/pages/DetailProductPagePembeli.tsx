"use client"

import React, { useEffect, useState } from 'react';
import { Star, ShoppingCart, Plus, Minus, Store, ThumbsUp, MessageSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import MainLayoutPembeli from "../MainLayoutPembeli";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
    nama_produk: string;
    harga: number | string; // Supabase NUMERIC dikembalikan sebagai string
    gambar: string | null;
    deskripsi: string | null;
    keunggulan_produk: string | null; // String yang dipisahkan koma
    jenis_produk: string | null;
    profile_penjual: {
        store_name: string | null;
        status: boolean; // false = Tidak Direkomendasikan
    } | null;
}

export default function DetailProductPembeli({ params }: { params: { id: string } }) {
    const supabase = createClientComponentClient();

    // PRODUCT DATA
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // COMMENT / RATING SECTION
    const [quantity, setQuantity] = useState<number>(1);
    const [comment, setComment] = useState<string>('');
    const [rating, setRating] = useState<number>(0);
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            name: 'Budi Santoso',
            rating: 5,
            date: '2 hari yang lalu',
            text: 'Indomie goreng terbaik! Rasanya authentic dan bumbu lengkap. Pengiriman cepat.'
        },
        {
            id: 2,
            name: 'Siti Nurhaliza',
            rating: 5,
            date: '1 minggu yang lalu',
            text: 'Selalu beli di sini, stok selalu fresh dan harga terjangkau.'
        }
    ]);

    const handleQuantityChange = (type: 'increment' | 'decrement') => {
        if (type === 'increment') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

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

    // FETCH PRODUCT
    useEffect(() => {
        async function fetchProduct() {
            // Pastikan Anda telah mengimplementasikan get_my_role() dan RLS di Supabase
            // Jika Anda belum login, query ini mungkin gagal karena RLS.

            if (!params.id) {
                console.error("ID Produk tidak ditemukan di params.");
                setLoading(false);
                setProduct(null); // Penting agar pesan error "Produk tidak ditemukan" muncul
                return;
            }

            const { data, error } = await supabase
                .from("produk")
                .select(`
                    id,
                    nama_produk,
                    harga,
                    gambar,
                    deskripsi,
                    keunggulan_produk,
                    jenis_produk,
                    profile_penjual:profile_penjual (
                        store_name, 
                        status
                    )
                `)
                .eq("id", params.id)
                .single();


            if (error) {
                console.error("Gagal memuat produk:", error.message);
                setProduct(null);
            }
            // Mengatasi harga yang mungkin berupa string (dari tipe NUMERIC di Supabase)
            if (data && typeof data.harga === 'string') {
                setProduct({ ...data, harga: parseFloat(data.harga) });
            } else {
                setProduct(data as ProductData | null);
            }

            setLoading(false);
        }

        fetchProduct();
    }, [params.id, supabase]); // Tambahkan supabase ke dependency array

    if (loading) {
        return (
            <MainLayoutPembeli>
                <div className="p-10 text-center text-xl">Memuat produk...</div>
            </MainLayoutPembeli>
        );
    }

    if (!product) {
        return (
            <MainLayoutPembeli>
                {/* Pastikan Anda sudah login, karena RLS produk hanya mengizinkan authenticated user SELECT */}
                <div className="p-10 text-center text-xl text-red-600">
                    Produk tidak ditemukan, mungkin ID salah, atau Anda belum login (RLS memblokir akses).
                </div>
            </MainLayoutPembeli>
        );
    }

    // SPLIT KEUNGGULAN
    const keunggulan: string[] =
        product.keunggulan_produk
            ?.split(",")
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0) // <--- Tambahkan tipe eksplisit di sini
        ?? [];

    // FUNGSI UNTUK FORMAT HARGA
    const formatPrice = (price: number | string | undefined): string => {
        if (!price) return 'Harga Tidak Tersedia';
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        // Format Rupiah, membulatkan ke ribuan (k) jika perlu
        return `Rp ${new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(numPrice)}`;
    };

    // Tentukan status rekomendasi penjual
    const isRecommended = product.profile_penjual?.status !== false;

    return (
        <MainLayoutPembeli>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Product Section */}
                <Card className="mb-8 overflow-hidden shadow-lg">
                    <CardContent className="p-0">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Product Image */}
                            <div className="p-8 flex items-center justify-center">
                                <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                                    <img
                                        src={product.gambar || "/images/nothing.png"}
                                        alt={product.nama_produk}
                                        className="w-full h-full object-contain drop-shadow-2xl"
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

                                {/* <div className="mb-6">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">Rp 3.5<span className="text-2xl">k</span></div>
                                    <Badge className="bg-green-500 hover:bg-green-600">
                                        <ThumbsUp className="w-3 h-3 mr-1" />
                                        Toko Rekomendasi
                                    </Badge>
                                </div> */}

                                <div className="mb-6">
                                    {/* HARGA DINAMIS */}
                                    <div className="text-4xl font-bold text-blue-600 mb-2">
                                        {formatPrice(product.harga)}
                                    </div>

                                    <Badge className={isRecommended ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {isRecommended ? 'Toko Direkomendasikan' : 'Toko Tidak Direkomendasikan'}
                                    </Badge>
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
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button variant="outline" className="flex-1" size="lg">
                                        Tambah ke Keranjang
                                    </Button>
                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Beli Sekarang
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

                {/* Comments Section */}
                <Card className="shadow-lg">
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
        </MainLayoutPembeli>
    );
}