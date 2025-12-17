'use client';

import { useState, useMemo, useEffect } from "react";
// Ganti Layout ke MainLayoutPembeli
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
} from "lucide-react";
import supabase from "@/lib/db";
import MainLayoutPenjual from "../MainLayoutPenjual";

// --- Tipe data yang direvisi (Hanya fokus pada Pembeli) ---
type UserStatus = "good" | "bad" | "neutral";
type UserRole = "pembeli"; // Hanya Pembeli

interface SellerUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    joinDate: string;
    lastActive: string;
}

// --- Fungsi Fetch Data Pembeli Saja ---
const fetchSellerUsers = async () => {
    // Menggunakan View yang sama, tetapi kita filter di client side 
    // karena view `admin_dashboard_users` sudah menggabungkan kedua role.
    const { data, error } = await supabase
        .from('admin_dashboard_users')
        .select('*')
        .eq('role', 'pembeli'); // Filter hanya untuk penjual di sini

    if (error) {
        console.error("Error fetching seller data:", error);
        throw error;
    }

    return {
        sellerUsers: data as SellerUser[],
        totalSellers: data.length,
    };
};

export default function ManajemenPenjualPage() {
    // --- State untuk Data Penjual ---
    const [sellerUsers, setSellerUsers] = useState<SellerUser[]>([]);
    const [totalSellers, setTotalSellers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [, setAlertMessage] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // --- State untuk Filter/Pagination Penjual ---
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Efek untuk Fetch Data saat komponen dimuat ---
    useEffect(() => {
        setIsLoading(true);
        fetchSellerUsers().then(data => {
            setSellerUsers(data.sellerUsers);
            setTotalSellers(data.totalSellers);
            setIsLoading(false);
        }).catch(err => {
            console.error("Gagal memuat data penjual:", err);
            setIsLoading(false);
            setAlertMessage({ message: "Gagal memuat data. Periksa koneksi dan hak akses RLS.", type: 'error' });
        });
    }, []);

    // --- Logika Status Badge (Tetap sama) ---
    const getStatusBadge = (status: UserStatus) => {
        switch (status) {
            case "good":
                // Status Baik untuk Penjual (profil.status=FALSE)
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Direkomendasikan</Badge>;
            case "bad":
                // Status Buruk untuk Penjual (profil.status=TRUE)
                return <Badge className="bg-red-500 hover:bg-red-600">Tidak Direkomendasikan</Badge>;
            default:
                return <Badge variant="secondary">Netral</Badge>;
        }
    };

    // --- Logika Filter dan Search Penjual ---
    const filteredSellerUsers = useMemo(() => {
        return sellerUsers.filter((user) => {
            const matchesSearch =
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || user.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [sellerUsers, searchQuery, statusFilter]);

    // --- Logika Pagination Penjual ---
    const totalPages = Math.ceil(filteredSellerUsers.length / itemsPerPage);
    const paginatedSellerUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSellerUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSellerUsers, currentPage]);

    // --- Statisik Penjual Saja ---
    const stats = useMemo(() => {
        const good = sellerUsers.filter((u) => u.status === "good").length;
        const bad = sellerUsers.filter((u) => u.status === "bad").length;

        return { total: totalSellers, good, bad };
    }, [sellerUsers, totalSellers]);

    // Fungsi handler filter/search Penjual
    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };


    // Fungsi render pagination yang di-reuse
    const renderPagination = (
        currentPage: number,
        totalPages: number,
        filteredLength: number,
        setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    ) => {
        if (filteredLength === 0) return null;

        // Logika pagination yang disederhanakan
        const endIndex = currentPage * itemsPerPage;
        const startIndex = (currentPage - 1) * itemsPerPage;

        return (
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                <p className="text-sm text-gray-600">
                    Menampilkan {startIndex + 1} -{" "}
                    {Math.min(endIndex, filteredLength)}{" "}
                    dari {filteredLength} penjual
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
                        {/* Menampilkan hanya tombol halaman penting */}
                        {[...Array(totalPages)].map((_, i) => i + 1)
                            .filter(page => Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages)
                            .map((page, index, array) => (
                                <div key={page} className="flex items-center">
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                        <span className="px-2 text-gray-400">...</span>
                                    )}
                                    <Button
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                                    >
                                        {page}
                                    </Button>
                                </div>
                            ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
            <MainLayoutPenjual>
                <div className="flex flex-col items-center justify-center h-screen bg-white">
                    <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-6 text-blue-600 text-lg animate-pulse">
                        Memuat data penjual...
                    </p>
                </div>
            </MainLayoutPenjual>
        );
    }


    return (
        <MainLayoutPenjual>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-blue-600">Manajemen Pembeli</h1>
                    <p className="text-gray-600 mt-1">
                        Daftar dan status akun pembeli
                    </p>
                </div>

                {/* Statistik Cards Pembeli */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Akun Pembeli
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
                                Pembeli Direkomendasikan
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
                                Pembeli Tidak Direkomendasikan
                            </CardTitle>
                            <UserX className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.bad}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabel Pembeli (Seller) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Akun Pembeli</CardTitle>
                        <CardDescription>
                            Gunakan tombol aksi untuk mengubah status verifikasi Pembeli.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search & Filter Pembeli */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Cari username atau email..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="good">Direkomendasikan</SelectItem>
                                    <SelectItem value="bad">Tidak Direkomendasikan</SelectItem>
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedSellerUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                Tidak ada data Pembeli yang ditemukan
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
                                                {/* Sel Tombol Aksi Pembeli */}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Pembeli */}
                        {renderPagination(
                            currentPage,
                            totalPages,
                            filteredSellerUsers.length,
                            setCurrentPage
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayoutPenjual>
    );
}