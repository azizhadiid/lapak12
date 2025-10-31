"use client"

import React, { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayoutPembeli from "../MainLayoutPembeli";
import { Calendar, Camera, Check, Edit2, Home, Mail, MapPinned, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePembeliPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@email.com',
        phone: '+62 821-9876-5432',
        gender: 'Perempuan',
        birthDate: '1995-08-15',
        addresses: [
            {
                id: 1,
                label: 'Rumah',
                recipientName: 'Siti Nurhaliza',
                phone: '+62 821-9876-5432',
                fullAddress: 'Jl. Sudirman No. 123, RT 05/RW 03, Kelurahan Menteng',
                city: 'Jakarta Pusat',
                province: 'DKI Jakarta',
                postalCode: '10310',
                isDefault: true
            },
            {
                id: 2,
                label: 'Kantor',
                recipientName: 'Siti Nurhaliza',
                phone: '+62 821-9876-5432',
                fullAddress: 'Gedung Plaza Indonesia Lt. 5, Jl. M.H. Thamrin',
                city: 'Jakarta Pusat',
                province: 'DKI Jakarta',
                postalCode: '10350',
                isDefault: false
            }
        ]
    });

    const [editData, setEditData] = useState(profileData);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setProfileData(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(profileData);
        setIsEditing(false);
    };

    const setDefaultAddress = (id: number) => {
        const updatedAddresses = editData.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        }));
        setEditData({ ...editData, addresses: updatedAddresses });
    };

    return (
        <MainLayoutPembeli>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
                <p className="text-gray-600 mt-1">Kelola informasi pribadi dan alamat pengiriman Anda</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                                        {profileData.fullName.charAt(0)}
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors">
                                        <Camera className="w-5 h-5 text-blue-600" />
                                    </button>
                                </div>

                                <h2 className="mt-4 text-xl font-bold text-gray-800">{profileData.fullName}</h2>
                                <p className="text-gray-500 text-sm">Pembeli</p>

                                <div className="w-full mt-6 space-y-3">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="text-gray-600 break-all">{profileData.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="text-gray-600">{profileData.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="text-gray-600">{new Date(profileData.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                <div className="w-full mt-6 pt-6 border-t border-gray-100">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">47</div>
                                            <div className="text-xs text-gray-500">Pesanan</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-pink-600">23</div>
                                            <div className="text-xs text-gray-500">Wishlist</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Information Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.fullName}
                                            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            />
                                        ) : (
                                            <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                                {profileData.email}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nomor Telepon
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Jenis Kelamin
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={editData.gender}
                                                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Lahir
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={editData.birthDate}
                                                onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            />
                                        ) : (
                                            <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                                {new Date(profileData.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!isEditing ? (
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={handleEdit}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit Profil
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            className="border-gray-300"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            onClick={handleSave}
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

                    {/* Shipping Addresses */}
                    <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl">Alamat Pengiriman</CardTitle>
                                    <CardDescription>Kelola alamat untuk pengiriman pesanan</CardDescription>
                                </div>
                                {isEditing && (
                                    <Button
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                    >
                                        + Tambah Alamat
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {(isEditing ? editData.addresses : profileData.addresses).map((address) => (
                                    <div
                                        key={address.id}
                                        className={`p-4 rounded-lg border-2 transition-all ${address.isDefault
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start space-x-3 flex-1">
                                                {address.label === 'Rumah' ? (
                                                    <Home className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                ) : (
                                                    <MapPinned className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="font-semibold text-gray-800">{address.label}</span>
                                                        {address.isDefault && (
                                                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                                                Utama
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700">{address.recipientName}</p>
                                                    <p className="text-sm text-gray-600">{address.phone}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{address.fullAddress}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {address.city}, {address.province} {address.postalCode}
                                                    </p>
                                                </div>
                                            </div>
                                            {isEditing && (
                                                <div className="flex flex-col space-y-2 ml-4">
                                                    {!address.isDefault && (
                                                        <Button
                                                            onClick={() => setDefaultAddress(address.id)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs border-blue-500 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            Jadikan Utama
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayoutPembeli>
    );
}