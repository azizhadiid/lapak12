// Pastikan ini adalah Client Component
'use client';

// Impor React dan hooks
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Impor ikon dari lucide-react
import { Image as ImageIcon, Upload, Package, DollarSign, Boxes, AlertCircle, Loader2 } from 'lucide-react';

// Impor komponen Shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// 1. Impor Supabase client-component helper
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MainLayoutPenjual from '../MainLayoutPenjual';


/**
 * Komponen Form untuk Upload Produk Baru
 * Hanya berisi UI dan logic preview gambar.
 */
export default function ProductUploadForm() {
    const router = useRouter();

    // 2. Setup Supabase Client
    // Ini adalah klien yang aman digunakan di browser/client-component
    // Dia otomatis membaca sesi user yang sedang login
    const supabase = createClientComponentClient();

    // State untuk loading dan error
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State untuk menyimpan URL preview gambar
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // 1. LOGIC PREVIEW GAMBAR
    // Fungsi ini berjalan setiap kali pengguna memilih file
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Ambil file pertama

        if (file) {
            setSelectedFile(file);
            // Buat URL objek sementara dari file untuk ditampilkan sebagai preview
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setImagePreview(null);
        }
    };

    // 2. LOGIC SUBMIT (DUMMY)
    // Fungsi ini berjalan saat tombol submit ditekan
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        const form = e.currentTarget as HTMLFormElement; // pastikan ini form

        // --- A. Dapatkan User yang Sedang Login ---
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setErrorMessage("Anda harus login untuk menambah produk.");
            setIsLoading(false);
            return;
        }

        // --- B. Validasi Form (minimal file ada) ---
        if (!selectedFile) {
            setErrorMessage("Gambar produk wajib diisi.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData(form);

        try {
            // --- C. Upload Gambar ke Supabase Storage ---
            // Buat nama file yang unik (user-id/random-uuid.ext)
            const fileExt = selectedFile.name.split('.').pop();
            const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

            const { error: storageError } = await supabase.storage
                // GANTI 'product-images' dengan nama bucket Anda
                .from('product-images')
                .upload(filePath, selectedFile);

            if (storageError) {
                throw new Error(`Gagal upload gambar: ${storageError.message}`);
            }

            // --- D. Dapatkan URL Publik dari Gambar ---
            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            const publicUrl = urlData.publicUrl;

            // --- E. Siapkan Data untuk Database ---
            const dataToInsert = {
                user_id: user.id, // INI KUNCINYA! Menghubungkan produk ke user
                nama_produk: formData.get('nama_produk') as string,
                jenis_product: formData.get('jenis_product') as string,
                stok: parseInt(formData.get('stok') as string || '0', 10),
                harga: parseFloat(formData.get('harga') as string || '0'), // Dibuat float untuk desimal
                deskripsi: formData.get('deskripsi') as string,
                gambar: publicUrl, // Simpan URL publik ke database
            };

            // --- F. Masukkan Data ke Tabel 'products' ---
            const { error: dbError } = await supabase
                .from('products')
                .insert(dataToInsert);

            if (dbError) {
                // Jika insert DB gagal, hapus gambar yang telanjur di-upload
                await supabase.storage.from('product-images').remove([filePath]);
                throw new Error(`Gagal simpan data: ${dbError.message}`);
            }

            // --- G. Sukses ---
            alert("Produk berhasil ditambahkan!");
        } catch (error) {
            // Tangkap semua error (upload/insert)
            console.error("Error submit produk:", error);
            setErrorMessage((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. RENDER UI (JSX)
    return (
        <MainLayoutPenjual>
            <div className="space-y-6">
                <div className="p-4 md:p-8">
                    <Card className="w-full max-w-4xl mx-auto shadow-lg">
                        <form onSubmit={handleSubmit}>

                            <CardHeader className='mb-3'>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Tambah Produk Baru</CardTitle>
                                        <CardDescription>
                                            Isi detail di bawah ini untuk menambahkan produk baru ke toko Anda.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* --- Alert Error --- */}
                                {errorMessage && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Terjadi Kesalahan</AlertTitle>
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Layout Grid 2 Kolom untuk Desktop */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* === KOLOM KIRI: INFO PRODUK === */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="nama_produk" className="font-semibold mb-3">Nama Produk</Label>
                                            <Input
                                                id="nama_produk"
                                                name="nama_produk"
                                                placeholder="Misal: Kopi Susu Gula Aren"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="jenis_product" className="font-semibold mb-3">Jenis Produk</Label>
                                            <Select name="jenis_product">
                                                <SelectTrigger id="jenis_product">
                                                    <SelectValue placeholder="Pilih jenis produk" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="makanan-berat">Makanan Berat</SelectItem>
                                                    <SelectItem value="makanan-ringan">Cemilan / Makanan Ringan</SelectItem>
                                                    <SelectItem value="minuman-kopi">Minuman Kopi</SelectItem>
                                                    <SelectItem value="minuman-nonkopi">Minuman Non-Kopi</SelectItem>
                                                    <SelectItem value="lainnya">Lainnya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Stok dan Harga dalam satu baris */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="stok" className="font-semibold mb-3">Stok</Label>
                                                <div className="relative">
                                                    <Boxes className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="stok"
                                                        name="stok"
                                                        type="number"
                                                        placeholder="0"
                                                        defaultValue={0}
                                                        min={0}
                                                        className="pl-8"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="harga" className="font-semibold mb-3">Harga (Rp)</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="harga"
                                                        name="harga"
                                                        type="number"
                                                        placeholder="Misal: 18000"
                                                        min={0}
                                                        step="0.01" // Izinkan desimal
                                                        required
                                                        className="pl-8"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* === KOLOM KANAN: UPLOAD GAMBAR === */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="gambar" className="font-semibold mb-3">Gambar Produk</Label>
                                            <Input
                                                id="gambar"
                                                name="gambar"
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp"
                                                onChange={handleImageChange} // Memanggil logic preview
                                                required
                                            />
                                        </div>

                                        {/* Area Preview Gambar */}
                                        <div className="aspect-video w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden bg-gray-50">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview produk"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <ImageIcon className="w-12 h-12 mx-auto" />
                                                    <p className="mt-2 text-sm">Preview gambar akan tampil di sini</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* === BAGIAN BAWAH: DESKRIPSI (Full Width) === */}
                                <div>
                                    <Label htmlFor="deskripsi" className="font-semibold mb-3">Deskripsi Produk</Label>
                                    <Textarea
                                        id="deskripsi"
                                        name="deskripsi"
                                        placeholder="Jelaskan tentang produk Anda, bahan-bahannya, rasanya, dll..."
                                        className="min-h-[120px] mb-5"
                                    />
                                </div>

                            </CardContent>

                            <CardFooter className="flex justify-end border-t pt-6">
                                <Button type="submit" size="lg" disabled={isLoading} className='bg-blue-600 hover:bg-blue700'>
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
                                </Button>
                            </CardFooter>

                        </form>
                    </Card>
                </div>
            </div>
        </MainLayoutPenjual>
    );
}