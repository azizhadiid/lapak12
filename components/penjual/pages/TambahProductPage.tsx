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
import Swal from 'sweetalert2';


/**
 * Komponen Form untuk Upload Produk Baru
 * Hanya berisi UI dan logic preview gambar.
 */
export default function ProductUploadForm() {
    const router = useRouter();

    // Setup Supabase Client
    const supabase = createClientComponentClient();

    // State untuk loading dan error
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State untuk menyimpan URL preview gambar
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Batasan Validasi
    const MAX_FILE_SIZE_MB = 2; // Batasan 2 MB
    const MIN_DESC_LENGTH = 30; // Minimal 30 karakter
    const MIN_KEUNGGULAN_LENGTH = 10; // Minimal 10 karakter

    // Fungsi ini berjalan setiap kali pengguna memilih file
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // Hapus preview URL lama jika ada
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setImagePreview(null);
        }
    };

    /**
     * FUNGSI VALIDASI
     * @param data FormData dari form
     * @returns string | null (Pesan error jika gagal, null jika berhasil)
     */
    const validateForm = (data: FormData): string | null => {
        // --- 1. Validasi File ---
        if (!selectedFile) {
            return "Gambar produk wajib diisi.";
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            return "Format gambar tidak valid. Gunakan JPG, PNG, atau WEBP.";
        }

        if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return `Ukuran gambar maksimal ${MAX_FILE_SIZE_MB} MB.`;
        }

        // --- 2. Validasi Input Teks ---
        const nama_produk = data.get('nama_produk') as string;
        const deskripsi = data.get('deskripsi') as string;
        const keunggulan_produk = data.get('keunggulan_produk') as string;

        if (!nama_produk || nama_produk.trim().length < 5) {
            return "Nama Produk minimal 5 karakter.";
        }

        if (!deskripsi || deskripsi.trim().length < MIN_DESC_LENGTH) {
            return `Deskripsi Produk wajib diisi dan minimal ${MIN_DESC_LENGTH} karakter.`;
        }

        if (!keunggulan_produk || keunggulan_produk.trim().length < MIN_KEUNGGULAN_LENGTH) {
            return `Keunggulan Produk wajib diisi dan minimal ${MIN_KEUNGGULAN_LENGTH} karakter.`;
        }

        // Cek Stok dan Harga (sudah divalidasi oleh input type="number" tapi cek lagi sebagai pencegahan)
        const stok = parseInt(data.get('stok') as string || '0', 10);
        const harga = parseFloat(data.get('harga') as string || '0');

        if (isNaN(stok) || stok < 0) {
            return "Stok harus berupa angka non-negatif yang valid.";
        }

        if (isNaN(harga) || harga <= 0) {
            return "Harga harus berupa angka positif yang valid.";
        }

        return null; // Validasi berhasil
    };

    // LOGIC SUBMIT
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);

        // --- A. Dapatkan User dan Lakukan Validasi Awal ---
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setErrorMessage("Anda harus login untuk menambah produk.");
            setIsLoading(false);
            return;
        }

        // --- B. Lakukan Validasi Client-Side ---
        const validationError = validateForm(formData);
        if (validationError) {
            setErrorMessage(validationError);
            setIsLoading(false);
            return;
        }

        try {
            // --- C. Upload Gambar ke Supabase Storage ---
            const fileExt = selectedFile!.name.split('.').pop();
            // Menggunakan ID Penjual (user.id) untuk folder
            const filePath = `products/${user.id}/${crypto.randomUUID()}.${fileExt}`;

            const { error: storageError } = await supabase.storage
                // GANTI 'product-images' dengan nama bucket Anda
                .from('product-images')
                .upload(filePath, selectedFile!); // selectedFile dipastikan ada karena sudah lolos validasi

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
                // MENGGANTI user_id dengan penjual_id
                penjual_id: user.id, // ID user yang login = ID penjual
                nama_produk: formData.get('nama_produk') as string,
                jenis_produk: formData.get('jenis_produk') as string, // Sesuaikan dengan kolom DB
                stok: parseInt(formData.get('stok') as string || '0', 10),
                harga: parseFloat(formData.get('harga') as string || '0'),
                deskripsi: formData.get('deskripsi') as string,
                keunggulan_produk: formData.get('keunggulan_produk') as string, // Tambahkan keunggulan
                gambar: publicUrl,
            };

            // --- F. Masukkan Data ke Tabel 'produk' (GANTI 'produk' ke 'produk') ---
            const { error: dbError } = await supabase
                .from('produk') // PERHATIKAN: Nama tabel di query.sql adalah 'produk'
                .insert(dataToInsert);

            if (dbError) {
                // Jika insert DB gagal, hapus gambar yang telanjur di-upload
                await supabase.storage.from('product-images').remove([filePath]);
                throw new Error(`Gagal simpan data: ${dbError.message}. Pastikan profile_penjual Anda sudah dibuat.`);
            }

            // --- G. Sukses ---
            Swal.fire({
                icon: 'success',
                title: 'Produk Berhasil!',
                text: 'Data produk Anda berhasil ditambahkan ke toko.',
                showConfirmButton: false,
                timer: 2000,
            });
            // Opsional: Redirect ke halaman daftar produk
            router.push('/penjual/products');
        } catch (error) {
            // Tangkap semua error (upload/insert) dan tampilkan dengan Swal
            const errorMessageText = (error as Error).message;
            console.error("Error submit produk:", error);

            Swal.fire({
                icon: 'error',
                title: 'Gagal Menambahkan Produk',
                text: errorMessageText,
                confirmButtonColor: '#DC2626',
            });
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

                            <CardContent className="space-y-8 py-3">
                                {/* --- Alert Error --- */}
                                {errorMessage && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Terjadi Kesalahan</AlertTitle>
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                {/*
                                    CATATAN PENTING:
                                    Hapus input untuk penjual_id. Kita akan ambil ID user secara otomatis
                                    melalui Supabase di logic handleSubmit.
                                */}
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
                                            <Label htmlFor="jenis_produk" className="font-semibold mb-3">Jenis Produk</Label>
                                            <Select name="jenis_produk" required> {/* Ganti nama ke jenis_produk */}
                                                <SelectTrigger id="jenis_produk">
                                                    <SelectValue placeholder="Pilih jenis produk" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="makanan">Makanan</SelectItem>
                                                    <SelectItem value="minuman">Minuman</SelectItem>
                                                    <SelectItem value="cemilan">Cemilan / Makanan Ringan</SelectItem>
                                                    <SelectItem value="teknologi">Teknologi</SelectItem>
                                                    <SelectItem value="olahraga">Olahraga</SelectItem>
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
                                                        min={0}
                                                        className="pl-8"
                                                        required
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
                                                        step="0.01"
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
                                                onChange={handleImageChange}
                                                required // Tetap required, validasi di handleImageChange
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, WEBP. Max. {MAX_FILE_SIZE_MB} MB.</p>
                                        </div>

                                        {/* Area Preview Gambar */}
                                        <div className="aspect-video w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden bg-gray-50">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview produk"
                                                    className="h-full w-full object-cover"
                                                    onLoad={() => URL.revokeObjectURL(imagePreview!)} // Clean up object URL after load
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

                                {/* === BAGIAN BAWAH: DESKRIPSI DAN KEUNGGULAN === */}
                                <div>
                                    <Label htmlFor="keunggulan_produk" className="font-semibold mb-3">Keunggulan Produk</Label>
                                    <Textarea
                                        id="keunggulan_produk"
                                        name="keunggulan_produk"
                                        placeholder={`Minimal ${MIN_KEUNGGULAN_LENGTH} karakter. Contoh: Halal, Bahan Organik, Bebas Gula, Pengiriman Cepat.`}
                                        className="min-h-[120px] mb-2"
                                        required
                                        minLength={MIN_KEUNGGULAN_LENGTH}
                                    />
                                    <p className="text-xs text-gray-500">Minimal {MIN_KEUNGGULAN_LENGTH} karakter.</p>
                                </div>

                                <div>
                                    <Label htmlFor="deskripsi" className="font-semibold mb-3">Deskripsi Produk</Label>
                                    <Textarea
                                        id="deskripsi"
                                        name="deskripsi"
                                        placeholder={`Minimal ${MIN_DESC_LENGTH} karakter. Jelaskan tentang produk Anda, bahan-bahannya, rasanya, dll...`}
                                        className="min-h-[120px] mb-2"
                                        required
                                        minLength={MIN_DESC_LENGTH}
                                    />
                                    <p className="text-xs text-gray-500">Minimal {MIN_DESC_LENGTH} karakter.</p>
                                </div>

                            </CardContent>

                            <CardFooter className="flex justify-end border-t pt-6">
                                <Button type="submit" size="lg" disabled={isLoading} className='bg-blue-600 hover:bg-blue-700'>
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