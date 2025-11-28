'use client';

// Impor React dan hooks
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// Impor ikon dari lucide-react
import { Image as ImageIcon, Package, DollarSign, Boxes, AlertCircle, Loader2, Save } from 'lucide-react';
import Swal from 'sweetalert2'; // <-- Untuk notifikasi

// Impor komponen Shadcn/ui (asumsi lokasi impor ini sudah benar)
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

// Impor Supabase client-component helper
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MainLayoutPenjual from '@/components/penjual/MainLayoutPenjual';

// --- Tipe data (DIUBAH) ---
type Product = {
    id: string;
    penjual_id: string; // Tambahkan penjual_id
    nama_produk: string;
    jenis_produk: string | null; // Ganti jenis_produk ke jenis_produk
    stok: number | null;
    harga: number | null;
    deskripsi: string | null;
    keunggulan_produk: string | null; // Tambahkan keunggulan_produk
    gambar: string | null;
};

// Tipe data untuk form
type FormData = {
    nama_produk: string;
    jenis_produk: string; // Ganti jenis_produk ke jenis_produk
    stok: number;
    harga: number;
    deskripsi: string;
    keunggulan_produk: string;
    current_gambar: string | null;
};

// Batasan Validasi (Sama seperti Tambah Produk)
const MIN_DESC_LENGTH = 30;
const MIN_KEUNGGULAN_LENGTH = 10;
const MAX_FILE_SIZE_MB = 2;


