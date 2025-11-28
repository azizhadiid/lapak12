// Pastikan ini adalah Client Component
'use client';

// 1. Impor hooks React dan client Supabase
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Impor ikon dari lucide-react
import { Edit, Trash2, Package, Search, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import MainLayoutPenjual from '../MainLayoutPenjual';

// --- 2. DEFINISI TIPE & STATE ---

// Tipe data untuk produk
type Product = {
    id: string;
    nama_produk: string;
    jenis_produk: string | null;
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

// --- STATE BARU UNTUK PAGINATION & SEARCH ---
const ITEMS_PER_PAGE = 5; // Tentukan berapa produk per halaman

/**
 * Komponen Tabel Produk (Sekarang dengan data dari Supabase)
 */
export default function EditProductTable() {
    const router = useRouter();
    const supabase = createClientComponentClient();

    // State untuk data
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State untuk delete
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- STATE BARU ---
    const [searchTerm, setSearchTerm] = useState(''); // State untuk input search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // State untuk search setelah debounce
    const [currentPage, setCurrentPage] = useState(1); // State untuk halaman aktif
    const [totalProducts, setTotalProducts] = useState(0); // State untuk total produk (untuk pagination)

    // --- LOGIKA BARU: Debounce Search ---
    // Ini mencegah Supabase di-query setiap kali user mengetik
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset ke halaman 1 setiap kali search baru
        }, 500); // Tunggu 500ms setelah user berhenti mengetik

        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    // --- 3. LOGIKA FETCH DATA (READ) - Diperbarui ---
    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                // 1. Ambil data user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    // Jangan error, tapi arahkan untuk login atau tampilkan pesan tanpa data
                    setErrorMessage("User tidak ditemukan. Silakan login ulang.");
                    setIsLoading(false);
                    return;
                }

                // --- LOGIKA BARU: Pagination ---
                const from = (currentPage - 1) * ITEMS_PER_PAGE;
                const to = from + ITEMS_PER_PAGE - 1;

                // --- LOGIKA BARU: Dynamic Query Builder ---
                // GANTI: .from('products') -> .from('produk')
                let dataQuery = supabase
                    .from('produk')
                    // GANTI: .eq('user_id', user.id) -> .eq('penjual_id', user.id)
                    .select('*')
                    .eq('penjual_id', user.id);

                // GANTI: .from('products') -> .from('produk')
                let countQuery = supabase
                    .from('produk')
                    .select('id', { count: 'exact', head: true })
                    .eq('penjual_id', user.id); // GANTI: .eq('user_id', user.id)

                // Tambahkan filter search jika ada (tetap sama)
                if (debouncedSearchTerm) {
                    dataQuery = dataQuery.ilike('nama_produk', `%${debouncedSearchTerm}%`);
                    countQuery = countQuery.ilike('nama_produk', `%${debouncedSearchTerm}%`);
                }

                // 2. Ambil data PRODUK (dengan range untuk pagination)
                const { data, error } = await dataQuery
                    .order('created_at', { ascending: false })
                    .range(from, to);

                if (error) throw error;

                // 3. Ambil COUNT (total produk)
                const { count, error: countError } = await countQuery;

                if (countError) throw countError;

                // 4. Sukses! Simpan data ke state
                setProducts(data || []);
                setTotalProducts(count || 0);

            } catch (error) {
                console.error("Error mengambil produk:", (error as Error).message);
                setErrorMessage(`Gagal memuat produk: ${(error as Error).message}`);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();
        // Tambahkan user sebagai dependency untuk handle user log-in/log-out
    }, [supabase, currentPage, debouncedSearchTerm]); // <-- BARU: Re-fetch saat halaman atau search berubah

    // --- 4. LOGIKA DELETE (Tetap sama) ---
    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        setErrorMessage(null);

        try {
            // Hapus data dari tabel
            const { error: dbError } = await supabase
                .from('produk')
                .delete()
                .eq('id', productToDelete.id);
            if (dbError) throw new Error(`Gagal hapus data: ${dbError.message}`);

            // Hapus file dari Storage
            if (productToDelete.gambar) {
                const filePath = productToDelete.gambar.split('product-images/')[1];
                const { error: storageError } = await supabase.storage
                    .from('product-images')
                    .remove([filePath]);
                if (storageError) {
                    console.warn(`Gagal hapus file storage: ${storageError.message}`);
                }
            }

            // Update UI
            setProducts(products.filter(p => p.id !== productToDelete.id));
            // Refresh data untuk pagination
            setTotalProducts(prev => prev - 1);
            // Cek jika halaman jadi kosong
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

        } catch (error) {
            console.error("Error Hapus Produk:", (error as Error).message);
            setErrorMessage((error as Error).message);
        } finally {
            setIsDeleting(false);
            setProductToDelete(null);
        }
    };

    // --- 5. LOGIKA NAVIGASI (Tetap sama) ---
    const handleEdit = (productId: string) => {
        router.push(`/penjual/products/${productId}`);
    };

    // --- 6. LOGIKA BARU: Pagination Handler ---
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;

    // --- 7. RENDER KOMPONEN ---
    return (
        <MainLayoutPenjual>
            {/* PERBAIKAN #1: TINGGI LAYER */}
            <div className="flex-1 flex flex-col p-4 md:p-8 mb-16">

                {/* AlertDialog (tidak berubah, posisi sudah benar) */}
                <AlertDialog open={!!productToDelete} onOpenChange={(isOpen) => !isOpen && setProductToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak bisa dibatalkan. Ini akan menghapus produk
                                <strong className='mx-1'>"{productToDelete?.nama_produk}"</strong>
                                secara permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* PERBAIKAN #1: TINGGI LAYER */}
                <Card className="w-full mx-auto shadow-lg flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Daftar Produk Anda</CardTitle>
                                <CardDescription>Kelola semua produk yang Anda jual di sini.</CardDescription>
                            </div>
                        </div>
                        <Button onClick={() => router.push('/penjual/products/tambah')} className='bg-blue-600 hover:bg-blue700'>
                            Tambah Produk Baru
                        </Button>
                    </CardHeader>

                    {/* PERBAIKAN #1: TINGGI LAYER */}
                    <CardContent className="flex-1 flex flex-col overflow-hidden">
                        {/* Input Search (BARU: Terhubung dengan state) */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Cari produk..."
                                className="pl-9 pr-4"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Tampilkan Alert jika ada Error */}
                        {errorMessage && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Gagal Memuat Data</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}

                        {/* PERBAIKAN #1 & #3: TINGGI & RESPONSIVE */}
                        <div className="flex-1 overflow-auto">
                            {/* PERBAIKAN #3: RESPONSIVE (Tampilan Desktop) */}
                            <div className="hidden md:block">
                                <div className="overflow-x-auto rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">Gambar</TableHead>
                                                <TableHead>Nama Produk</TableHead>
                                                <TableHead className="hidden lg:table-cell">Jenis</TableHead>
                                                <TableHead>Stok</TableHead>
                                                <TableHead>Harga</TableHead>
                                                <TableHead className="text-center w-[120px]">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                                        <p className="text-gray-500 mt-2">Memuat data produk...</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : !errorMessage && products.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        <p className="text-gray-500">
                                                            {debouncedSearchTerm
                                                                ? "Tidak ada produk yang cocok dengan pencarian Anda."
                                                                : 'Anda belum memiliki produk. Silakan "Tambah Produk Baru".'
                                                            }
                                                        </p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                products.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell>
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={product.gambar || undefined} alt={product.nama_produk} style={{ objectFit: 'cover' }} />
                                                                <AvatarFallback>P{product.nama_produk.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{product.nama_produk}</TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <Badge variant="secondary">{product.jenis_produk || '-'}</Badge>
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
                                                                <Button variant="outline" size="icon" onClick={() => handleEdit(product.id)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="destructive" size="icon" onClick={() => setProductToDelete(product)} disabled={isDeleting}>
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
                            </div>

                            {/* PERBAIKAN #3: RESPONSIVE (Tampilan Mobile) */}
                            <div className="block md:hidden space-y-4 p-1">
                                {isLoading && products.length === 0 ? (
                                    <div className="text-center p-10">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                        <p className="text-gray-500 mt-2">Memuat data produk...</p>
                                    </div>
                                ) : !errorMessage && products.length === 0 ? (
                                    <div className="text-center p-10">
                                        <p className="text-gray-500">
                                            {debouncedSearchTerm
                                                ? "Tidak ada produk yang cocok."
                                                : "Anda belum memiliki produk."
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    products.map((product) => (
                                        <Card key={product.id} className="flex items-center p-4 gap-4">
                                            <Avatar className="h-12 w-12 rounded-md">
                                                <AvatarImage src={product.gambar || undefined} alt={product.nama_produk} style={{ objectFit: 'cover' }} className="rounded-md" />
                                                <AvatarFallback className="rounded-md">P{product.nama_produk.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <h4 className="font-medium truncate">{product.nama_produk}</h4>
                                                <p className="text-sm font-semibold text-gray-800">{formatRupiah(product.harga || 0)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Stok: {(product.stok ?? 0) > 0 ? (
                                                        <span className="text-green-600 font-medium">{product.stok}</span>
                                                    ) : (
                                                        <span className="text-red-600 font-medium">Habis</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEdit(product.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => setProductToDelete(product)} disabled={isDeleting}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>

                    {/* === BLOK PERUBAHAN UTAMA DIMULAI DI SINI === */}
                    {/* PERBAIKAN #2: PAGINATION
                        Mengganti komponen <Pagination> dengan <Button> sederhana
                        agar konsisten dengan PencatatanPage.tsx
                    */}
                    {totalPages > 1 && (
                        <CardFooter className="pt-6 border-t flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan
                                <strong className="mx-1">{Math.min(from + 1, totalProducts)} - {Math.min(from + products.length, totalProducts)}</strong>
                                dari
                                <strong className="mx-1">{totalProducts}</strong>
                                produk
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm font-medium">
                                    Halaman {currentPage} dari {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                    {/* === BLOK PERUBAHAN UTAMA SELESAI === */}

                </Card>
            </div>
        </MainLayoutPenjual>
    );
}