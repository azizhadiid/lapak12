"use client"

import React, { useEffect, useRef, useState } from "react";

import MainLayoutPembeli from "../MainLayoutPembeli";
import ProfileSidebarCard from "../components/ProfileSidebarCard";
import ProfileDataForm from "../components/ProfileDataForm";
import ProfileAddressList from "../components/ProfileAddressList";
import { ProfilePembeliData } from "@/lib/types/profilePembeli";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const defaultProfile: ProfilePembeliData = {
    username: 'Memuat...',
    email: 'Memuat...',
    full_name: '',
    phone: null,
    gender: null,
    birth_date: null,
    foto_url: null,
    addresses: [] // (Untuk nanti)
};

export default function ProfilePembeliPage() {
    const supabase = createClientComponentClient();

    // State
    const [isEditing, setIsEditing] = useState(false);
    const [isFetching, setIsFetching] = useState(true); // Loading data awal
    const [isLoading, setIsLoading] = useState(false); // Loading saat menyimpan
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State untuk data
    const [profileData, setProfileData] = useState<ProfilePembeliData>(defaultProfile);
    const [editData, setEditData] = useState<ProfilePembeliData>(defaultProfile);

    // State untuk upload foto
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // === 1. FETCH DATA ===
    useEffect(() => {
        async function fetchProfileData() {
            setIsFetching(true);
            setErrorMessage(null);

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User tidak ditemukan. Silakan login ulang.");

                let combinedData: ProfilePembeliData = { ...defaultProfile };

                // A. Ambil data dari tabel 'users' (username & email)
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('username, email')
                    .eq('id', user.id)
                    .single();

                if (userError) throw new Error(`Gagal mengambil data user: ${userError.message}`);

                combinedData.username = userData.username;
                combinedData.email = userData.email;

                // B. Ambil data dari tabel 'profile_pembeli'
                const { data: profileDb, error: profileError } = await supabase
                    .from('profile_pembeli')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Abaikan error jika profil belum ada (PGRST116: no rows found)
                if (profileError && profileError.code !== 'PGRST116') {
                    throw new Error(`Gagal mengambil profil: ${profileError.message}`);
                }

                // C. Gabungkan data jika profil ada
                if (profileDb) {
                    combinedData = { ...combinedData, ...profileDb };
                }

                // D. Set semua state
                setProfileData(combinedData);
                setEditData(combinedData);
                setImagePreview(combinedData.foto_url);

            } catch (error) {
                console.error("Error fetch data:", (error as Error).message);
                setErrorMessage((error as Error).message);
            } finally {
                setIsFetching(false);
            }
        }

        fetchProfileData();
    }, [supabase]);

    // === 2. HANDLER UPLOAD FOTO ===
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file); // Simpan file-nya untuk di-upload
            setImagePreview(URL.createObjectURL(file)); // Buat preview di client
        }
    };

    // === 3. HANDLER TOMBOL KONTROL ===
    const handleEdit = () => {
        setEditData(profileData); // Reset data editan ke data asli
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditData(profileData); // Kembalikan data editan ke data asli
        setSelectedFile(null); // Batalkan pilihan file
        setImagePreview(profileData.foto_url); // Kembalikan preview ke foto asli
        setIsEditing(false);
    };

    // === 4. HANDLER SIMPAN (UPDATE) ===
    const handleSave = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");

            let updatedFotoUrl = editData.foto_url; // Default-nya adalah URL yang lama

            // --- A. Proses Upload Foto Jika Ada File Baru ---
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                // Gunakan User ID sebagai nama file agar unik dan menimpa
                const filePath = `${user.id}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('profile-foto-pembeli') // Nama bucket Anda
                    .upload(filePath, selectedFile, {
                        upsert: true, // Timpa file lama jika ada
                        cacheControl: '3600'
                    });

                if (uploadError) throw new Error(`Gagal upload foto: ${uploadError.message}`);

                // Dapatkan URL publik dari file yang baru diupload
                const { data: urlData } = supabase.storage
                    .from('profile-foto-pembeli')
                    .getPublicUrl(filePath);

                // Tambahkan timestamp untuk 'cache-busting' (agar browser ambil file baru)
                updatedFotoUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
            }

            // --- B. Siapkan Data Teks untuk di-Upsert ---
            const dataToUpsert = {
                id: user.id, // Kunci utama untuk UPSERT
                full_name: editData.full_name,
                phone: editData.phone,
                gender: editData.gender,
                birth_date: editData.birth_date,
                foto_url: updatedFotoUrl, // URL baru (jika diupload) atau URL lama
                // updated_at akan di-handle oleh trigger di DB
            };

            // --- C. Lakukan Upsert ke 'profile_pembeli' ---
            const { data: upsertedData, error: upsertError } = await supabase
                .from('profile_pembeli')
                .upsert(dataToUpsert)
                .select() // Kembalikan data yang baru di-update
                .single();

            if (upsertError) {
                // RLS Policy mungkin menolak
                if (upsertError.code === '42501') {
                    throw new Error("Akses ditolak. Pastikan role Anda adalah 'pembeli'.");
                }
                throw upsertError;
            }

            // --- D. Sukses! Update State Lokal ---
            if (upsertedData) {
                const finalUpdatedData = {
                    ...profileData, // Ambil username & email dari state lama
                    ...upsertedData // Timpa sisanya dengan data baru dari DB
                };
                setProfileData(finalUpdatedData);
                setEditData(finalUpdatedData);
            }

            setIsEditing(false);
            setSelectedFile(null); // Bersihkan file yang dipilih

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
            <MainLayoutPembeli>
                <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            </MainLayoutPembeli>
        );
    }

    return (
        <MainLayoutPembeli>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
                <p className="text-gray-600 mt-1">Kelola informasi pribadi dan alamat pengiriman Anda</p>
            </div>

            {/* Tampilkan Error jika ada */}
            {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Terjadi Kesalahan</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <ProfileSidebarCard
                        profileData={profileData}
                        imagePreview={imagePreview} // Kirim preview URL
                        isEditing={isEditing}
                        fileInputRef={fileInputRef} // Kirim ref
                        onImageChange={handleImageChange} // Kirim handler
                    />
                </div>

                {/* Information Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <ProfileDataForm
                        isEditing={isEditing}
                        isLoading={isLoading} // Kirim state loading
                        editData={editData}
                        profileData={profileData}
                        setEditData={setEditData} // Kirim setter
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />

                    {/* Shipping Addresses */}
                    {/* <ProfileAddressList
                        isEditing={isEditing}
                        addresses={isEditing ? editData.addresses : profileData.addresses}
                        onSetDefault={setDefaultAddress}
                    /> */}
                </div>
            </div>
        </MainLayoutPembeli>
    );
}