"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // <-- Import useRouter
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
import {
    Calendar, Package, Tag, Users, Wallet, Boxes,
    DollarSign, Loader2, AlertCircle, TrendingUp, Minus
} from "lucide-react"; // <-- Import Ikon-ikon baru
import MainLayoutPenjual from "@/components/penjual/MainLayoutPenjual";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

// --- Tipe Data Produk untuk Dropdown ---
interface PenjualProduct {
    id: string; // Ini akan jadi produk_id di tabel penjualan
    nama_produk: string;
    harga: number; // harga di database adalah NUMERIC(10, 2)
    jenis_produk: string; // Kategori produk
    stok: number;
}

export default function TambahPencatatanPage() {
    const supabase = createClientComponentClient();
    const router = useRouter(); // <-- Inisialisasi router

    // State untuk data yang difetch
    const [sellerProducts, setSellerProducts] = useState<PenjualProduct[]>([]);
    const [isProductLoading, setIsProductLoading] = useState(true);

    // State khusus untuk form tambah ini
    const [formData, setFormData] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        produkId: "",
        namaProdukHistory: "",
        kategori: "",
        jumlah: "",
        hargaSatuan: "",
        pembeli: "",
        metodePembayaran: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    // Helper format currency
    const formatCurrency = (amount: number) => {
        if (isNaN(amount) || amount === 0) return "Rp 0";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // --- FETCH PRODUK MILIK PENJUAL YANG SEDANG LOGIN ---
    useEffect(() => {
        const fetchSellerProducts = async () => {
            setIsProductLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Anda harus login sebagai Penjual untuk mencatat penjualan.");
                setIsProductLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('produk')
                    .select('id, nama_produk, harga, jenis_produk, stok')
                    .eq('penjual_id', user.id)
                    .order('nama_produk', { ascending: true });

                if (error) throw error;

                const mappedData: PenjualProduct[] = (data ?? []).map(p => ({
                    id: p.id,
                    nama_produk: p.nama_produk,
                    harga: parseFloat(p.harga),
                    jenis_produk: p.jenis_produk,
                    stok: p.stok,
                }));

                setSellerProducts(mappedData);

            } catch (err: unknown) {
                console.error("Error fetching seller products:", err);

                if (err instanceof Error) {
                    toast.error("Gagal memuat daftar produk: " + err.message);
                } else {
                    toast.error("Gagal memuat daftar produk");
                }
            } finally {
                setIsProductLoading(false);
            }
        };

        fetchSellerProducts();
    }, [supabase]);

    // --- HANDLER SAAT PRODUK DIPILIH ---
    const handleProductSelect = (selectedProductId: string) => {
        const selectedProduct = sellerProducts.find(p => p.id === selectedProductId);

        if (selectedProduct) {
            setFormData({
                ...formData,
                produkId: selectedProductId,
                namaProdukHistory: selectedProduct.nama_produk,
                kategori: selectedProduct.jenis_produk || "Lainnya",
                hargaSatuan: selectedProduct.harga.toString(),
                jumlah: "", // Reset jumlah jika produk berganti
            });
        }
    };


    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        const selectedProduct = sellerProducts.find(p => p.id === formData.produkId);

        if (!selectedProduct) {
            toast.error("Pilih produk yang valid.");
            setIsLoading(false);
            return;
        }

        const jumlahJual = parseInt(formData.jumlah);

        // Validasi stok (Front-end check)
        if (jumlahJual > selectedProduct.stok) {
            toast.error(`Stok tidak mencukupi. Sisa stok ${selectedProduct.nama_produk}: ${selectedProduct.stok}`);
            setIsLoading(false);
            return;
        }

        // --- LOGIKA INSERT BARU ---
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Gagal mendapatkan user. Pastikan Anda sudah login.");
            }

            // Hitung total harga
            const total = jumlahJual * parseFloat(formData.hargaSatuan);

            // Data yang akan di-INSERT ke tabel 'penjualan'
            const newPencatatan = {
                penjual_id: user.id,
                produk_id: formData.produkId,
                tanggal: formData.tanggal,
                kategori: formData.kategori,
                nama_produk_history: formData.namaProdukHistory,
                jumlah: jumlahJual,
                harga_satuan: parseFloat(formData.hargaSatuan),
                total_harga: total,
                nama_pembeli: formData.pembeli,
                metode_pembayaran: formData.metodePembayaran,
            };

            // Simpan ke tabel penjualan (Trigger DB akan mengurangi stok)
            const { error: insertError } = await supabase.from("penjualan").insert(newPencatatan);

            if (insertError) {
                // Tangani error dari trigger atau database
                const errorMessage = insertError.message.includes("Stok produk")
                    ? `Gagal mencatat: ${insertError.message}`
                    : `Gagal menyimpan data: ${insertError.message}`;

                toast.error(errorMessage); // Tampilkan pesan error spesifik
            } else {
                // Sukses
                toast.success("Pencatatan berhasil disimpan dan stok produk telah dikurangi!");
                router.push('/penjual/pencatatan'); // <-- Navigasi ke halaman daftar
            }

        } catch (err: unknown) {
            console.error(err);

            let errorMessage = "Terjadi kesalahan yang tidak terduga saat menyimpan data.";

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === "string") {
                errorMessage = err;
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    // Hitung total harga untuk ditampilkan
    const totalHarga = (formData.jumlah && formData.hargaSatuan)
        ? parseInt(formData.jumlah) * parseFloat(formData.hargaSatuan)
        : 0;

    // Ambil stok saat ini untuk produk yang dipilih
    const currentStok = sellerProducts.find(p => p.id === formData.produkId)?.stok || 0;


    return (
        // Mengubah lebar container menjadi max-w-6xl
        <MainLayoutPenjual>
            <div className="space-y-8 max-w-6xl mx-auto py-8 md:py-12">
                {/* Header Halaman (Tombol Kembali Dihapus) */}
                <div className="border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Catat Penjualan Baru
                    </h1>
                    <p className="text-lg text-gray-500 mt-2">
                        Pencatatan ini akan otomatis mengurangi stok produk Anda.
                    </p>
                </div>

                {/* Form dalam Card (Lebar Penuh) */}
                <Card className="shadow-2xl border-t-4 border-blue-600 rounded-lg">
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Baris 1: Tanggal & Kategori */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal" className="flex items-center text-gray-700 font-semibold">
                                        <Calendar className="h-4 w-4 mr-2 text-blue-600" /> Tanggal *
                                    </Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        required
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        disabled={isLoading}
                                        className="py-6 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kategori" className="flex items-center text-gray-700 font-semibold">
                                        <Boxes className="h-4 w-4 mr-2 text-blue-600" /> Kategori (Otomatis)
                                    </Label>
                                    <Input
                                        id="kategori"
                                        value={formData.kategori || "Pilih Produk Dulu"}
                                        readOnly
                                        disabled
                                        className="py-6 text-base bg-gray-100 italic"
                                    />
                                </div>
                            </div>

                            {/* Baris 2: Pilih Produk */}
                            <div className="space-y-2">
                                <Label htmlFor="produkId" className="flex items-center text-gray-700 font-semibold">
                                    <Package className="h-4 w-4 mr-2 text-blue-600" /> Pilih Produk *
                                </Label>
                                <Select
                                    value={formData.produkId}
                                    onValueChange={handleProductSelect}
                                    required
                                    disabled={isLoading || isProductLoading || sellerProducts.length === 0}
                                >
                                    <SelectTrigger id="produkId" className="py-6 text-base">
                                        {isProductLoading ? (
                                            <span className="flex items-center text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat Produk Anda...</span>
                                        ) : (
                                            <SelectValue placeholder="Pilih produk yang terjual" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sellerProducts.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={product.id}
                                                disabled={product.stok === 0}
                                            >
                                                {product.nama_produk} {product.stok === 0 ? "(Stok Habis)" : `(Stok: ${product.stok})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {sellerProducts.length === 0 && !isProductLoading && (
                                    <p className="text-sm text-red-500 flex items-center mt-2">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        Anda belum memiliki produk. Silakan tambahkan produk untuk mencatat penjualan.
                                    </p>
                                )}
                            </div>

                            {/* Baris 3: Harga, Jumlah, Total */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* HARGA SATUAN (Read Only) */}
                                <div className="space-y-2">
                                    <Label htmlFor="hargaSatuan" className="flex items-center text-gray-700 font-semibold">
                                        <Tag className="h-4 w-4 mr-2 text-blue-600" /> Harga Satuan (Otomatis)
                                    </Label>
                                    <Input
                                        id="hargaSatuan"
                                        type="text"
                                        value={formatCurrency(parseFloat(formData.hargaSatuan || '0'))}
                                        readOnly
                                        disabled
                                        className="py-6 text-base bg-gray-100 italic"
                                    />
                                </div>
                                {/* JUMLAH JUAL */}
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah" className="flex items-center text-gray-700 font-semibold">
                                        <Minus className="h-4 w-4 mr-2 text-blue-600" /> Jumlah Jual *
                                    </Label>
                                    <Input
                                        id="jumlah"
                                        type="number"
                                        min="1"
                                        max={currentStok > 0 ? currentStok : undefined}
                                        placeholder="0"
                                        required
                                        value={formData.jumlah}
                                        onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                                        disabled={isLoading || !formData.produkId || currentStok === 0}
                                        className="py-6 text-base"
                                    />
                                    {formData.produkId && (
                                        <p className="text-xs text-gray-500 mt-1">Stok Tersedia: {currentStok}</p>
                                    )}
                                </div>
                                {/* TOTAL HARGA */}
                                <div className="space-y-2">
                                    <Label htmlFor="totalHarga" className="flex items-center text-gray-700 font-semibold">
                                        <DollarSign className="h-4 w-4 mr-2 text-blue-600" /> Total Harga
                                    </Label>
                                    <Input
                                        id="totalHarga"
                                        type="text"
                                        value={formatCurrency(totalHarga)}
                                        readOnly
                                        disabled
                                        className="py-6 text-base bg-blue-50 font-bold border-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Baris 4: Nama Pembeli & Metode Pembayaran */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="pembeli" className="flex items-center text-gray-700 font-semibold">
                                        <Users className="h-4 w-4 mr-2 text-blue-600" /> Nama Pembeli *
                                    </Label>
                                    <Input
                                        id="pembeli"
                                        placeholder="Contoh: Ibu Siti"
                                        required
                                        value={formData.pembeli}
                                        onChange={(e) => setFormData({ ...formData, pembeli: e.target.value })}
                                        disabled={isLoading}
                                        className="py-6 text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="metodePembayaran" className="flex items-center text-gray-700 font-semibold">
                                        <Wallet className="h-4 w-4 mr-2 text-blue-600" /> Metode Pembayaran *
                                    </Label>
                                    <Select
                                        value={formData.metodePembayaran}
                                        onValueChange={(value) => setFormData({ ...formData, metodePembayaran: value })}
                                        required
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="py-6 text-base">
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
                            </div>

                            {/* Tombol Footer Form */}
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                {/* Tombol Batal Mengganti tombol Kembali */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/penjual/pencatatan')} // <-- Navigasi ke daftar pencatatan
                                    disabled={isLoading}
                                    className="px-6 py-3 text-base"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !formData.produkId || currentStok === 0}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Simpan Pencatatan
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayoutPenjual>
    );
}