// Pastikan ini adalah Client Component
'use client';

// 1. Impor hooks React dan client Supabase
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Impor ikon dari lucide-react
import { Edit, Trash2, Package, Search, AlertCircle, Loader2 } from 'lucide-react';

// Impor komponen Shadcn/ui
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Untuk gambar produk
import Image from 'next/image'; // Menggunakan Next.js Image component
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// --- 2. DEFINISI TIPE & STATE ---

// Buat Tipe data untuk produk, sesuaikan dengan skema Anda
type Product = {
    id: string;
    nama_produk: string;
    jenis_product: string | null;
    stok: number | null;
    harga: number | null;
    gambar: string | null;
    created_at: string;
};

/**
 * Helper untuk format harga ke Rupiah
 */
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

/**
 * Komponen Tabel Produk (Sekarang dengan data dari Supabase)
 */
export default function EditProductTable() {
    // State untuk menyimpan data produk dari Supabase
    const [products, setProducts] = useState<Product[]>([]);
    // State untuk loading
    const [isLoading, setIsLoading] = useState(true);
    // State untuk error
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Inisialisasi Supabase client
    const supabase = createClientComponentClient();

    // --- 3. LOGIKA FETCH DATA (READ) ---
    useEffect(() => {
        // Buat fungsi async di dalam useEffect
        async function fetchProducts() {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                // 1. Ambil data user yang sedang login
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    throw new Error("User tidak ditemukan. Silakan login ulang.");
                }

                // 2. Ambil data dari tabel 'products'
                const { data, error } = await supabase
                    .from('products')    // Nama tabel Anda
                    .select('*')         // Ambil semua kolom
                    .eq('user_id', user.id) // Filter HANYA untuk user_id yang login
                    .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

                if (error) {
                    // Jika ada error dari Supabase, lempar error
                    throw error;
                }

                // 3. Sukses! Simpan data ke state
                if (data) {
                    setProducts(data);
                }

            } catch (error) {
                // Tangkap semua error (termasuk error user)
                console.error("Error mengambil produk:", (error as Error).message);
                setErrorMessage((error as Error).message);
            } finally {
                // Apapun hasilnya, loading selesai
                setIsLoading(false);
            }
        }

        // Panggil fungsi fetch data
        fetchProducts();
    }, [supabase]); // Dependensi array

    // --- 4. LOGIC DUMMY UNTUK TOMBOL (Tetap sama) ---
    const handleEdit = (productId: string) => {
        console.log(`(DUMMY) Edit produk dengan ID: ${productId}`);
    };

    const handleDelete = (productId: string) => {
        console.log(`(DUMMY) Hapus produk dengan ID: ${productId}`);
    };

    return (
        <div className="p-4 md:p-8">
            <Card className="w-full mx-auto shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    {/* ... (Header tetap sama) ... */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">Daftar Produk Anda</CardTitle>
                            <CardDescription>Kelola semua produk yang Anda jual di sini.</CardDescription>
                        </div>
                    </div>
                    <Button onClick={() => console.log('Tambah Produk')}>
                        Tambah Produk Baru
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Input Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="Cari produk..." className="pl-9 pr-4" />
                    </div>

                    {/* Tampilkan Alert jika ada Error */}
                    {errorMessage && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Gagal Memuat Data</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Gambar</TableHead>
                                    <TableHead>Nama Produk</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Stok</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead className="text-center w-[120px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* --- 6. RENDER KONDISIONAL --- */}
                                {isLoading ? (
                                    // Tampilkan Pemuatan (Loading)
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                            <p className="text-gray-500 mt-2">Memuat data produk...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : !errorMessage && products.length === 0 ? (
                                    // Tampilkan Jika Data Kosong
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <p className="text-gray-500">
                                                Anda belum memiliki produk. Silakan "Tambah Produk Baru".
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Tampilkan Data Produk (Ganti 'dummyProducts' menjadi 'products')
                                    products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <Avatar className="h-10 w-10">
                                                    {/* Gunakan 'product.gambar' dari state */}
                                                    <AvatarImage
                                                        src={product.gambar || undefined}
                                                        alt={product.nama_produk}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                    <AvatarFallback>P{product.nama_produk.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">{product.nama_produk}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{product.jenis_product || '-'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {(product.stok ?? 0) > 0 ? (
                                                    <span className="text-green-600 font-medium">{product.stok}</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">Habis</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatRupiah(product.harga || 0)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleEdit(product.id)}
                                                        aria-label={`Edit ${product.nama_produk}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => handleDelete(product.id)}
                                                        aria-label={`Hapus ${product.nama_produk}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}