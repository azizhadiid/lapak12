"use client";

import { useState, useMemo, useEffect } from "react";
import MainLayoutAdmin from "../MainLayoutAdmin";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Users,
    UserCheck,
    UserX,
    CheckCircle,
    XCircle,
} from "lucide-react";
// Import client Supabase yang sudah Anda buat
import supabase from "@/lib/db"; // *Pastikan path ini benar*

// --- Tipe data yang direvisi ---
type UserStatus = "good" | "bad" | "neutral";
type UserRole = "pembeli" | "penjual";

interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus; // Status yang sudah dihitung ('good'/'bad' berdasarkan default SQL)
    joinDate: string;
    lastActive: string;
}

// --- Fungsi Simulasi Fetch Admin Users ---
const fetchAdminUsers = async () => {
    const { data, error } = await supabase
        .from('admin_dashboard_users') // Gunakan View/RPC yang telah dibuat
        .select('*');

    if (error) throw error;

    // Pisahkan data yang sudah difetch
    const buyerUsers = data.filter(u => u.role === 'pembeli');
    const sellerUsers = data.filter(u => u.role === 'penjual');

    return {
        buyerUsers,
        sellerUsers,
        totalUsers: data.length,
    };
};

export default function DashboardAdminPage() {
    // --- State untuk Data ---
    const [buyerUsers, setBuyerUsers] = useState<AdminUser[]>([]);
    const [sellerUsers, setSellerUsers] = useState<AdminUser[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    // --- State BARU untuk Notifikasi/Alert ---
    const [alertMessage, setAlertMessage] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // --- State untuk Pembeli (Buyer) ---
    const [buyerSearchQuery, setBuyerSearchQuery] = useState("");
    const [buyerStatusFilter, setBuyerStatusFilter] = useState<string>("all");
    const [buyerCurrentPage, setBuyerCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- State untuk Penjual (Seller) ---
    const [sellerSearchQuery, setSellerSearchQuery] = useState("");
    const [sellerStatusFilter, setSellerStatusFilter] = useState<string>("all");
    const [sellerCurrentPage, setSellerCurrentPage] = useState(1);

    // --- Efek untuk Fetch Data saat komponen dimuat ---
    useEffect(() => {
        setIsLoading(true);
        fetchAdminUsers().then(data => {
            setBuyerUsers(data.buyerUsers);
            setSellerUsers(data.sellerUsers);
            setTotalUsers(data.totalUsers);
            setIsLoading(false);
        });
    }, []);

    // --- Logika Status Badge (Tetap sama) ---
    const getStatusBadge = (status: UserStatus) => {
        switch (status) {
            case "good":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Baik</Badge>;
            case "bad":
                return <Badge className="bg-red-500 hover:bg-red-600">Buruk</Badge>;
            default:
                return <Badge variant="secondary">Netral</Badge>;
        }
    };

    // --- Logika Filter dan Search Pembeli ---
    const filteredBuyerUsers = useMemo(() => {
        return buyerUsers.filter((user) => {
            const matchesSearch =
                user.username.toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(buyerSearchQuery.toLowerCase());

            const matchesStatus =
                buyerStatusFilter === "all" || user.status === buyerStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [buyerUsers, buyerSearchQuery, buyerStatusFilter]);

    // --- Logika Pagination Pembeli ---
    const buyerTotalPages = Math.ceil(filteredBuyerUsers.length / itemsPerPage);
    const paginatedBuyerUsers = useMemo(() => {
        const startIndex = (buyerCurrentPage - 1) * itemsPerPage;
        return filteredBuyerUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredBuyerUsers, buyerCurrentPage]);

    // --- Logika Filter dan Search Penjual ---
    const filteredSellerUsers = useMemo(() => {
        return sellerUsers.filter((user) => {
            const matchesSearch =
                user.username.toLowerCase().includes(sellerSearchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(sellerSearchQuery.toLowerCase());

            const matchesStatus =
                sellerStatusFilter === "all" || user.status === sellerStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [sellerUsers, sellerSearchQuery, sellerStatusFilter]);

    // --- Logika Pagination Penjual ---
    const sellerTotalPages = Math.ceil(filteredSellerUsers.length / itemsPerPage);
    const paginatedSellerUsers = useMemo(() => {
        const startIndex = (sellerCurrentPage - 1) * itemsPerPage;
        return filteredSellerUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSellerUsers, sellerCurrentPage]);

    // --- Statisik Gabungan ---
    const stats = useMemo(() => {
        const good = buyerUsers.filter((u) => u.status === "good").length +
            sellerUsers.filter((u) => u.status === "good").length;
        const bad = buyerUsers.filter((u) => u.status === "bad").length +
            sellerUsers.filter((u) => u.status === "bad").length;

        return { total: totalUsers, good, bad };
    }, [buyerUsers, sellerUsers, totalUsers]);


    // --- BARU: Fungsi untuk mengubah status user (Diperlukan nanti) ---
    // Fungsi ini akan memerlukan logika tambahan untuk meng-update
    // status di tabel profile_pembeli atau profile_penjual yang relevan
    const handleStatusChange = async (userId: string, role: UserRole, newStatus: UserStatus) => {
        // 1. Tentukan nama fungsi RPC yang akan dipanggil
        const rpcName = 'update_user_status';

        // 2. Lakukan panggilan ke Supabase RPC (Function Call)
        // Panggilan ini akan dieksekusi dengan hak akses tinggi (SECURITY DEFINER)
        const { error } = await supabase.rpc(rpcName, {
            p_user_id: userId,
            p_role: role,
            p_new_status: newStatus,
        });

        if (error) {
            console.error(`Gagal mengubah status ${role} ${userId} melalui RPC:`, error);
            setAlertMessage({
                message: `Gagal mengubah status ${role} ${userId}: ${error.message}`,
                type: 'error'
            });
            // Tidak perlu return di sini, lanjutkan dengan update UI jika error tidak kritis
            return;
        }

        // 3. Jika berhasil, update state lokal dan tampilkan notifikasi
        setAlertMessage({
            message: `Status ${role} ${userId} berhasil diubah menjadi ${newStatus === 'good' ? 'Baik' : 'Buruk'}.`,
            type: 'success'
        });

        const updateFn = (prevUsers: AdminUser[]) =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            );

        if (role === 'pembeli') {
            setBuyerUsers(updateFn);
        } else {
            setSellerUsers(updateFn);
        }

        // Hapus notifikasi setelah 5 detik
        setTimeout(() => setAlertMessage(null), 5000);
    };

    // Fungsi handler filter/search Pembeli
    const handleBuyerFilterChange = (value: string) => {
        setBuyerStatusFilter(value);
        setBuyerCurrentPage(1);
    };

    const handleBuyerSearchChange = (value: string) => {
        setBuyerSearchQuery(value);
        setBuyerCurrentPage(1);
    };

    // Fungsi handler filter/search Penjual
    const handleSellerFilterChange = (value: string) => {
        setSellerStatusFilter(value);
        setSellerCurrentPage(1);
    };

    const handleSellerSearchChange = (value: string) => {
        setSellerSearchQuery(value);
        setSellerCurrentPage(1);
    };

    // Fungsi render pagination yang di-reuse
    const renderPagination = (
        currentPage: number,
        totalPages: number,
        filteredLength: number,
        setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
        role: UserRole
    ) => {
        if (filteredLength === 0) return null;

        return (
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                <p className="text-sm text-gray-600">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, filteredLength)}{" "}
                    dari {filteredLength} {role === 'pembeli' ? 'pembeli' : 'penjual'}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                                // Tampilkan halaman saat ini, 1 sebelum, dan 1 sesudah, dan halaman pertama/terakhir
                                return (
                                    page === 1 ||
                                    page === totalPages ||
                                    Math.abs(page - currentPage) <= 1
                                );
                            })
                            .map((page, index, array) => (
                                <div key={page} className="flex items-center">
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                        <span className="px-2 text-gray-400">...</span>
                                    )}
                                    <Button
                                        variant={
                                            currentPage === page ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={
                                            currentPage === page
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : ""
                                        }
                                    >
                                        {page}
                                    </Button>
                                </div>
                            ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                    >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <MainLayoutAdmin>
                <div className="flex flex-col items-center justify-center h-screen bg-white">
                    {/* Spinner */}
                    <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>

                    {/* Text with animation */}
                    <p className="mt-6 text-blue-600 text-lg animate-pulse">
                        Memuat data pengguna...
                    </p>
                </div>
            </MainLayoutAdmin>
        );
    }


    return (
        <MainLayoutAdmin>
            {/* --- Komponen Alert/Notifikasi (BARU) --- */}
            {alertMessage && (
                <div
                    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white ${alertMessage.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
                    role="alert"
                >
                    {alertMessage.message}
                    <button
                        onClick={() => setAlertMessage(null)}
                        className="ml-4 font-bold"
                    >
                        &times;
                    </button>
                </div>
            )}
            {/* --- End Komponen Alert --- */}

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-blue-600">Dashboard Admin</h1>
                    <p className="text-gray-600 mt-1">
                        Kelola pengguna dan pantau aktivitas
                    </p>
                </div>

                {/* Statistik Cards (Menggunakan data gabungan) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Pengguna
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Pengguna Baik
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {stats.good}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Pengguna Buruk
                            </CardTitle>
                            <UserX className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.bad}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabel Pembeli (Buyer) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pembeli</CardTitle>
                        <CardDescription>
                            Kelola dan pantau semua akun pembeli terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search & Filter Pembeli */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Cari username atau email..."
                                    value={buyerSearchQuery}
                                    onChange={(e) => handleBuyerSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={buyerStatusFilter} onValueChange={handleBuyerFilterChange}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="good">Pengguna Baik</SelectItem>
                                    <SelectItem value="bad">Pengguna Buruk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tabel Pembeli */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-50/50">
                                        <TableHead className="font-semibold">Username</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedBuyerUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                Tidak ada data Pembeli yang ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedBuyerUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-blue-50/30">
                                                <TableCell className="font-medium">
                                                    {user.username}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                                {/* Sel Tombol Aksi Pembeli */}
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Verifikasi (Status Baik)"
                                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            // Pembeli Baik = status 'good'
                                                            disabled={user.status === 'good'}
                                                            onClick={() => handleStatusChange(user.id, 'pembeli', 'good')}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Tolak (Status Buruk)"
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            // Pembeli Buruk = status 'bad'
                                                            disabled={user.status === 'bad'}
                                                            onClick={() => handleStatusChange(user.id, 'pembeli', 'bad')}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Pembeli */}
                        {renderPagination(
                            buyerCurrentPage,
                            buyerTotalPages,
                            filteredBuyerUsers.length,
                            setBuyerCurrentPage,
                            'pembeli'
                        )}
                    </CardContent>
                </Card>


                {/* Tabel Penjual (Seller) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Penjual</CardTitle>
                        <CardDescription>
                            Kelola dan pantau semua akun penjual terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search & Filter Penjual */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Cari username atau email..."
                                    value={sellerSearchQuery}
                                    onChange={(e) => handleSellerSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={sellerStatusFilter} onValueChange={handleSellerFilterChange}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="good">Pengguna Baik</SelectItem>
                                    <SelectItem value="bad">Pengguna Buruk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tabel Penjual */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-50/50">
                                        <TableHead className="font-semibold">Username</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedSellerUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                Tidak ada data Penjual yang ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedSellerUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-blue-50/30">
                                                <TableCell className="font-medium">
                                                    {user.username}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                                {/* Sel Tombol Aksi Penjual */}
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Verifikasi (Status Baik)"
                                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            // Penjual Baik = status 'good' (profil.status=FALSE)
                                                            disabled={user.status === 'good'}
                                                            onClick={() => handleStatusChange(user.id, 'penjual', 'good')}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Tolak (Status Buruk)"
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            // Penjual Buruk = status 'bad' (profil.status=TRUE)
                                                            disabled={user.status === 'bad'}
                                                            onClick={() => handleStatusChange(user.id, 'penjual', 'bad')}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Penjual */}
                        {renderPagination(
                            sellerCurrentPage,
                            sellerTotalPages,
                            filteredSellerUsers.length,
                            setSellerCurrentPage,
                            'penjual'
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayoutAdmin>
    );
}