export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string; // Ambil ID produk dari URL

    const supabase = createClientComponentClient();

    const [isLoading, setIsLoading] = useState(true); // Mulai dengan loading
    const [isUpdating, setIsUpdating] = useState(false); // Status submit
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State untuk data form
    const [formData, setFormData] = useState<FormData>({
        nama_produk: '',
        jenis_produk: '',
        stok: 0,
        harga: 0,
        deskripsi: '',
        keunggulan_produk: '',
        current_gambar: null,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [originalProduct, setOriginalProduct] = useState<Product | null>(null); // Untuk menyimpan data produk awal

    // --- LOGIKA FETCH DATA BERDASARKAN ID & VERIFIKASI PEMILIK ---
    useEffect(() => {
        if (!productId) {
            setErrorMessage("ID Produk tidak ditemukan.");
            setIsLoading(false);
            return;
        }

        async function fetchProduct() {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                // 1. Ambil user yang login
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setErrorMessage("Anda harus login untuk mengedit produk.");
                    setIsLoading(false);
                    return router.push('/login');
                }

                // 2. Ambil data produk berdasarkan ID
                // PERHATIAN: Gunakan .eq('penjual_id', user.id) untuk RLS!
                const { data, error } = await supabase
                    .from('produk') // Ganti ke 'produk'
                    .select('*')
                    .eq('id', productId)
                    .eq('penjual_id', user.id) // VERIFIKASI KEPEMILIKAN
                    .single();

                if (error) {
                    // Jika data tidak ditemukan ATAU RLS melarang akses (user.id tidak sama dengan penjual_id)
                    throw new Error("Produk tidak ditemukan atau Anda tidak memiliki izin untuk mengedit produk ini.");
                }

                if (!data) {
                    throw new Error("Produk tidak ditemukan.");
                }

                // 3. Set data ke state form
                setOriginalProduct(data);
                setFormData({
                    nama_produk: data.nama_produk || '',
                    jenis_produk: data.jenis_produk || '',
                    stok: data.stok || 0,
                    harga: data.harga || 0,
                    deskripsi: data.deskripsi || '',
                    keunggulan_produk: data.keunggulan_produk || '',
                    current_gambar: data.gambar || null,
                });
                setImagePreview(data.gambar); // Set preview gambar saat ini

            } catch (error) {
                console.error("Error fetching product:", error);
                setErrorMessage((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProduct();
    }, [productId, supabase, router]); // Dependency array

    // Handler untuk input form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stok' || name === 'harga' ? parseFloat(value) : value,
        }));
    };

    // Handler untuk select
    const handleSelectChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            jenis_produk: value,
        }));
    };

    // Handler untuk upload file
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setImagePreview(formData.current_gambar); // Kembali ke gambar lama jika tidak ada file baru
        }
    };

    // Fungsi Validasi Form (Sama seperti Tambah Produk)
    const validateForm = (): string | null => {
        // ... (Logika validasi yang sama: nama, deskripsi, keunggulan, stok, harga)
        const { nama_produk, deskripsi, keunggulan_produk, stok, harga } = formData;

        if (!nama_produk || nama_produk.trim().length < 5) return "Nama Produk minimal 5 karakter.";
        if (!deskripsi || deskripsi.trim().length < MIN_DESC_LENGTH) return `Deskripsi Produk wajib diisi dan minimal ${MIN_DESC_LENGTH} karakter.`;
        if (!keunggulan_produk || keunggulan_produk.trim().length < MIN_KEUNGGULAN_LENGTH) return `Keunggulan Produk wajib diisi dan minimal ${MIN_KEUNGGULAN_LENGTH} karakter.`;
        if (isNaN(stok) || stok < 0) return "Stok harus berupa angka non-negatif yang valid.";
        if (isNaN(harga) || harga <= 0) return "Harga harus berupa angka positif yang valid.";

        // Validasi File HANYA jika ada file baru
        if (selectedFile) {
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(selectedFile.type)) return "Format gambar tidak valid. Gunakan JPG, PNG, atau WEBP.";
            if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Ukuran gambar maksimal ${MAX_FILE_SIZE_MB} MB.`;
        } else if (!formData.current_gambar) {
            // Jika tidak ada file baru dan tidak ada gambar lama
            return "Gambar produk wajib diisi.";
        }

        return null;
    };


    // --- LOGIKA SUBMIT (UPDATE) ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUpdating(true);

        const validationError = validateForm();
        if (validationError) {
            Swal.fire({ icon: 'error', title: 'Validasi Gagal', text: validationError, confirmButtonColor: '#DC2626' });
            setIsUpdating(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sesi pengguna tidak ditemukan.");

            let newImageUrl = formData.current_gambar;
            let oldFilePath = originalProduct?.gambar ? originalProduct.gambar.split('public/product-images/')[1] : null;

            // 1. Jika ada file baru, lakukan UPLOAD
            if (selectedFile) {
                // Hapus gambar lama (jika ada) sebelum upload yang baru
                if (oldFilePath) {
                    await supabase.storage.from('product-images').remove([oldFilePath]);
                }

                // Upload gambar baru
                const fileExt = selectedFile.name.split('.').pop();
                const newFilePath = `products/${user.id}/${crypto.randomUUID()}.${fileExt}`;

                const { error: storageError } = await supabase.storage
                    .from('product-images')
                    .upload(newFilePath, selectedFile);

                if (storageError) throw new Error(`Gagal upload gambar baru: ${storageError.message}`);

                const { data: urlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(newFilePath);

                newImageUrl = urlData.publicUrl;
            }

            // 2. Siapkan Data Update
            const dataToUpdate = {
                nama_produk: formData.nama_produk,
                jenis_produk: formData.jenis_produk,
                stok: formData.stok,
                harga: formData.harga,
                deskripsi: formData.deskripsi,
                keunggulan_produk: formData.keunggulan_produk,
                gambar: newImageUrl, // Gunakan URL gambar baru atau URL gambar lama
            };

            // 3. Lakukan UPDATE ke Tabel 'produk'
            const { error: dbError } = await supabase
                .from('produk')
                .update(dataToUpdate)
                .eq('id', productId)
                .eq('penjual_id', user.id); // PENTING: Pastikan hanya penjual yang berhak yang bisa update

            if (dbError) throw new Error(`Gagal menyimpan perubahan: ${dbError.message}`);

            // 4. Sukses
            await Swal.fire({
                icon: 'success',
                title: 'Produk Diperbarui!',
                text: 'Perubahan produk berhasil disimpan.',
                showConfirmButton: false,
                timer: 2000,
            });
            router.push('/penjual/products');

        } catch (error) {
            const errorMessageText = (error as Error).message;
            console.error("Error update produk:", error);
            Swal.fire({
                icon: 'error',
                title: 'Update Gagal',
                text: errorMessageText,
                confirmButtonColor: '#DC2626',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // --- RENDER ---
    if (isLoading) {
        return (
            <MainLayoutPenjual>
                <div className="flex justify-center items-center h-64 mb-48">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                    <span className="text-lg text-gray-700">Memuat data produk...</span>
                </div>
            </MainLayoutPenjual>
        );
    }

    if (errorMessage) {
        return (
            <MainLayoutPenjual>
                <Alert variant="destructive" className="max-w-4xl mx-auto mt-8">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Terjadi Kesalahan Kritis</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            </MainLayoutPenjual>
        );
    }

    // Jika produk tidak ada (meskipun sudah di-handle di error), kita cegah render form
    if (!originalProduct) return null;

    return (
        <MainLayoutPenjual>
            <div className="p-4 md:p-8">
                <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <form onSubmit={handleSubmit}>

                        <CardHeader className='mb-3'>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Edit Produk: {originalProduct.nama_produk}</CardTitle>
                                    <CardDescription>
                                        ID Produk: {productId}. Lakukan perubahan pada detail produk Anda.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* ... (UI Input Sama seperti Tambah Produk, gunakan value={formData.xxx} dan onChange) ... */}
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
                                            value={formData.nama_produk}
                                            onChange={handleChange}

                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="jenis_produk" className="font-semibold mb-3">Jenis Produk</Label>
                                        <Select name="jenis_produk" value={formData.jenis_produk}> {/* Ganti nama ke jenis_produk */}
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
                                                    value={formData.stok}
                                                    onChange={handleChange}
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
                                                    step="0.01"
                                                    value={formData.harga}
                                                    onChange={handleChange}

                                                    className="pl-8"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* === KOLOM KANAN: UPLOAD GAMBAR === */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="gambar" className="font-semibold mb-3">Ganti Gambar Produk</Label>
                                        <Input
                                            id="gambar"
                                            name="gambar"
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={handleImageChange}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Biarkan kosong untuk mempertahankan gambar lama. Format: JPG, PNG, WEBP. Max. {MAX_FILE_SIZE_MB} MB.</p>
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
                                                <p className="mt-2 text-sm">Tidak Ada Gambar</p>
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
                                    placeholder={`Minimal ${MIN_KEUNGGULAN_LENGTH} karakter.`}
                                    className="min-h-[120px] mb-2"
                                    value={formData.keunggulan_produk}
                                    onChange={handleChange}

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
                                    value={formData.deskripsi}
                                    onChange={handleChange}

                                    minLength={MIN_DESC_LENGTH}
                                />
                                <p className="text-xs text-gray-500">Minimal {MIN_DESC_LENGTH} karakter.</p>
                            </div>

                        </CardContent>

                        <CardFooter className="flex justify-end border-t pt-6">
                            <Button type="submit" size="lg" disabled={isUpdating || isLoading} className='bg-blue-600 hover:bg-blue-700'>
                                {isUpdating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </CardFooter>

                    </form>
                </Card>
            </div>
        </MainLayoutPenjual>
    );
}