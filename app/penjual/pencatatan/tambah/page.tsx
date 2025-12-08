"use client";

import { useState, useEffect } from "react"; // Tambahkan useEffect
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
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react"; // Tambahkan Loader2, AlertCircle
import MainLayoutPenjual from "@/components/penjual/MainLayoutPenjual";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { Penjualan } from "@/lib/types/pencatatan"; // Tidak perlu diubah jika hanya interface lokal
import { toast } from "sonner";

// --- Tipe Data Produk untuk Dropdown ---
interface PenjualProduct {
    id: string; // Ini akan jadi produk_id di tabel penjualan
    nama_produk: string;
    harga: number; // harga di database adalah NUMERIC(10, 2), kita asumsikan di sini number
    jenis_produk: string; // Kategori produk
    stok: number;
}

export default function TambahPencatatanPage() {
    const supabase = createClientComponentClient();

    // State untuk data yang difetch
    const [sellerProducts, setSellerProducts] = useState<PenjualProduct[]>([]);
    const [isProductLoading, setIsProductLoading] = useState(true);

    // State khusus untuk form tambah ini (Diperbarui)
    const [formData, setFormData] = useState({
        tanggal: new Date().toISOString().split('T')[0], // Default hari ini
        produkId: "", // ID Produk yang dipilih
        namaProdukHistory: "", // Nama produk (history)
        kategori: "", // Kategori (akan diisi otomatis)
        jumlah: "",
        hargaSatuan: "", // Harga Satuan (akan diisi otomatis)
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
                // Fetch produk hanya milik penjual yang sedang login (penjual_id = user.id)
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

            } catch (err: any) {
                console.error("Error fetching seller products:", err);
                toast.error("Gagal memuat daftar produk: " + err.message);
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
                kategori: selectedProduct.jenis_produk || "Lainnya", // Asumsi default jika null
                hargaSatuan: selectedProduct.harga.toString(),
                jumlah: "", // Reset jumlah jika produk berganti
            });
        }
    };


    // Handle form submit (hanya untuk logic 'Tambah Baru')
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

        // Validasi stok sebelum insert (Front-end check)
        if (jumlahJual > selectedProduct.stok) {
            // Database trigger akan mencegah ini, tapi cek di front-end memberikan UX yang lebih baik
            toast.error(`Stok tidak mencukupi. Sisa stok ${selectedProduct.nama_produk}: ${selectedProduct.stok}`);
            setIsLoading(false);
            return;
        }

        // --- LOGIKA INSERT BARU ---
        try {
            // ✅ Dapatkan user login
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Gagal mendapatkan user. Pastikan Anda sudah login.");
            }

            // Data yang akan di-INSERT ke tabel 'penjualan'
            const newPencatatan = {
                // Kolom Foreign Key ke DB
                penjual_id: user.id, // ID Penjual (yang juga merupakan ID user)
                produk_id: formData.produkId, // ID Produk yang dipilih

                // Kolom Data Penjualan
                tanggal: formData.tanggal,
                kategori: formData.kategori,
                nama_produk_history: formData.namaProdukHistory, // Menyimpan nama untuk riwayat
                jumlah: jumlahJual,
                harga_satuan: parseFloat(formData.hargaSatuan),
                total_harga: jumlahJual * parseFloat(formData.hargaSatuan),
                nama_pembeli: formData.pembeli,
                metode_pembayaran: formData.metodePembayaran,
            };

            // ✅ Simpan ke tabel penjualan
            // PENTING: Jika INSERT berhasil, database trigger akan OTOMATIS mengurangi stok produk
            const { error: insertError } = await supabase.from("penjualan").insert(newPencatatan);

            if (insertError) {
                // Tangani error dari trigger (misal: stok habis)
                if (insertError.message.includes("Stok produk")) {
                    toast.error(`Gagal mencatat: ${insertError.message}`);
                } else {
                    throw insertError;
                }
            } else {
                // Success
                toast.success("Pencatatan berhasil disimpan dan stok produk telah dikurangi!");
                // Refresh halaman untuk memperbarui daftar produk (dan stok yang ditampilkan)
                window.location.reload();
            }

        } catch (err: any) {
            console.error(err);
            // Tambahkan penanganan pesan error yang lebih umum
            const errorMessage = err.message || "Terjadi kesalahan saat menyimpan data.";
            toast.error(`Gagal menyimpan data: ${errorMessage}`);
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
        <MainLayoutPenjual>
            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                {/* Header Halaman dengan Tombol Back */}
                {/* ... (Tidak ada perubahan di sini) ... */}
                <div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mb-4"
                        onClick={() => window.history.back()}
                        disabled={isLoading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Kembali
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Pencatatan Baru</h1>
                    <p className="text-base text-gray-500 mt-1">
                        Pilih produk yang terjual dari daftar produk Anda.
                    </p>
                </div>

                {/* Form dalam Card */}
                <Card>
                    <CardContent className="pt-6">
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
                                    <Label htmlFor="kategori">Kategori (Otomatis)</Label>
                                    {/* Kategori sekarang diisi otomatis dan ReadOnly */}
                                    <Input
                                        id="kategori"
                                        value={formData.kategori || "Pilih Produk Dulu"}
                                        readOnly
                                        disabled
                                        className="bg-gray-100 italic"
                                    />
                                </div>
                            </div>

                            {/* --- MODIFIKASI UTAMA: PILIH PRODUK --- */}
                            <div className="space-y-2">
                                <Label htmlFor="produkId">Pilih Produk *</Label>
                                <Select
                                    value={formData.produkId}
                                    onValueChange={handleProductSelect}
                                    required
                                    disabled={isLoading || isProductLoading || sellerProducts.length === 0}
                                >
                                    <SelectTrigger id="produkId">
                                        {isProductLoading ? (
                                            <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat Produk...</span>
                                        ) : (
                                            <SelectValue placeholder="Pilih produk yang terjual" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sellerProducts.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={product.id}
                                                disabled={product.stok === 0} // Non-aktifkan jika stok 0
                                            >
                                                {product.nama_produk} {product.stok === 0 ? "(Stok Habis)" : `(Stok: ${product.stok})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {sellerProducts.length === 0 && !isProductLoading && (
                                    <p className="text-sm text-red-500 flex items-center mt-1">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        Anda belum memiliki produk. Silakan tambahkan produk terlebih dahulu.
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* HARGA SATUAN (Read Only) */}
                                <div className="space-y-2">
                                    <Label htmlFor="hargaSatuan">Harga Satuan (Rp) (Otomatis)</Label>
                                    <Input
                                        id="hargaSatuan"
                                        type="text"
                                        value={formatCurrency(parseFloat(formData.hargaSatuan || '0'))}
                                        readOnly
                                        disabled
                                        className="bg-gray-100 italic"
                                    />
                                </div>
                                {/* JUMLAH JUAL */}
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah">Jumlah Jual *</Label>
                                    <Input
                                        id="jumlah"
                                        type="number"
                                        min="1"
                                        max={currentStok > 0 ? currentStok : undefined} // Maksimum = Stok Saat Ini
                                        placeholder="0"
                                        required
                                        value={formData.jumlah}
                                        onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                                        disabled={isLoading || !formData.produkId || currentStok === 0}
                                    />
                                    {formData.produkId && (
                                        <p className="text-xs text-gray-500 mt-1">Stok Tersedia: {currentStok}</p>
                                    )}
                                </div>
                                {/* TOTAL HARGA */}
                                <div className="space-y-2">
                                    <Label htmlFor="totalHarga">Total Harga</Label>
                                    <Input
                                        id="totalHarga"
                                        type="text"
                                        value={formatCurrency(totalHarga)}
                                        readOnly
                                        disabled
                                        className="bg-blue-100 font-bold"
                                    />
                                </div>
                            </div>

                            {/* --- LANJUTAN FORM (Tidak Ada Perubahan Logika) --- */}
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
                                    onClick={() => window.history.back()}
                                    disabled={isLoading}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isLoading || !formData.produkId || currentStok === 0} className="bg-blue-600 hover:bg-blue-700">
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </span>
                                    ) : (
                                        "Simpan Pencatatan"
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