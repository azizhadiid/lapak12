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
import { ChevronLeft, Loader2 } from "lucide-react"; // Tambah Loader2
import MainLayoutPenjual from "@/components/penjual/MainLayoutPenjual";
import { Penjualan } from "@/lib/types/pencatatan"; // Pastikan tipe ini ada

// Tipe untuk data form
type FormData = {
    tanggal: string;
    namaProduk: string;
    kategori: string;
    jumlah: string;
    hargaSatuan: string;
    pembeli: string;
    metodePembayaran: string;
};

export default function EditPencatatanPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string; // Ambil ID dari URL

    // State
    const [formData, setFormData] = useState<FormData>({
        tanggal: "",
        namaProduk: "",
        kategori: "",
        jumlah: "",
        hargaSatuan: "",
        pembeli: "",
        metodePembayaran: "",
    });

    // Pisahkan state loading
    const [isPageLoading, setIsPageLoading] = useState(true); // Untuk loading halaman
    const [isSubmitting, setIsSubmitting] = useState(false); // Untuk tombol submit
    const [user, setUser] = useState<User | null>(null);

    // --- 1. FETCH DATA SAAT HALAMAN DIBUKA ---
    useEffect(() => {
        async function loadPencatatan() {
            setIsPageLoading(true);

            // 1. Dapatkan user yang login
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Anda harus login untuk mengedit.");
                router.push("/login");
                return;
            }
            setUser(user); // Simpan user di state

            if (!id) {
                toast.error("ID pencatatan tidak valid.");
                router.push("/penjual/pencatatan");
                return;
            }

            // 2. Fetch data PENCATATAN, pastikan user_id-nya cocok!
            const { data, error } = await supabase
                .from("penjualan")
                .select("*")
                .eq("id", id)           // Filter berdasarkan ID dari URL
                .eq("user_id", user.id) // PENTING: Filter berdasarkan user_id yang login
                .single();              // Ambil satu data saja

            // 3. Handle jika data tidak ditemukan (atau bukan miliknya)
            if (error || !data) {
                console.error("Error fetch data:", error);
                toast.error("Gagal memuat data atau Anda tidak memiliki akses.");
                router.push("/penjual/pencatatan");
                return;
            }

            // 4. Sukses! Isi form dengan data dari database
            setFormData({
                tanggal: data.tanggal,
                namaProduk: data.nama_produk,
                kategori: data.kategori,
                jumlah: String(data.jumlah), // Ubah angka jadi string
                hargaSatuan: String(data.harga_satuan), // Ubah angka jadi string
                pembeli: data.nama_pembeli,
                metodePembayaran: data.metode_pembayaran,
            });

            setIsPageLoading(false);
        }

        loadPencatatan();
    }, [id, supabase, router]);

    // Helper format currency (tetap sama)
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
        if (isSubmitting || !user || !id) return; // Cek user dan id
        setIsSubmitting(true);

        try {
            // Siapkan data untuk di-update
            const updatedData = {
                // user_id tidak perlu di-update
                tanggal: formData.tanggal,
                kategori: formData.kategori,
                nama_produk: formData.namaProduk,
                jumlah: parseInt(formData.jumlah),
                harga_satuan: parseInt(formData.hargaSatuan),
                total_harga: parseInt(formData.jumlah) * parseInt(formData.hargaSatuan),
                nama_pembeli: formData.pembeli,
                metode_pembayaran: formData.metodePembayaran,
            };

            // ✅ Jalankan UPDATE, bukan INSERT
            const { error } = await supabase
                .from("penjualan")
                .update(updatedData)
                .eq("id", id)           // PENTING: Update HANYA record dengan ID ini
                .eq("user_id", user.id); // PENTING: DAN yang dimiliki user ini

            if (error) throw error;

            toast.success("Pencatatan berhasil diperbarui!");
            router.push("/penjual/pencatatan"); // Kembali ke daftar
            router.refresh(); // Refresh data di halaman daftar
        } catch (err: any) {
            console.error(err);
            toast.error(`Gagal memperbarui data: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hitung total harga (tetap sama)
    const totalHarga = (formData.jumlah && formData.hargaSatuan)
        ? parseInt(formData.jumlah) * parseInt(formData.hargaSatuan)
        : 0;

    // --- TAMPILAN LOADING ---
    if (isPageLoading) {
        return (
            <MainLayoutPenjual>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    <p className="ml-3 text-gray-600">Memuat data pencatatan...</p>
                </div>
            </MainLayoutPenjual>
        );
    }

    // --- TAMPILAN FORM (RENDER) ---
    return (
        <MainLayoutPenjual>
            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                {/* Header Halaman dengan Tombol Back */}
                <div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mb-4"
                        onClick={() => router.push("/penjual/pencatatan")} // Arahkan ke /penjual/pencatatan
                        disabled={isSubmitting}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Kembali
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Data Pencatatan Anda</h1>
                    <p className="text-base text-gray-500 mt-1">
                        Perbarui form di bawah untuk mengubah data pencatatan penjualan.
                    </p>
                </div>

                {/* Form dalam Card */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Semua input di bawah ini SAMA, hanya 'disabled' diubah ke isSubmitting */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal">Tanggal *</Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        required
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kategori">Kategori *</Label>
                                    <Select
                                        value={formData.kategori}
                                        onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                                        required
                                        disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                        disabled={isSubmitting}
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
                                        disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="metodePembayaran">Metode Pembayaran *</Label>
                                <Select
                                    value={formData.metodePembayaran}
                                    onValueChange={(value) => setFormData({ ...formData, metodePembayaran: value })}
                                    required
                                    disabled={isSubmitting}
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
                                    onClick={() => router.push("/penjual/pencatatan")}
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan Perubahan" // Ganti teks tombol
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