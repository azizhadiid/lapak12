"use client"

import React, { useEffect, useRef, useState } from "react";

import MainLayoutPembeli from "../MainLayoutPembeli";
import ProfileSidebarCard from "../components/ProfileSidebarCard";
import ProfileDataForm from "../components/ProfileDataForm";
import { ProfilePembeliData } from "@/lib/types/profilePembeli";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Swal from 'sweetalert2';

const defaultProfile: ProfilePembeliData = {
    username: 'Memuat...',
    email: 'Memuat...',
    full_name: '',
    phone: null,
    gender: null,
    birth_date: null,
    foto_url: null,
    address: null // (Untuk nanti)
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
        setErrorMessage(null); // Reset error message lokal

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sesi berakhir. Silakan login ulang.");

            // --- 1. VALIDASI KLIEN (Sesuai Permintaan Anda) ---
            // Mengubah phone dari string (input) ke BigInt (DB) akan terjadi otomatis di Supabase/PostgREST
            // Namun, pastikan nilainya berupa angka dan tidak mengandung string terlarang.

            // Hapus 'string' dan 'uniq' dari phone (walaupun tipe input="number" harusnya mencegah)
            if (editData.phone !== null && typeof editData.phone === 'string') {
                const phoneAsString = editData.phone.toString().toLowerCase();
                if (phoneAsString.includes("string") || phoneAsString.includes("uniq")) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Menyimpan',
                        text: 'Nomor telepon tidak boleh mengandung string "string" atau "uniq".',
                        confirmButtonText: 'OK'
                    });
                    setIsLoading(false);
                    return;
                }
            }

            // --- 2. Filter Data yang Berubah dan Siapkan dataToUpsert ---
            const changedData: Partial<ProfilePembeliData> = {};

            // Bandingkan setiap field yang diizinkan untuk di-update
            const updatableFields: Array<keyof ProfilePembeliData> = [
                'full_name', 'phone', 'gender', 'birth_date', 'address'
            ];

            let isDataChanged = false;

            for (const key of updatableFields) {
                // Perbandingan harus menangani null/string/number dengan aman

                // Jika input kosong (''), konversi ke null agar sesuai skema DB (jika nullable)
                const newValue = editData[key] === '' ? null : editData[key];
                const oldValue = profileData[key] === '' ? null : profileData[key];

                // Khusus untuk phone, Supabase mungkin mengembalikan BigInt (number), tapi input kita string.
                // Menggunakan JSON.stringify untuk perbandingan yang lebih aman antara number/string/null
                if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                    changedData[key] = newValue as any;
                    isDataChanged = true;
                }
            }

            let updatedFotoUrl = editData.foto_url;

            // Tambahkan foto_url jika ada file baru, terlepas dari apakah foto_url sebelumnya berbeda
            if (selectedFile) {
                isDataChanged = true; // Perubahan foto juga termasuk perubahan
            } else if (updatedFotoUrl !== profileData.foto_url) {
                isDataChanged = true; // Jika foto_url di-reset secara manual
            }


            // --- Cek Jika Tidak Ada Perubahan ---
            if (!isDataChanged) {
                Swal.fire({
                    icon: 'info',
                    title: 'Tidak Ada Perubahan',
                    text: 'Tidak ada data profil yang diubah untuk disimpan.',
                    confirmButtonText: 'OK'
                });
                setIsLoading(false);
                setIsEditing(false);
                return;
            }

            // --- 3. Proses Upload Foto Jika Ada File Baru ---
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const filePath = `${user.id}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('profile-foto-pembeli')
                    .upload(filePath, selectedFile, {
                        upsert: true,
                        cacheControl: '3600'
                    });

                if (uploadError) throw new Error(`Gagal upload foto: ${uploadError.message}`);

                const { data: urlData } = supabase.storage
                    .from('profile-foto-pembeli')
                    .getPublicUrl(filePath);

                updatedFotoUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
                changedData.foto_url = updatedFotoUrl; // Masukkan URL baru ke data yang di-upsert
            } else {
                // Jika tidak ada upload, pastikan foto_url yang lama tetap dikirim 
                // JIKA FOTO_URL adalah satu-satunya perubahan (walaupun ini jarang terjadi)
                changedData.foto_url = updatedFotoUrl;
            }


            // --- 4. Lakukan Upsert ke 'profile_pembeli' ---
            const dataToUpsert = {
                id: user.id, // Kunci utama untuk UPSERT
                ...changedData, // Hanya data yang berubah + foto_url
            };

            // Hapus 'addresses' jika ada, karena bukan kolom di profile_pembeli
            delete (dataToUpsert as any).addresses;


            const { data: upsertedData, error: upsertError } = await supabase
                .from('profile_pembeli')
                .upsert(dataToUpsert)
                .select()
                .single();

            if (upsertError) {
                // TANGANI ERROR DUPLIKAT (UNIQUE VIOLATION)
                // Kode 23505 adalah error Unique/Primary Key Violation di PostgreSQL/Supabase
                if (upsertError.code === '23505') {
                    // Cek apakah errornya spesifik untuk kolom 'phone'
                    if (upsertError.message.includes('profile_pembeli_phone_unique')) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Menyimpan!',
                            text: 'Nomor telepon yang Anda masukkan sudah terdaftar/digunakan oleh akun lain.',
                            confirmButtonText: 'Coba Lagi'
                        });
                        setIsLoading(false);
                        return; // Hentikan proses
                    }
                }

                // Tangani error RLS atau error umum lainnya
                if (upsertError.code === '42501') {
                    throw new Error("Akses ditolak. Pastikan role Anda adalah 'pembeli'.");
                }
                throw upsertError;
            }

            // --- 5. Sukses! Update State Lokal dan Tampilkan SweetAlert Sukses ---
            if (upsertedData) {
                const finalUpdatedData = {
                    ...profileData, // username & email dari state lama (tidak di-update)
                    ...upsertedData // data baru dari DB
                };
                setProfileData(finalUpdatedData);
                setEditData(finalUpdatedData);
                setImagePreview(finalUpdatedData.foto_url); // Update image preview

                // SweetAlert Sukses
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data profil Anda telah berhasil diperbarui.',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }

            setIsEditing(false);
            setSelectedFile(null);

        } catch (error) {
            console.error("Error simpan profil:", (error as Error).message);

            // Tampilkan error umum atau RLS error menggunakan SweetAlert
            const errorMessageText = (error as Error).message;

            Swal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: errorMessageText,
                confirmButtonText: 'OK'
            });

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