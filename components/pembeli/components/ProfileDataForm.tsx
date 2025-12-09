"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit2, Loader2 } from "lucide-react";
import { ProfilePembeliData } from "@/lib/types/profilePembeli";

type ProfileDataFormProps = {
    isEditing: boolean;
    isLoading: boolean; // Terima state loading
    editData: ProfilePembeliData;
    profileData: ProfilePembeliData;
    setEditData: React.Dispatch<React.SetStateAction<ProfilePembeliData>>;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function ProfileDataForm({
    isEditing,
    isLoading,
    editData,
    profileData,
    setEditData,
    onEdit,
    onSave,
    onCancel
}: ProfileDataFormProps) {
    // Handler internal untuk input, agar komponen induk tidak perlu tahu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    // Format tanggal YYYY-MM-DD untuk input type="date"
    const getFormattedDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().split('T')[0];
        } catch {
            return '';
        }
    }

    return (
        <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100">
                <div>
                    <CardTitle className="text-xl">Informasi Pribadi</CardTitle>
                    <CardDescription>Data diri Anda di Lapak 12</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">

                    {/* KOREKSI: Field Username (Read-Only dari tabel users) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pengguna</label>
                        <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed">
                            {profileData.username}
                        </div>
                    </div>

                    {/* KOREKSI: Field Email (Read-Only dari tabel users) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed">
                            {profileData.email}
                        </div>
                    </div>

                    {/* Field Nama Lengkap (Editable dari profile_pembeli) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="full_name" // <-- Sesuai skema DB
                                value={editData.full_name || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        ) : (
                            <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                {profileData.full_name || <span className="text-gray-400 italic">Belum diatur</span>}
                            </div>
                        )}
                    </div>

                    {/* Field Nomor Telepon (Editable) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={editData.phone || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        ) : (
                            <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                {profileData.phone || <span className="text-gray-400 italic">Belum diatur</span>}
                            </div>
                        )}
                    </div>

                    {/* Field Alamat (Editable) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="address"
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        ) : (
                            <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                <span className="text-gray-400 italic">Belum diatur</span>
                            </div>
                        )}
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Field Jenis Kelamin (Editable) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                            {isEditing ? (
                                <select
                                    name="gender"
                                    value={editData.gender || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="" disabled>Pilih...</option>
                                    <option value="laki-laki">Laki-laki</option>
                                    <option value="perempuan">Perempuan</option>
                                </select>
                            ) : (
                                <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                    {profileData.gender || <span className="text-gray-400 italic">Belum diatur</span>}
                                </div>
                            )}
                        </div>

                        {/* Field Tanggal Lahir (Editable) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="birth_date" // <-- Sesuai skema DB
                                    value={getFormattedDate(editData.birth_date)}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            ) : (
                                <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                    {profileData.birth_date
                                        ? new Date(profileData.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : <span className="text-gray-400 italic">Belum diatur</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tombol Edit/Simpan/Batal */}
                    {!isEditing ? (
                        <div className="flex justify-end pt-4">
                            <Button
                                type="button"
                                onClick={onEdit}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Profil
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                onClick={onCancel}
                                variant="outline"
                                className="border-gray-300"
                                disabled={isLoading} // Disable saat menyimpan
                            >
                                Batal
                            </Button>
                            <Button
                                type="button" // Gunakan onClick dari props
                                onClick={onSave}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                disabled={isLoading} // Disable saat menyimpan
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4 mr-2" />
                                )}
                                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}