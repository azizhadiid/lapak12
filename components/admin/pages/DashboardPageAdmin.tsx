"use client";

import { useState, useMemo } from "react";
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

// Tipe data user
type UserStatus = "good" | "bad" | "neutral";

interface User {
    id: string;
    username: string;
    email: string;
    status: UserStatus;
    joinDate: string;
    lastActive: string;
}

// Data dummy untuk demo
const generateDummyUsers = (): User[] => {
    const statuses: UserStatus[] = ["good", "bad", "neutral"];
    const users: User[] = [];

    for (let i = 1; i <= 50; i++) {
        users.push({
            id: `user-${i}`,
            username: `user${i}`,
            email: `user${i}@example.com`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
            lastActive: new Date(2025, 10, Math.floor(Math.random() * 6) + 1).toISOString().split('T')[0],
        });
    }

    return users;
};

export default function DashboardAdminPage() {
    // --- PERUBAHAN: Jadikan state agar bisa di-update ---
    const [users, setUsers] = useState<User[]>(generateDummyUsers());
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter dan search
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || user.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [users, searchQuery, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    // Reset page saat filter berubah (tetap sama)
    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // --- BARU: Fungsi untuk mengubah status user ---
    const handleStatusChange = (userId: string, newStatus: UserStatus) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, status: newStatus } : user
            )
        );
    };

    // Statistik
    const stats = useMemo(() => {
        const total = users.length;
        const good = users.filter((u) => u.status === "good").length;
        const bad = users.filter((u) => u.status === "bad").length;

        return { total, good, bad };
    }, [users]);

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

    return (
        <MainLayoutAdmin>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-blue-600">Dashboard Admin</h1>
                    <p className="text-gray-600 mt-1">
                        Kelola pengguna dan pantau aktivitas
                    </p>
                </div>

                {/* Statistik Cards */}
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

                {/* Tabel User */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pembeli</CardTitle>
                        <CardDescription>
                            Kelola dan pantau semua akun pembeli terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search & Filter */}
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
                                    <SelectItem value="good">Pengguna Baik</SelectItem>
                                    <SelectItem value="bad">Pengguna Buruk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tabel */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-50/50">
                                        <TableHead className="font-semibold">Username</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Tgl Gabung</TableHead>
                                        <TableHead className="font-semibold">Aktif Terakhir</TableHead>
                                        {/* --- BARU: Kolom Aksi --- */}
                                        <TableHead className="font-semibold text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6} // <-- PERUBAHAN: dari 5 ke 6
                                                className="text-center py-8 text-gray-500"
                                            >
                                                Tidak ada data yang ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-blue-50/30">
                                                <TableCell className="font-medium">
                                                    {user.username}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                                <TableCell className="text-gray-600">
                                                    {user.joinDate}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {user.lastActive}
                                                </TableCell>
                                                {/* --- BARU: Sel Tombol Aksi --- */}
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Verifikasi (User Baik)"
                                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            // Nonaktifkan tombol jika statusnya sudah 'good'
                                                            disabled={user.status === 'good'}
                                                            onClick={() => handleStatusChange(user.id, 'good')}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Tolak (User Buruk)"
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            // Nonaktifkan tombol jika statusnya sudah 'bad'
                                                            disabled={user.status === 'bad'}
                                                            onClick={() => handleStatusChange(user.id, 'bad')}
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

                        {/* Pagination */}
                        {filteredUsers.length > 0 && (
                            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                                <p className="text-sm text-gray-600">
                                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}{" "}
                                    dari {filteredUsers.length} pengguna
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
                                                // Tampilkan halaman saat ini, 1 sebelum, dan 1 sesudah
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
                        )}
                    </CardContent>
                </Card>


                {/* Penjual */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Penjual</CardTitle>
                        <CardDescription>
                            Kelola dan pantau semua akun penjual terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search & Filter */}
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
                                    <SelectItem value="good">User Baik</SelectItem>
                                    <SelectItem value="bad">User Buruk</SelectItem>
                                    <SelectItem value="neutral">User Netral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tabel */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-50/50">
                                        <TableHead className="font-semibold">Username</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Tgl Gabung</TableHead>
                                        <TableHead className="font-semibold">Aktif Terakhir</TableHead>
                                        {/* --- BARU: Kolom Aksi --- */}
                                        <TableHead className="font-semibold text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6} // <-- PERUBAHAN: dari 5 ke 6
                                                className="text-center py-8 text-gray-500"
                                            >
                                                Tidak ada data yang ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-blue-50/30">
                                                <TableCell className="font-medium">
                                                    {user.username}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                                <TableCell className="text-gray-600">
                                                    {user.joinDate}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {user.lastActive}
                                                </TableCell>
                                                {/* --- BARU: Sel Tombol Aksi --- */}
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Verifikasi (User Baik)"
                                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            // Nonaktifkan tombol jika statusnya sudah 'good'
                                                            disabled={user.status === 'good'}
                                                            onClick={() => handleStatusChange(user.id, 'good')}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Tolak (User Buruk)"
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            // Nonaktifkan tombol jika statusnya sudah 'bad'
                                                            disabled={user.status === 'bad'}
                                                            onClick={() => handleStatusChange(user.id, 'bad')}
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

                        {/* Pagination */}
                        {filteredUsers.length > 0 && (
                            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                                <p className="text-sm text-gray-600">
                                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}{" "}
                                    dari {filteredUsers.length} pengguna
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
                                                // Tampilkan halaman saat ini, 1 sebelum, dan 1 sesudah
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayoutAdmin>
    );
}