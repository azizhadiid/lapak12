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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Penjualan } from "@/lib/types/pencatatan";
import { toast } from "sonner";

export default function TambahPencatatanPage() {
    const supabase = createClientComponentClient();

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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        try {
            // ✅ Dapatkan user login
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Gagal mendapatkan user. Pastikan Anda sudah login.");
            }

            const newPencatatan: Penjualan = {
                user_id: user.id,
                tanggal: formData.tanggal,
                kategori: formData.kategori,
                nama_produk: formData.namaProduk,
                jumlah: parseInt(formData.jumlah),
                harga_satuan: parseInt(formData.hargaSatuan),
                total_harga: parseInt(formData.jumlah) * parseInt(formData.hargaSatuan),
                nama_pembeli: formData.pembeli,
                metode_pembayaran: formData.metodePembayaran,
            };

            // ✅ Simpan ke tabel penjualan
            const { error } = await supabase.from("penjualan").insert(newPencatatan);

            if (error) throw error;

            toast.success("Pencatatan berhasil disimpan!");
            window.location.href = "/penjual/pencatatan";
        } catch (err: any) {
            console.error(err);
            toast.error(`Gagal menyimpan data: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
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