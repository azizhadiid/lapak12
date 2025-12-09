"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import MainLayoutPenjual from "../MainLayoutPenjual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Calendar, ShoppingBag, Wallet, TrendingUp } from "lucide-react"; // Import TrendingUp & Minus
import { Card, CardContent } from "@/components/ui/card";
// import { Penjualan } from "@/lib/types/pencatatan"; // Asumsi Penjualan interface Anda sudah di-update
import Link from "next/link";
import { toast } from "sonner";
import Swal from "sweetalert2";

// --- Asumsi Interface Penjualan Baru (sesuai skema DB) ---
interface Penjualan {
    id: string; // ID Penjualan kini UUID
    penjual_id: string;
    produk_id: string;
    tanggal: string;
    kategori: string;
    nama_produk_history: string; // Nama produk yang dijual (history)
    jumlah: number;
    harga_satuan: number;
    total_harga: number;
    nama_pembeli: string;
    metode_pembayaran: string;
    created_at: string;
}


// --- Komponen Skeleton Modern untuk Loading State ---
const PencatatanSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="h-5 bg-gray-100 rounded w-96"></div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl shadow-lg border h-36 bg-white p-6">
                    <div className="h-6 bg-gray-200 w-1/3 mb-4 rounded"></div>
                    <div className="h-10 bg-gray-300 w-2/3 rounded"></div>
                </div>
            ))}
        </div>

        {/* Search & Add Button Skeleton */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
            <div className="h-10 bg-gray-200 rounded w-96"></div>
            <div className="h-10 bg-blue-300 rounded w-40"></div>
        </div>

        {/* Table Skeleton */}
        <Card>
            <CardContent className="p-0 pb-4">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="h-12 w-20 bg-gray-100"></TableHead>
                                <TableHead className="h-12 w-40 bg-gray-100"></TableHead>
                                <TableHead className="h-12 w-20 bg-gray-100"></TableHead>
                                <TableHead className="h-12 w-20 bg-gray-100"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map(i => (
                                <TableRow key={i}>
                                    <TableCell className="h-10">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </TableCell>
                                    <TableCell className="h-10">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    </TableCell>
                                    <TableCell className="h-10">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </TableCell>
                                    <TableCell className="h-10">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
);


export default function PencatatanPageComponent() {
    // Menggunakan tipe Penjualan baru
    const [pencatatan, setPencatatan] = useState<Penjualan[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const supabase = createClientComponentClient();
    const router = useRouter();


    // --- LOGIKA FETCH DATA BARU (Filter berdasarkan penjual_id) ---
    useEffect(() => {
        const checkUserAndFetch = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Belum login
                router.push("/login");
                return;
            }

            // Kalau lolos, ambil data penjualan milik user.id
            fetchData(user.id);
        };

        const fetchData = async (userId: string) => {
            // Menggunakan query JOIN untuk mendapatkan nama produk (bukan history)
            const { data, error } = await supabase
                .from("penjualan")
                // Hanya ambil data di mana penjual_id sama dengan ID user yang login
                .select(`
                    id, 
                    tanggal, 
                    kategori, 
                    nama_produk_history, 
                    jumlah, 
                    harga_satuan, 
                    total_harga, 
                    nama_pembeli, 
                    metode_pembayaran,
                    created_at
                `)
                .eq('penjual_id', userId) // <-- KUNCI UTAMA FILTERING
                .order("tanggal", { ascending: false });

            if (error) {
                console.error("Error fetching pencatatan:", error);
                toast.error(`Gagal memuat data penjualan: ${error.message}`);
            } else {
                // Mapping data ke interface Penjualan (sesuai history)
                const mappedData: Penjualan[] = (data ?? []).map(item => ({
                    id: item.id,
                    penjual_id: userId, // Diisi manual karena tidak di-select
                    produk_id: '', // Diabaikan di tampilan
                    tanggal: item.tanggal,
                    kategori: item.kategori,
                    // Menggunakan nama_produk_history dari DB
                    nama_produk_history: item.nama_produk_history,
                    jumlah: item.jumlah,
                    harga_satuan: item.harga_satuan,
                    total_harga: item.total_harga,
                    nama_pembeli: item.nama_pembeli,
                    metode_pembayaran: item.metode_pembayaran,
                    created_at: item.created_at || new Date().toISOString(),
                }));
                setPencatatan(mappedData);
            }
            setLoading(false);
        };

        checkUserAndFetch();
    }, [supabase, router]);

    // Fungsi ini berisi logika untuk menghapus data di Supabase
    const performDelete = async (id: string) => { // ID kini string (UUID)
        // Kita gunakan toast.promise agar ada notifikasi loading, sukses, dan error
        const deletePromise = async () => {
            const { error } = await supabase
                .from("penjualan")
                .delete()
                .eq("id", id); // RLS (Policies) Anda akan mengamankan ini

            if (error) {
                // Jika RLS gagal atau ada error lain, lempar error
                throw new Error(error.message);
            }

            // Jika sukses, update state di UI
            setPencatatan((prev) => prev.filter(p => p.id !== id));
        };

        // Tampilkan toast
        toast.promise(deletePromise(), {
            loading: 'Menghapus data...',
            success: 'Data berhasil dihapus!',
            error: (err) => `Gagal menghapus: ${err.message}`, // Tampilkan pesan error
        });
    };

    // Fungsi ini akan memunculkan pop-up SweetAlert
    const confirmDelete = (item: Penjualan) => {
        Swal.fire({
            title: 'Anda yakin?',
            // Menggunakan nama_produk_history
            text: `Data penjualan "${item.nama_produk_history}" akan dihapus permanen! Penghapusan ini TIDAK mengembalikan stok.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', // Warna merah untuk tombol hapus
            cancelButtonColor: '#6b7280', // Warna abu-abu untuk batal
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            // Jika user menekan tombol "Ya, hapus!"
            if (result.isConfirmed) {
                // Panggil fungsi yang menjalankan logika hapus
                performDelete(item.id);
            }
        });
    };

    const itemsPerPage = 8; // Menambah items per page untuk tampilan modern

    // Filter data berdasarkan search query
    const filteredData = pencatatan.filter(
        (item) =>
            item.nama_produk_history.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.nama_pembeli.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    // Perhitungan Total Stats
    const totalPendapatan = pencatatan.reduce((sum, item) => sum + item.total_harga, 0);
    const totalBulanIni = pencatatan.filter(
        (item) =>
            new Date(item.tanggal).getMonth() === new Date().getMonth() &&
            new Date(item.tanggal).getFullYear() === new Date().getFullYear() // Tambah cek tahun
    ).length;
    // Mencari data 7 hari terakhir
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const totalMingguIni = pencatatan.filter(
        (item) => new Date(item.tanggal) >= sevenDaysAgo
    ).length;


    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
        });
    };

    if (loading) {
        return <MainLayoutPenjual><PencatatanSkeleton /></MainLayoutPenjual>;
    }

    return (
        <MainLayoutPenjual>
            <div className="space-y-8">
                {/* Header */}
                <div className="border-b pb-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Dashboard Penjualan
                    </h1>
                    <p className="text-md text-gray-500 mt-1">
                        Kelola dan pantau semua transaksi penjualan Anda secara real-time.
                    </p>
                </div>

                {/* Stats Cards (UPGRADED DESIGN) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total Pendapatan */}
                    <Card className="rounded-2xl shadow-lg border-l-4 border-green-500 transition-all hover:shadow-xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-green-600 uppercase mb-1 flex items-center">
                                    <Wallet className="h-4 w-4 mr-2" /> Total Pendapatan
                                </div>
                                <div className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(totalPendapatan)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Diakumulasi dari semua transaksi.
                                </p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
                        </CardContent>
                    </Card>

                    {/* Total Penjualan */}
                    <Card className="rounded-2xl shadow-lg border-l-4 border-blue-500 transition-all hover:shadow-xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-blue-600 uppercase mb-1 flex items-center">
                                    <ShoppingBag className="h-4 w-4 mr-2" /> Total Transaksi
                                </div>
                                <div className="text-3xl font-bold text-gray-900">
                                    {filteredData.length}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {totalMingguIni} transaksi dalam 7 hari terakhir.
                                </p>
                            </div>
                            <ShoppingBag className="h-10 w-10 text-blue-500 opacity-20 transform rotate-45" />
                        </CardContent>
                    </Card>

                    {/* Transaksi Bulan Ini */}
                    <Card className="rounded-2xl shadow-lg border-l-4 border-indigo-500 transition-all hover:shadow-xl">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-indigo-600 uppercase mb-1 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" /> Transaksi Bulan Ini
                                </div>
                                <div className="text-3xl font-bold text-gray-900">
                                    {totalBulanIni}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Pencatatan yang dibuat di bulan ini.
                                </p>
                            </div>
                            <Calendar className="h-10 w-10 text-indigo-500 opacity-20" />
                        </CardContent>
                    </Card>
                </div>


                {/* Search and Add Button */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-xl shadow-md border border-gray-100">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Cari produk, pembeli, atau kategori..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 h-10 border-gray-300 focus:border-blue-500"
                        />
                    </div>

                    <Button
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-10 text-sm font-semibold transition-transform duration-200 hover:scale-[1.01]"
                        onClick={() => router.push("/penjual/pencatatan/tambah")}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Pencatatan
                    </Button>
                </div>


                {/* Table */}
                <Card className="shadow-lg rounded-xl">
                    <CardContent className="p-0 pb-4">
                        <div className="overflow-x-auto">
                            <Table className="min-w-full divide-y divide-gray-200">
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="text-gray-600 uppercase text-xs tracking-wider">
                                        <TableHead className="w-[100px] py-3 pl-6">Tanggal</TableHead>
                                        <TableHead>Produk</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Harga Satuan</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead>Pembeli</TableHead>
                                        <TableHead>Pembayaran</TableHead>
                                        <TableHead className="text-center w-[100px] pr-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-200">
                                    {currentData.length > 0 ? (
                                        currentData.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                                <TableCell className="font-medium text-sm py-3 pl-6">
                                                    {formatDate(item.tanggal)}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-gray-800">
                                                    {item.nama_produk_history}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {item.kategori}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right text-sm">{item.jumlah}</TableCell>
                                                <TableCell className="text-right text-sm">
                                                    {formatCurrency(item.harga_satuan)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-sm text-green-600">
                                                    {formatCurrency(item.total_harga)}
                                                </TableCell>
                                                <TableCell className="text-sm">{item.nama_pembeli}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                        ${item.metode_pembayaran === 'Tunai' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                                                    `}>
                                                        {item.metode_pembayaran}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3 pr-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon" // Menggunakan size icon
                                                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                        >
                                                            <Link href={`/penjual/pencatatan/${item.id}`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon" // Menggunakan size icon
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                            onClick={() => confirmDelete(item)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                {searchQuery
                                                    ? "Tidak ada data yang sesuai dengan pencarian"
                                                    : "Belum ada pencatatan penjualan"}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination (UPGRADED DESIGN) */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 pb-8">
                        {/* Status Page */}
                        <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                            Menampilkan <span className="font-semibold">{startIndex + 1} - {Math.min(endIndex, filteredData.length)}</span> dari <span className="font-semibold">{filteredData.length}</span> total pencatatan.
                        </div>

                        {/* Navigasi Tombol */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* Tampilkan halaman saat ini */}
                            <div className="px-4 py-1 text-sm font-semibold bg-blue-600 text-white rounded-md shadow-md">
                                {currentPage} / {totalPages}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayoutPenjual >
    );
}