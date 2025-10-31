"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit2 } from "lucide-react";
import { ProfileDataType } from "@/lib/types/profilePembeli";

type ProfileDataFormProps = {
    isEditing: boolean;
    editData: ProfileDataType;
    profileData: ProfileDataType;
    setEditData: React.Dispatch<React.SetStateAction<ProfileDataType>>;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function ProfileDataForm({
    isEditing,
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="fullName" // 'name' harus cocok dengan key di state
                                value={editData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        ) : (
                            <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                {profileData.fullName}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={editData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            ) : (
                                <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                    {profileData.email}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            ) : (
                                <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                    {profileData.phone}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                            {isEditing ? (
                                <select
                                    name="gender"
                                    value={editData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            ) : (
                                <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                    {profileData.gender}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={editData.birthDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            ) : (
                                <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                    {new Date(profileData.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tombol Edit/Simpan/Batal */}
                    {!isEditing ? (
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={onEdit} // Panggil fungsi dari props
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Profil
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                onClick={onCancel} // Panggil fungsi dari props
                                variant="outline"
                                className="border-gray-300"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={onSave} // Panggil fungsi dari props
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}