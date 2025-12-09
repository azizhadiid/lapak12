"use client";

// Impor React, hooks, dan Supabase
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

// Impor Komponen UI
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
    Loader2, Calendar, Package, Tag,
    Minus, DollarSign, Users, Wallet, Boxes, TrendingUp
} from "lucide-react";
import MainLayoutPenjual from "@/components/penjual/MainLayoutPenjual";


// --- Tipe Data Produk untuk Dropdown ---
interface PenjualProduct {
    id: string;
    nama_produk: string;
    harga: number;
    jenis_produk: string;
    stok: number;
}

// Tipe untuk data form (Diperbarui sesuai DB baru)
type FormData = {
    tanggal: string;
    produkId: string; // ID Produk yang dipilih
    namaProdukHistory: string; // Nama produk (history)
    kategori: string; // Kategori (akan diisi otomatis)
    jumlah: string;
    hargaSatuan: string;
    pembeli: string;
    metodePembayaran: string;
};

export default function EditPencatatanPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string; // ID Pencatatan dari URL

    // State Data
    const [sellerProducts, setSellerProducts] = useState<PenjualProduct[]>([]);
    const [originalStok, setOriginalStok] = useState(0); // Stok produk saat ini

    // State Form
    const [formData, setFormData] = useState<FormData>({
        tanggal: "",
        produkId: "",
        namaProdukHistory: "",
        kategori: "",
        jumlah: "",
        hargaSatuan: "",
        pembeli: "",
        metodePembayaran: "",
    });

    // State Loading & User
    const [, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [, setIsProductLoading] = useState(true);


    // --- 1. FETCH DATA PRODUK DAN PENCATATAN SAAT HALAMAN DIBUKA ---
    useEffect(() => {
        async function loadData() {
            setIsPageLoading(true);

            // 1. Dapatkan user yang login
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Anda harus login untuk mengedit.");
                router.push("/login");
                return;
            }
            setUser(user);

            if (!id) {
                toast.error("ID pencatatan tidak valid.");
                router.push("/penjual/pencatatan");
                return;
            }

            // 2. Fetch data PENCATATAN (JOIN ke produk untuk dapat stok/harga terbaru)
            const { data: penjualanData, error: penjualanError } = await supabase
                .from("penjualan")
                .select(`
                    *, 
                    produk:produk_id (stok, harga, jenis_produk)
                `)
                .eq("id", id)
                .eq("penjual_id", user.id) // Diperbarui ke penjual_id
                .single();

            if (penjualanError || !penjualanData) {
                console.error("Error fetch data:", penjualanError);
                toast.error("Gagal memuat data atau Anda tidak memiliki akses.");
                router.push("/penjual/pencatatan");
                return;
            }

            // 3. Fetch SEMUA produk penjual (untuk dropdown)
            setIsProductLoading(true);
            const { data: productList, error: productError } = await supabase
                .from('produk')
                .select('id, nama_produk, harga, jenis_produk, stok')
                .eq('penjual_id', user.id)
                .order('nama_produk', { ascending: true });

            if (productError) {
                console.error("Error fetching products:", productError);
                toast.error("Gagal memuat daftar produk.");
                setIsProductLoading(false);
                return;
            }

            const mappedProductList: PenjualProduct[] = (productList ?? []).map(p => ({
                id: p.id,
                nama_produk: p.nama_produk,
                harga: parseFloat(p.harga),
                jenis_produk: p.jenis_produk,
                stok: p.stok,
            }));
            setSellerProducts(mappedProductList);
            setIsProductLoading(false);


            // 4. Hitung STOK PRODUK SAAT INI + JUMLAH PENJUALAN YANG SEDANG DIEDIT
            // Logika: Stok_saat_ini = (Stok Produk di DB) + (Jumlah Penjualan yang sedang diedit)
            // Ini untuk memberikan batasan atas yang benar saat mengedit
            const produkRelasi = Array.isArray(penjualanData.produk) ? penjualanData.produk[0] : penjualanData.produk;
            const stokSaatIni = produkRelasi ? produkRelasi.stok : 0;
            const jumlahLama = penjualanData.jumlah;
            const maxStokEdit = stokSaatIni + jumlahLama;

            // Simpan stok saat ini
            setOriginalStok(maxStokEdit);


            // 5. Sukses! Isi form
            setFormData({
                tanggal: penjualanData.tanggal,
                produkId: penjualanData.produk_id,
                namaProdukHistory: penjualanData.nama_produk_history,
                kategori: penjualanData.kategori,
                jumlah: String(penjualanData.jumlah),
                hargaSatuan: String(penjualanData.harga_satuan),
                pembeli: penjualanData.nama_pembeli,
                metodePembayaran: penjualanData.metode_pembayaran,
            });

            setIsPageLoading(false);
        }

        loadData();
    }, [id, supabase, router]);

    // --- HANDLER SAAT PRODUK DIPILIH (Jika penjual ingin mengubah produk yang dijual) ---
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
            // Reset batas stok max karena produk ganti
            setOriginalStok(selectedProduct.stok);
        }
    };


    // Helper format currency
    const formatCurrency = (amount: number) => {
        if (isNaN(amount)) return "Rp 0";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // --- 2. HANDLE SUBMIT UNTUK UPDATE DATA ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || !user || !id) return;
        setIsSubmitting(true);

        const jumlahBaru = parseInt(formData.jumlah);
        const maxLimit = originalStok;

        // Front-end check untuk stok
        if (jumlahBaru > maxLimit) {
            toast.error(`Jumlah jual melebihi stok yang tersedia (${maxLimit}).`);
            setIsSubmitting(false);
            return;
        }


        try {
            const updatedData = {
                // Kolom Foreign Key
                produk_id: formData.produkId,
                // Kolom Data Penjualan
                tanggal: formData.tanggal,
                kategori: formData.kategori,
                nama_produk_history: formData.namaProdukHistory, // Diperbarui ke history
                jumlah: jumlahBaru,
                harga_satuan: parseFloat(formData.hargaSatuan),
                total_harga: jumlahBaru * parseFloat(formData.hargaSatuan),
                nama_pembeli: formData.pembeli,
                metode_pembayaran: formData.metodePembayaran,
                // created_at TIDAK perlu diupdate
            };

            // ✅ Jalankan UPDATE
            // Database Trigger (sesuaikan_stok_update_trigger) akan mengurus perubahan stok.
            const { error } = await supabase
                .from("penjualan")
                .update(updatedData)
                .eq("id", id)
                .eq("penjual_id", user.id); // Diperbarui ke penjual_id

            if (error) {
                // Tangani error dari trigger (misal: stok produk baru tidak cukup)
                const errorMessage = error.message.includes("Gagal:")
                    ? error.message.split('ERROR:')[1].trim()
                    : `Gagal memperbarui data: ${error.message}`;
                throw new Error(errorMessage);
            }

            toast.success("Pencatatan berhasil diperbarui!");
            router.push("/penjual/pencatatan");
            router.refresh();
        } catch (err: unknown) {
            console.error(err);

            let errorMessage = "Terjadi kesalahan saat memperbarui data.";

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === "string") {
                errorMessage = err;
            }

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hitung total harga
    const totalHarga = (formData.jumlah && formData.hargaSatuan)
        ? parseInt(formData.jumlah) * parseFloat(formData.hargaSatuan)
        : 0;

    // Stok Max Limit
    const maxStok = originalStok;

    // --- TAMPILAN FORM (RENDER) ---
    return (
        <MainLayoutPenjual>
            {/* Mengubah lebar container menjadi max-w-6xl */}
            <div className="space-y-8 max-w-6xl mx-auto pb-12 py-8">
                {/* Header Halaman */}
                <div className="border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Edit Pencatatan Penjualan
                    </h1>
                    <p className="text-lg text-gray-500 mt-2">
                        Perbarui detail transaksi ini. Perubahan akan menyesuaikan stok produk secara otomatis.
                    </p>
                </div>

                {/* Form dalam Card */}
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
                                        disabled={isSubmitting}
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
                                    <Package className="h-4 w-4 mr-2 text-blue-600" /> Produk yang Dijual *
                                </Label>
                                <Select
                                    value={formData.produkId}
                                    onValueChange={handleProductSelect}
                                    required
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger id="produkId" className="py-6 text-base">
                                        <SelectValue placeholder="Pilih produk yang terjual" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sellerProducts.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={product.id}
                                            // Non-aktifkan jika stok baru (stok di DB - (jumlah lama - jumlah baru)) akan negatif.
                                            // Karena logika stok di handle BE, kita hanya fokus memastikan user bisa memilih produk, 
                                            // dan BE yang akan RAISING EXCEPTION jika stok tidak cukup.
                                            >
                                                {product.nama_produk} ({product.stok} unit tersedia)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        max={maxStok} // Batas Maksimum Stok Tersedia + Jumlah yang DIEDIT
                                        placeholder="0"
                                        required
                                        value={formData.jumlah}
                                        onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                                        disabled={isSubmitting}
                                        className="py-6 text-base"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Stok Maksimal yang dapat dijual: {maxStok}</p>
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
                                        disabled={isSubmitting}
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
                                        disabled={isSubmitting}
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/penjual/pencatatan")}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 text-base"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base">
                                    {isSubmitting ? (
                                        <span className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Simpan Perubahan
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