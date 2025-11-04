"use client";

import { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, ChevronLeft, ChevronRight, Calendar, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Tipe data untuk pencatatan penjualan
interface PencatatanPenjualan {
    id: string;
    tanggal: string;
    namaProduk: string;
    kategori: string;
    jumlah: number;
    hargaSatuan: number;
    totalHarga: number;
    pembeli: string;
    metodePembayaran: string;
}

// Data dummy untuk contoh
const dummyData: PencatatanPenjualan[] = [
    {
        id: "1",
        tanggal: "2024-11-01",
        namaProduk: "Keripik Singkong",
        kategori: "Makanan",
        jumlah: 5,
        hargaSatuan: 15000,
        totalHarga: 75000,
        pembeli: "Ibu Siti",
        metodePembayaran: "Tunai",
    },
    {
        id: "2",
        tanggal: "2024-11-02",
        namaProduk: "Sambal Botol",
        kategori: "Makanan",
        jumlah: 3,
        hargaSatuan: 25000,
        totalHarga: 75000,
        pembeli: "Pak Budi",
        metodePembayaran: "Transfer",
    },
    {
        id: "3",
        tanggal: "2024-11-03",
        namaProduk: "Tas Rajut",
        kategori: "Kerajinan",
        jumlah: 1,
        hargaSatuan: 150000,
        totalHarga: 150000,
        pembeli: "Ibu Ani",
        metodePembayaran: "E-Wallet",
    },
];

export default function PencatatanPageComponent() {
    const [pencatatan, setPencatatan] = useState<PencatatanPenjualan[]>(dummyData);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        tanggal: "",
        namaProduk: "",
        kategori: "",
        jumlah: "",
        hargaSatuan: "",
        pembeli: "",
        metodePembayaran: "",
    });

    const itemsPerPage = 10;

    // Filter data berdasarkan search query
    const filteredData = pencatatan.filter((item) =>
        item.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pembeli.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newPencatatan: PencatatanPenjualan = {
            id: editingId || Date.now().toString(),
            tanggal: formData.tanggal,
            namaProduk: formData.namaProduk,
            kategori: formData.kategori,
            jumlah: parseInt(formData.jumlah),
            hargaSatuan: parseInt(formData.hargaSatuan),
            totalHarga: parseInt(formData.jumlah) * parseInt(formData.hargaSatuan),
            pembeli: formData.pembeli,
            metodePembayaran: formData.metodePembayaran,
        };

        if (editingId) {
            // Update existing
            setPencatatan(pencatatan.map(item =>
                item.id === editingId ? newPencatatan : item
            ));
        } else {
            // Add new
            setPencatatan([newPencatatan, ...pencatatan]);
        }

        // Reset form
        setFormData({
            tanggal: "",
            namaProduk: "",
            kategori: "",
            jumlah: "",
            hargaSatuan: "",
            pembeli: "",
            metodePembayaran: "",
        });
        setEditingId(null);
        setIsDialogOpen(false);
    };

    // Handle edit
    const handleEdit = (item: PencatatanPenjualan) => {
        setFormData({
            tanggal: item.tanggal,
            namaProduk: item.namaProduk,
            kategori: item.kategori,
            jumlah: item.jumlah.toString(),
            hargaSatuan: item.hargaSatuan.toString(),
            pembeli: item.pembeli,
            metodePembayaran: item.metodePembayaran,
        });
        setEditingId(item.id);
        setIsDialogOpen(true);
    };

    // Handle delete
    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            setPencatatan(pencatatan.filter(item => item.id !== id));
        }
    };

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
                                {formatCurrency(pencatatan.reduce((sum, item) => sum + item.totalHarga, 0))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-gray-500">Bulan Ini</div>
                            <div className="text-2xl font-bold text-blue-600 mt-2">
                                {pencatatan.filter(item =>
                                    new Date(item.tanggal).getMonth() === new Date().getMonth()
                                ).length}
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

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({
                                        tanggal: "",
                                        namaProduk: "",
                                        kategori: "",
                                        jumlah: "",
                                        hargaSatuan: "",
                                        pembeli: "",
                                        metodePembayaran: "",
                                    });
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Pencatatan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingId ? "Edit Pencatatan" : "Tambah Pencatatan Baru"}
                                </DialogTitle>
                                <DialogDescription>
                                    Isi form di bawah untuk {editingId ? "mengupdate" : "menambahkan"} pencatatan penjualan
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal">Tanggal *</Label>
                                        <Input
                                            id="tanggal"
                                            type="date"
                                            required
                                            value={formData.tanggal}
                                            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="kategori">Kategori *</Label>
                                        <Select
                                            value={formData.kategori}
                                            onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Makanan">Makanan</SelectItem>
                                                <SelectItem value="Minuman">Minuman</SelectItem>
                                                <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                                                <SelectItem value="Fashion">Fashion</SelectItem>
                                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="namaProduk">Nama Produk *</Label>
                                    <Input
                                        id="namaProduk"
                                        placeholder="Contoh: Keripik Singkong"
                                        required
                                        value={formData.namaProduk}
                                        onChange={(e) => setFormData({ ...formData, namaProduk: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="jumlah">Jumlah *</Label>
                                        <Input
                                            id="jumlah"
                                            type="number"
                                            min="1"
                                            placeholder="0"
                                            required
                                            value={formData.jumlah}
                                            onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hargaSatuan">Harga Satuan (Rp) *</Label>
                                        <Input
                                            id="hargaSatuan"
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            required
                                            value={formData.hargaSatuan}
                                            onChange={(e) => setFormData({ ...formData, hargaSatuan: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {formData.jumlah && formData.hargaSatuan && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="text-sm text-blue-600 font-medium">Total Harga</div>
                                        <div className="text-2xl font-bold text-blue-700 mt-1">
                                            {formatCurrency(parseInt(formData.jumlah) * parseInt(formData.hargaSatuan))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="pembeli">Nama Pembeli *</Label>
                                    <Input
                                        id="pembeli"
                                        placeholder="Contoh: Ibu Siti"
                                        required
                                        value={formData.pembeli}
                                        onChange={(e) => setFormData({ ...formData, pembeli: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="metodePembayaran">Metode Pembayaran *</Label>
                                    <Select
                                        value={formData.metodePembayaran}
                                        onValueChange={(value) => setFormData({ ...formData, metodePembayaran: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih metode pembayaran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Tunai">Tunai</SelectItem>
                                            <SelectItem value="Transfer">Transfer Bank</SelectItem>
                                            <SelectItem value="E-Wallet">E-Wallet (GoPay, OVO, dll)</SelectItem>
                                            <SelectItem value="QRIS">QRIS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            setEditingId(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit">
                                        {editingId ? "Update" : "Simpan"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
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
                                                <TableCell>{item.namaProduk}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {item.kategori}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">{item.jumlah}</TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.hargaSatuan)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-green-600">
                                                    {formatCurrency(item.totalHarga)}
                                                </TableCell>
                                                <TableCell>{item.pembeli}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {item.metodePembayaran}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(item)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(item.id)}
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari{" "}
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
        </MainLayoutPenjual>
    );
}