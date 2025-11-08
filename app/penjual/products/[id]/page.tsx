// Pastikan ini adalah Client Component
'use client';

// Impor React dan hooks
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// Impor ikon dari lucide-react
import { Image as ImageIcon, Upload, Package, DollarSign, Boxes, AlertCircle, Loader2, Save } from 'lucide-react';

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

// --- Tipe data (DIUBAH) ---
// Kita pisahkan tipe Product dari DB dan tipe Form
type Product = {
    id: string;
    nama_produk: string;
    jenis_product: string | null;
    stok: number | null;
    harga: number | null;
    deskripsi: string | null;
    gambar: string | null;
    user_id: string;
};

// --- (BARU) Tipe data untuk form state ---
type FormDataState = {
    nama_produk: string;
    jenis_product: string;
    stok: number | string; // Gunakan string untuk input, parse saat submit
    harga: number | string; // Gunakan string untuk input
    deskripsi: string;
};

/**
 * Komponen Form untuk Upload Produk Baru
 * Hanya berisi UI dan logic preview gambar.
 */
export default function ProductEditForm() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const supabase = createClientComponentClient();

    // --- (BARU) State untuk Form (Controlled Components) ---
    const [formData, setFormData] = useState<FormDataState>({
        nama_produk: '',
        jenis_product: '',
        stok: 0,
        harga: 0,
        deskripsi: '',
    });

    // --- State untuk loading & error (Sama) ---
    const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Ini untuk submit
    const [isFetching, setIsFetching] = useState(true); // (BARU) Ini untuk loading data awal
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // --- State untuk gambar (Sama) ---
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // --- 2. (BARU) LOGIKA FETCH DATA PRODUK ---
    useEffect(() => {
        if (!productId) return; // Jangan lakukan apa-apa jika tidak ada ID

        async function fetchProductData() {
            setIsFetching(true); // Mulai loading data

            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId) // Ambil produk berdasarkan ID dari URL
                .single(); // Kita hanya ingin 1 hasil

            if (error) {
                console.error("Error fetching product:", error);
                setErrorMessage("Gagal mengambil data produk: " + error.message);
                setIsFetching(false);
                return;
            }

            if (product) {
                // --- 3. (BARU) Isi state form dengan data dari DB ---
                setFormData({
                    nama_produk: product.nama_produk || '',
                    jenis_product: product.jenis_product || '',
                    stok: product.stok || 0,
                    harga: product.harga || 0,
                    deskripsi: product.deskripsi || '',
                });

                // --- (BARU) Tampilkan gambar yang sudah ada ---
                setImagePreview(product.gambar || null);
            }

            setIsFetching(false); // Selesai loading data
        }

        fetchProductData();
    }, [productId, supabase]); // Jalankan ini jika productId atau supabase berubah


    // --- (BARU) Handle change untuk controlled inputs ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            jenis_product: value,
        }));
    };


    // --- Logika Preview Gambar (Sama) ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // --- 4. (DIUBAH) LOGIC SUBMIT (Sekarang DUMMY, nanti kita isi) ---
    // Logika 'insert' Anda yang lama tidak relevan di sini
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // --- A. Dapatkan User (Wajib untuk path file) ---
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("Sesi tidak ditemukan, silakan login ulang.");
            }

            // --- B. Siapkan Data Teks untuk di-update ---
            // Kita parse 'stok' dan 'harga' kembali ke angka
            const dataToUpdate: Omit<Partial<Product>, 'id'> = {
                nama_produk: formData.nama_produk,
                jenis_product: formData.jenis_product,
                stok: parseInt(formData.stok as string, 10),
                harga: parseFloat(formData.harga as string),
                deskripsi: formData.deskripsi,
            };

            // --- C. Cek Apakah User Ganti Gambar? ---
            if (selectedFile) {
                // User memilih file BARU

                // 1. Buat path file baru
                const fileExt = selectedFile.name.split('.').pop();
                const newFilePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

                // 2. Upload file BARU
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(newFilePath, selectedFile, {
                        cacheControl: '3600',
                        upsert: false // false agar tidak menimpa file lama (kita buat baru)
                    });

                if (uploadError) {
                    throw new Error(`Gagal upload gambar baru: ${uploadError.message}`);
                }

                // 3. Dapatkan URL publik file BARU
                const { data: urlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(newFilePath);

                // 4. Tambahkan URL baru ke data yang akan di-update
                dataToUpdate.gambar = urlData.publicUrl;

                // 5. (PENTING) Hapus file gambar LAMA
                if (originalProduct?.gambar) {
                    const oldFilePath = originalProduct.gambar.split('product-images/')[1];
                    const { error: removeError } = await supabase.storage
                        .from('product-images')
                        .remove([oldFilePath]);

                    if (removeError) {
                        console.warn(`Gagal hapus gambar lama: ${removeError.message}`);
                    }
                }
            }
            // Jika 'selectedFile' tidak ada, kita tidak melakukan apa-apa pada gambar.
            // 'dataToUpdate' tidak akan punya properti 'gambar',
            // sehingga Supabase tidak akan mengubah kolom 'gambar' di DB.

            // --- D. Lakukan UPDATE ke Database ---
            const { error: dbError } = await supabase
                .from('products')
                .update(dataToUpdate) // Kirim data yang sudah disiapkan
                .eq('id', productId); // Target produk yang spesifik

            if (dbError) {
                // Jika update DB gagal, coba hapus gambar baru yang telanjur di-upload
                if (dataToUpdate.gambar) {
                    const newFilePath = dataToUpdate.gambar.split('product-images/')[1];
                    await supabase.storage.from('product-images').remove([newFilePath]);
                }
                throw new Error(`Gagal simpan data: ${dbError.message}`);
            }

            // --- E. Sukses ---
            alert("Produk berhasil diperbarui!");
            router.push('/penjual/products/edit'); // (DIUBAH) Arahkan kembali ke halaman tabel
            router.refresh(); // Segarkan data di halaman tabel

        } catch (error) {
            console.error("Error submit update:", error);
            setErrorMessage((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 5. (BARU) Tampilkan loading jika data belum siap ---
    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="ml-4 text-lg">Memuat data produk...</p>
            </div>
        );
    }

    // 3. RENDER UI (JSX)
    return (
        <div className="p-4 md:p-8">
            <Card className="w-full max-w-4xl mx-auto shadow-lg">
                <form onSubmit={handleSubmit}>

                    <CardHeader className='mb-3'>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Edit Produk Baru</CardTitle>
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
                                        value={formData.nama_produk} // <-- (DIUBAH)
                                        onChange={handleChange}     // <-- (DIUBAH)
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="jenis_product" className="font-semibold mb-3">Jenis Produk</Label>
                                    <Select
                                        name="jenis_product"
                                        value={formData.jenis_product} // <-- (DIUBAH)
                                        onValueChange={handleSelectChange} // <-- (DIUBAH)
                                    >
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
                                                min={0}
                                                className="pl-8"
                                                value={formData.stok}     // <-- (DIUBAH)
                                                onChange={handleChange} // <-- (DIUBAH)
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
                                                value={formData.harga}    // <-- (DIUBAH)
                                                onChange={handleChange} // <-- (DIUBAH)
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
                                value={formData.deskripsi} // <-- (DIUBAH)
                                onChange={handleChange}  // <-- (DIUBAH)
                            />
                        </div>

                    </CardContent>

                    <CardFooter className="flex justify-end border-t pt-6">
                        <Button type="submit" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </CardFooter>

                </form>
            </Card>
        </div >
    );
}