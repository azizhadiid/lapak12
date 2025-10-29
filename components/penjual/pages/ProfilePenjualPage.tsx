// ProfilePenjualPage.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"; // <-- Tambah useEffect, useRef
import MainLayoutPenjual from "../MainLayoutPenjual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Check, Edit2, Mail, MapPin, Phone, Loader2, AlertCircle } from "lucide-react"; // <-- Tambah Loader2, AlertCircle
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // <-- Tambah Avatar
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // <-- Tambah Alert
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // <-- Tambah Supabase

// Tipe Data Gabungan
type ProfileData = {
    // Dari 'users' (Read-only)
    username: string; // <-- (BARU) Ganti storeName awal jadi username
    email: string;

    // Dari 'profile_penjual' (Editable)
    store_name: string; // <-- (BARU) Tambah store_name
    owner_name: string;
    phone: string;
    address: string;
    description: string;
    foto_url: string | null;
};

// Nilai Default
const defaultProfile: ProfileData = {
    username: 'Memuat...', // Default username
    email: 'Memuat...',
    store_name: '',
    owner_name: '',
    phone: '',
    address: '',
    description: '',
    foto_url: null,
};


export default function ProfilePenjualPage() {
    const supabase = createClientComponentClient();
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // === 1. FETCH DATA ===
    useEffect(() => {
        async function fetchProfileData() {
            setIsFetching(true);
            setErrorMessage(null);

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User tidak ditemukan.");

                let combinedData: ProfileData = { ...defaultProfile };

                // A. Ambil dari 'users'
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

                // B. Ambil dari 'profile_penjual'
                const { data: profileDataDb, error: profileError } = await supabase
                    .from('profile_penjual')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') { // Abaikan error 'no rows'
                    throw new Error(`Gagal ambil profil: ${profileError.message}`);
                }

                if (profileDataDb) {
                    combinedData.store_name = profileDataDb.store_name || '';
                    combinedData.owner_name = profileDataDb.owner_name || '';
                    combinedData.phone = profileDataDb.phone || '';
                    combinedData.address = profileDataDb.address || '';
                    combinedData.description = profileDataDb.description || '';
                    combinedData.foto_url = profileDataDb.foto_url || null;
                }

                // C. Set state
                setProfileData(combinedData);
                setEditData(combinedData);
                setImagePreview(combinedData.foto_url);

            } catch (error) {
                setErrorMessage((error as Error).message);
            } finally {
                setIsFetching(false);
            }
        }

        fetchProfileData();
    }, [supabase]);

    // === 2. LOGIKA TOMBOL EDIT/CANCEL ===
    const handleEdit = () => {
        setEditData(profileData);
        setImagePreview(profileData.foto_url);
        setSelectedFile(null);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditData(profileData);
        setImagePreview(profileData.foto_url);
        setSelectedFile(null);
        setIsEditing(false);
    };

    // === 3. LOGIKA GANTI FOTO ===
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // === 4. LOGIKA SAVE (UPSERT) ===
    const handleSave = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");

            // Data Teks
            const dataToUpsert: any = {
                id: user.id,
                store_name: editData.store_name,
                owner_name: editData.owner_name,
                phone: editData.phone,
                address: editData.address,
                description: editData.description,
                updated_at: new Date().toISOString(),
            };

            // Logika Foto
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const filePath = `${user.id}.${fileExt}`; // user_id.ext

                const { error: uploadError } = await supabase.storage
                    .from('profile-fotos')
                    .upload(filePath, selectedFile, { upsert: true });

                if (uploadError) throw new Error(`Gagal upload foto: ${uploadError.message}`);

                const { data: urlData } = supabase.storage
                    .from('profile-fotos')
                    .getPublicUrl(filePath);

                // Tambah ?t=timestamp untuk cache busting
                dataToUpsert.foto_url = `${urlData.publicUrl}?t=${new Date().getTime()}`;
            }
            // Jika tidak ada selectedFile, kolom foto_url tidak dikirim = tidak diubah

            // Jalankan Upsert
            const { data: upsertedData, error } = await supabase
                .from('profile_penjual')
                .upsert(dataToUpsert)
                .select()
                .single();

            if (error) throw error; // RLS akan error jika bukan penjual

            // Sukses! Update state data asli
            if (upsertedData) {
                // Gabungkan lagi dengan username & email
                setProfileData({ ...profileData, ...upsertedData });
            }

            setIsEditing(false);
            setSelectedFile(null);

        } catch (error) {
            console.error("Error simpan profil:", (error as Error).message);
            setErrorMessage((error as Error).message);
        } finally {
            setIsLoading(false);
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

    // --- Tampilan Form (JSX Anda yang Di-update) ---
    return (
        <MainLayoutPenjual>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profil Penjual</h1>
                <p className="text-gray-600 mt-1">Kelola informasi toko dan profil Anda</p>
            </div>

            {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 " />
                    <AlertTitle>Terjadi Kesalahan</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card (Kiri) */}
                <div className="lg:col-span-1">
                    <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center">
                                {/* AVATAR FOTO */}
                                <div className="relative group">
                                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                                        <AvatarImage
                                            src={imagePreview || undefined}
                                            alt={profileData.store_name || "Foto Profil"}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-400 to-cyan-500 text-white">
                                            {/* Tampilkan inisial jika tidak ada foto */}
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
                                    {/* Tombol Ganti Foto (Hanya muncul saat edit) */}
                                    {isEditing && (
                                        <button
                                            type="button" // Penting agar tidak submit form
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors"
                                        >
                                            <Camera className="w-5 h-5 text-blue-600" />
                                        </button>
                                    )}
                                </div>

                                <h2 className="mt-4 text-xl font-bold text-gray-800">{profileData.store_name || "Nama Toko Belum Diatur"}</h2>
                                <p className="text-gray-500 text-sm">{profileData.owner_name || "Nama Pemilik Belum Diatur"}</p>

                                {/* Kontak Read-Only (Info dari profileData) */}
                                <div className="w-full mt-6 space-y-3">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        <span className="text-gray-600 break-all">{profileData.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Phone className="w-4 h-4 text-blue-600" />
                                        <span className="text-gray-600">{profileData.phone || "-"}</span>
                                    </div>
                                    <div className="flex items-start space-x-3 text-sm">
                                        <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600">{profileData.address || "-"}</span>
                                    </div>
                                </div>

                                {/* Statistik Dummy (Anda bisa hapus/ganti nanti) */}
                                <div className="w-full mt-6 pt-6 border-t border-gray-100">
                                    {/* ... (kode statistik Anda) ... */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Information Card (Form Kanan) */}
                <form className="lg:col-span-2" onSubmit={(e) => e.preventDefault()}>
                    <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl">Informasi Toko</CardTitle>
                                    <CardDescription>Detail informasi toko Anda</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button onClick={handleEdit} /* ... */ >
                                        <Edit2 className="w-4 h-4 mr-2" />Edit
                                    </Button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <Button onClick={handleCancel} variant="outline" disabled={isLoading} /* ... */ >Batal</Button>
                                        <Button onClick={handleSave} disabled={isLoading} /* ... */ >
                                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Simpan
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
                                        {profileData.username} {/* Ambil dari profileData */}
                                    </div>
                                </div>
                                {/* Email (Read-Only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed">
                                        {profileData.email} {/* Ambil dari profileData */}
                                    </div>
                                </div>

                                {/* Nama Toko (Editable) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Toko</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.store_name}
                                            onChange={(e) => setEditData({ ...editData, store_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {profileData.store_name || <span className="text-gray-400">Belum diatur</span>}
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
                                            {profileData.owner_name || <span className="text-gray-400">Belum diatur</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                {profileData.phone || <span className="text-gray-400">Belum diatur</span>}
                                            </div>
                                        )}
                                    </div>
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
                                            {profileData.address || <span className="text-gray-400">Belum diatur</span>}
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
                                            {profileData.description || <span className="text-gray-400">Belum diatur</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </MainLayoutPenjual>
    );
}