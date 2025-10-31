// ProfilePenjualPage.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"; // <-- Impor hooks
import MainLayoutPenjual from "../MainLayoutPenjual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Check, Edit2, Mail, MapPin, Phone, Loader2, AlertCircle, User, Building } from "lucide-react"; // <-- Impor ikon tambahan
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // <-- Impor Avatar
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // <-- Impor Alert
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // <-- Impor Supabase

// Tipe Data Gabungan
type ProfileData = {
    // Dari 'users' (Read-only)
    username: string;
    email: string;

    // Dari 'profile_penjual' (Editable)
    store_name: string;
    owner_name: string;
    phone: string;
    address: string;
    description: string;
    foto_url: string | null;
};

// Nilai Default
const defaultProfile: ProfileData = {
    username: 'Memuat...',
    email: 'Memuat...',
    store_name: '',
    owner_name: '',
    phone: '',
    address: '',
    description: '',
    foto_url: null,
};

export default function ProfilePenjualPage() {
    // --- State & Setup ---
    const supabase = createClientComponentClient(); // Inisialisasi Supabase
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading Simpan
    const [isFetching, setIsFetching] = useState(true); // Loading Awal
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // profileData -> Data asli dari DB
    const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
    // editData -> Data di form saat mode edit
    const [editData, setEditData] = useState<ProfileData>(defaultProfile);

    // State & Ref untuk Foto
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref untuk input file

    // === 1. FETCH DATA ===
    useEffect(() => {
        async function fetchProfileData() {
            setIsFetching(true);
            setErrorMessage(null);

            try {
                // Ambil user ID yang sedang login
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User tidak ditemukan. Silakan login ulang.");

                let combinedData: ProfileData = { ...defaultProfile };

                // A. Ambil username & email dari tabel 'users'
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('username, email')
                    .eq('id', user.id)
                    .single();

                if (userError) throw new Error(`Gagal ambil data user: ${userError.message}`);
                if (userData) {
                    combinedData.username = userData.username;
                    combinedData.email = userData.email;
                }

                // B. Ambil data dari tabel 'profile_penjual'
                const { data: profileDataDb, error: profileError } = await supabase
                    .from('profile_penjual')
                    .select('*') // Ambil semua kolom termasuk foto_url
                    .eq('id', user.id)
                    .single();

                // Abaikan error "PGRST116" (no rows found), karena profil mungkin belum ada
                if (profileError && profileError.code !== 'PGRST116') {
                    throw new Error(`Gagal ambil profil: ${profileError.message}`);
                }

                // Jika data profil ada, gabungkan
                if (profileDataDb) {
                    combinedData = { ...combinedData, ...profileDataDb }; // Gabungkan semua field
                    combinedData.foto_url = profileDataDb.foto_url || null; // Pastikan foto_url ada
                }

                // C. Set state
                setProfileData(combinedData); // Data yang tampil saat tidak edit
                setEditData(combinedData);   // Data awal untuk form edit
                setImagePreview(combinedData.foto_url); // Tampilkan foto profil awal

            } catch (error) {
                console.error("Error fetch data:", (error as Error).message);
                setErrorMessage((error as Error).message);
            } finally {
                setIsFetching(false); // Selesai loading awal
            }
        }

        fetchProfileData();
    }, [supabase]); // Dependensi: jalankan ulang jika supabase berubah (jarang terjadi)

    // === 2. LOGIKA TOMBOL EDIT / CANCEL ===
    const handleEdit = () => {
        // Salin data asli ke form edit saat tombol Edit diklik
        setEditData(profileData);
        // Reset preview ke foto asli
        setImagePreview(profileData.foto_url);
        setSelectedFile(null); // Hapus file yang mungkin dipilih sebelumnya
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Kembalikan data form ke data asli
        setEditData(profileData);
        // Reset preview ke foto asli
        setImagePreview(profileData.foto_url);
        setSelectedFile(null);
        setIsEditing(false);
    };

    // === 3. LOGIKA GANTI FOTO ===
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file); // Simpan file yang dipilih
            setImagePreview(URL.createObjectURL(file)); // Tampilkan preview
        }
    };

    // === 4. LOGIKA SAVE (UPSERT) ===
    const handleSave = async () => {
        setIsLoading(true); // Mulai loading simpan
        setErrorMessage(null);

        try {
            // Dapatkan user ID lagi (penting untuk path file)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");

            // Siapkan data teks HANYA untuk tabel 'profile_penjual'
            const dataToUpsert: any = {
                id: user.id, // Kunci utama untuk UPSERT
                store_name: editData.store_name,
                owner_name: editData.owner_name,
                phone: editData.phone,
                address: editData.address,
                description: editData.description,
                updated_at: new Date().toISOString(), // Update timestamp
            };

            // --- Logika Upload Foto (jika ada file baru) ---
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                // Gunakan nama file yang konsisten, misal user_id.ext
                const filePath = `${user.id}.${fileExt}`;

                // Upload ke bucket 'profile-fotos' dengan upsert: true
                // Ini akan menimpa file lama jika ada, atau membuat baru jika tidak ada
                const { error: uploadError } = await supabase.storage
                    .from('profile-fotos') // Nama bucket Anda
                    .upload(filePath, selectedFile, { upsert: true });

                if (uploadError) {
                    throw new Error(`Gagal upload foto: ${uploadError.message}`);
                }

                // Dapatkan URL publik dari file yang baru diupload/diupdate
                const { data: urlData } = supabase.storage
                    .from('profile-fotos')
                    .getPublicUrl(filePath);

                // Tambahkan URL ke dataToUpsert, tambahkan timestamp untuk cache busting
                dataToUpsert.foto_url = `${urlData.publicUrl}?t=${new Date().getTime()}`;
            }
            // Jika selectedFile null, properti foto_url tidak akan ada di dataToUpsert
            // Supabase akan membiarkan kolom foto_url di database tidak berubah

            // --- Jalankan UPSERT ke tabel 'profile_penjual' ---
            const { data: upsertedData, error } = await supabase
                .from('profile_penjual')
                .upsert(dataToUpsert)
                .select() // Kembalikan data yang baru di-upsert
                .single(); // Kita hanya butuh satu baris

            if (error) {
                // Error bisa terjadi karena RLS (jika user bukan 'penjual') atau masalah lain
                throw error;
            }

            // --- Sukses! ---
            if (upsertedData) {
                // Update state profileData (yang tampil saat tidak edit)
                // dengan data terbaru dari database
                // Kita gabungkan lagi dengan username & email yang tidak berubah
                setProfileData({
                    ...profileData, // Ambil username & email dari state lama
                    ...upsertedData // Timpa sisanya dengan data baru dari DB
                });
            }

            setIsEditing(false); // Keluar dari mode edit
            setSelectedFile(null); // Bersihkan state file

        } catch (error) {
            console.error("Error simpan profil:", (error as Error).message);
            setErrorMessage((error as Error).message);
        } finally {
            setIsLoading(false); // Selesai loading simpan
        }
    };

    // --- Tampilan Loading Awal ---
    if (isFetching) {
        return (
            <MainLayoutPenjual>
                <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            </MainLayoutPenjual>
        );
    }

    // --- Tampilan Form ---
    return (
        <MainLayoutPenjual>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profil Penjual</h1>
                <p className="text-gray-600 mt-1">Kelola informasi toko dan profil Anda</p>
            </div>

            {/* Tampilkan Error jika ada */}
            {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Terjadi Kesalahan</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Grid Layout Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Kolom Kiri: Foto & Info Kontak */}
                <div className="lg:col-span-1">
                    <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center">
                                {/* AVATAR FOTO */}
                                <div className="relative group">
                                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                                        <AvatarImage
                                            // Tampilkan preview jika ada file baru, jika tidak, tampilkan foto dari DB
                                            src={imagePreview || undefined}
                                            alt={profileData.store_name || "Foto Profil"}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-400 to-cyan-500 text-white">
                                            {/* Tampilkan inisial nama toko jika ada, jika tidak, ikon kamera */}
                                            {profileData.store_name ? profileData.store_name.charAt(0) : <Camera />}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Input File Tersembunyi */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                    />
                                    {/* Tombol Ganti Foto (Hanya saat Editing) */}
                                    {isEditing && (
                                        <button
                                            type="button" // Hindari submit form
                                            onClick={() => fileInputRef.current?.click()} // Klik input file
                                            className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors"
                                            aria-label="Ganti foto profil"
                                        >
                                            <Camera className="w-5 h-5 text-blue-600" />
                                        </button>
                                    )}
                                </div>

                                {/* Nama Toko & Pemilik (Tampil saat tidak edit) */}
                                <h2 className="mt-4 text-xl font-bold text-gray-800">{profileData.store_name || <span className="text-gray-400 font-normal">Nama Toko Belum Diatur</span>}</h2>
                                <p className="text-gray-500 text-sm">{profileData.owner_name || <span className="text-gray-400">Nama Pemilik Belum Diatur</span>}</p>

                                {/* Info Kontak (Selalu tampil dari profileData) */}
                                <div className="w-full mt-6 space-y-3">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="text-gray-600 break-all">{profileData.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="text-gray-600">{profileData.phone || "-"}</span>
                                    </div>
                                    <div className="flex items-start space-x-3 text-sm">
                                        <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600">{profileData.address || "-"}</span>
                                    </div>
                                </div>

                                {/* Statistik Dummy (Tidak berubah) */}
                                <div className="w-full mt-6 pt-6 border-t border-gray-100">
                                    {/* ... statistik Anda ... */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Kolom Kanan: Form Informasi Toko */}
                {/* Menggunakan div biasa, bukan tag <form> karena kita trigger save via button */}
                <div className="lg:col-span-2">
                    <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl">Informasi Toko</CardTitle>
                                    <CardDescription>Detail informasi toko Anda</CardDescription>
                                </div>
                                {/* Tombol Edit/Simpan/Batal */}
                                {!isEditing ? (
                                    <Button
                                        onClick={handleEdit}
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            disabled={isLoading} // Disable saat proses simpan
                                            className="border-gray-300"
                                        > Batal </Button>
                                        <Button
                                            onClick={handleSave} // Trigger fungsi save
                                            disabled={isLoading} // Disable saat proses simpan
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                            Simpan
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {/* Nama Pengguna (Read-Only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pengguna</label>
                                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed">
                                        {profileData.username} {/* Selalu tampilkan dari profileData */}
                                    </div>
                                </div>

                                {/* Email (Read-Only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed">
                                        {profileData.email} {/* Selalu tampilkan dari profileData */}
                                    </div>
                                </div>

                                {/* Nama Toko (Editable) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Toko</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.store_name} // Nilai dari state editData
                                            onChange={(e) => setEditData({ ...editData, store_name: e.target.value })} // Update state editData
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {/* Tampilkan dari profileData atau placeholder */}
                                            {profileData.store_name || <span className="text-gray-400 italic">Belum diatur</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Nama Lengkap Pemilik (Editable) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap Pemilik</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.owner_name}
                                            onChange={(e) => setEditData({ ...editData, owner_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {profileData.owner_name || <span className="text-gray-400 italic">Belum diatur</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Nomor Telepon (Editable) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {profileData.phone || <span className="text-gray-400 italic">Belum diatur</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Alamat Toko (Editable) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Toko</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {profileData.address || <span className="text-gray-400 italic">Belum diatur</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Deskripsi Toko (Editable) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Toko</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.description}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800 whitespace-pre-line">
                                            {profileData.description || <span className="text-gray-400 italic">Belum diatur</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayoutPenjual>
    );
}