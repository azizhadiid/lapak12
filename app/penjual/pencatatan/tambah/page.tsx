"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import MainLayoutPenjual from "@/components/penjual/MainLayoutPenjual";

// Tipe data (bisa juga diimpor dari file shared)
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

export default function TambahPencatatanPage() {
    // const router = useRouter(); // <- Hapus router

    // State khusus untuk form tambah ini
    const [formData, setFormData] = useState({
        tanggal: "",
        namaProduk: "",
        kategori: "",
        jumlah: "",
        hargaSatuan: "",
        pembeli: "",
        metodePembayaran: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    // Helper format currency
    const formatCurrency = (amount: number) => {
        if (isNaN(amount)) return "Rp 0";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Handle form submit (hanya untuk logic 'Tambah Baru')
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        const newPencatatan: PencatatanPenjualan = {
            id: Date.now().toString(), // ID unik sementara
            tanggal: formData.tanggal,
            namaProduk: formData.namaProduk,
            kategori: formData.kategori,
            jumlah: parseInt(formData.jumlah),
            hargaSatuan: parseInt(formData.hargaSatuan),
            totalHarga: parseInt(formData.jumlah) * parseInt(formData.hargaSatuan),
            pembeli: formData.pembeli,
            metodePembayaran: formData.metodePembayaran,
        };

        // --- SIMULASI ---
        // Di aplikasi nyata, Anda akan memanggil API untuk menyimpan data ke database.
        // State 'pencatatan' ada di halaman sebelumnya, jadi kita tidak bisa
        // langsung menambahkannya di sini. Halaman list idealnya akan
        // mengambil data terbaru (re-fetch) saat dibuka.

        console.log("Data Baru Akan Disimpan:", newPencatatan);

        // Simulasi waktu tunggu API
        setTimeout(() => {
            setIsLoading(false);
            console.log("Data berhasil disimpan (simulasi)");

            // Tampilkan notifikasi sukses (misalnya: 'toast') di sini jika ada

            // Navigasi kembali ke halaman list
            // router.push('/penjual/pencatatan'); // <- Ganti ini
            window.location.href = '/penjual/pencatatan'; // <- Gunakan ini
        }, 1000);
    };

    // Hitung total harga untuk ditampilkan
    const totalHarga = (formData.jumlah && formData.hargaSatuan)
        ? parseInt(formData.jumlah) * parseInt(formData.hargaSatuan)
        : 0;

    return (
        <MainLayoutPenjual>
            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                {/* Header Halaman dengan Tombol Back */}
                <div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mb-4"
                        onClick={() => window.history.back()} // MODIFIKASI: Kembali ke halaman sebelumnya
                        disabled={isLoading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Kembali
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Pencatatan Baru</h1>
                    <p className="text-base text-gray-500 mt-1">
                        Isi form di bawah untuk menambahkan pencatatan penjualan baru.
                    </p>
                </div>

                {/* Form dalam Card */}
                <Card>
                    <CardContent className="pt-6">
                        {/* Ini adalah form yang sama persis dari Dialog */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal">Tanggal *</Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        required
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kategori">Kategori *</Label>
                                    <Select
                                        value={formData.kategori}
                                        onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                                        required
                                        disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        disabled={isLoading}
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
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {totalHarga > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-blue-600 font-medium">Total Harga</div>
                                    <div className="text-2xl font-bold text-blue-700 mt-1">
                                        {formatCurrency(totalHarga)}
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
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="metodePembayaran">Metode Pembayaran *</Label>
                                <Select
                                    value={formData.metodePembayaran}
                                    onValueChange={(value) => setFormData({ ...formData, metodePembayaran: value })}
                                    required
                                    disabled={isLoading}
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

                            {/* Tombol Footer Form */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()} // MODIFIKASI
                                    disabled={isLoading}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-900">
                                    {isLoading ? "Menyimpan..." : "Simpan Pencatatan"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayoutPenjual>
    );
}