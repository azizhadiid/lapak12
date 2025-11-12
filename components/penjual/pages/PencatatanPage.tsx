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
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Penjualan } from "@/lib/types/pencatatan";
import Link from "next/link";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function PencatatanPageComponent() {
    const [pencatatan, setPencatatan] = useState<Penjualan[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const supabase = createClientComponentClient();
    const router = useRouter();

    // ✅ CEK LOGIN DAN ROLE PENJUAL
    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                // Belum login
                router.push("/login");
                return;
            }

            // Kalau lolos, ambil data penjualan
            fetchData();
        };

        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("penjualan")
                .select("*")
                .order("tanggal", { ascending: false });

            if (error) console.error("Error:", error);
            else setPencatatan(data as Penjualan[]);
            setLoading(false);
        };

        checkUser();
    }, []);

    // Fungsi ini berisi logika untuk menghapus data di Supabase
    const performDelete = async (id: number) => {
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
            text: `Data penjualan "${item.nama_produk}" akan dihapus permanen!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Warna merah untuk tombol hapus
            cancelButtonColor: '#6b7280', // Warna abu-abu untuk batal
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            // Jika user menekan tombol "Ya, hapus!"
            if (result.isConfirmed) {
                // Panggil fungsi yang menjalankan logika hapus
                performDelete(item.id as number);
            }
        });
    };

    const itemsPerPage = 5;

    // Filter data berdasarkan search query
    const filteredData = pencatatan.filter(
        (item) =>
            item.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.nama_pembeli.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

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
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <MainLayoutPenjual>
                <div className="flex justify-center items-center h-64 space-x-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                </div>
            </MainLayoutPenjual>
        );
    }

    return (
        <MainLayoutPenjual>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pencatatan Penjualan</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola dan pantau semua transaksi penjualan Anda
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-gray-500">Total Penjualan</div>
                            <div className="text-2xl font-bold text-gray-900 mt-2">
                                {pencatatan.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-gray-500">Total Pendapatan</div>
                            <div className="text-2xl font-bold text-green-600 mt-2">
                                {formatCurrency(pencatatan.reduce((sum, item) => sum + item.total_harga, 0))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-gray-500">Bulan Ini</div>
                            <div className="text-2xl font-bold text-blue-600 mt-2">
                                {
                                    pencatatan.filter(
                                        (item) =>
                                            new Date(item.tanggal).getMonth() ===
                                            new Date().getMonth()
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Cari produk, pembeli, atau kategori..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>

                    <Button
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-900"
                        onClick={() => (window.location.href = "/penjual/pencatatan/tambah")}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Pencatatan
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0 pb-4">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Tanggal</TableHead>
                                        <TableHead>Produk</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">Jumlah</TableHead>
                                        <TableHead className="text-right">Harga Satuan</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead>Pembeli</TableHead>
                                        <TableHead>Pembayaran</TableHead>
                                        <TableHead className="text-center w-[100px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentData.length > 0 ? (
                                        currentData.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {formatDate(item.tanggal)}
                                                </TableCell>
                                                <TableCell>{item.nama_produk}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {item.kategori}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">{item.jumlah}</TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.harga_satuan)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-green-600">
                                                    {formatCurrency(item.total_harga)}
                                                </TableCell>
                                                <TableCell>{item.nama_pembeli}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {item.metode_pembayaran}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Link href={`/penjual/pencatatan/${item.id}`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-500">
                            Menampilkan {startIndex + 1} -{" "}
                            {Math.min(endIndex, filteredData.length)} dari{" "}
                            {filteredData.length} data
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
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
