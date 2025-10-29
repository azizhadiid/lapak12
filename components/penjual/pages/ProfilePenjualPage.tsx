"use client"

import React, { useState } from "react";
import MainLayoutPenjual from "../MainLayoutPenjual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Check, Edit2, Mail, MapPin, Phone } from "lucide-react";

export default function ProfilePenjualPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        storeName: 'Toko Elektronik Jaya',
        ownerName: 'Budi Santoso',
        email: 'budi.santoso@lapak12.com',
        phone: '+62 812-3456-7890',
        address: 'Jl. Raya Menteng No. 45, Jakarta Pusat',
        description: 'Menjual berbagai macam produk elektronik berkualitas dengan harga terjangkau. Melayani pengiriman ke seluruh Indonesia.'
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

    return (
        <MainLayoutPenjual>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profil Penjual</h1>
                <p className="text-gray-600 mt-1">Kelola informasi toko dan profil Anda</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                                        {profileData.storeName.charAt(0)}
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors">
                                        <Camera className="w-5 h-5 text-blue-600" />
                                    </button>
                                </div>

                                <h2 className="mt-4 text-xl font-bold text-gray-800">{profileData.storeName}</h2>
                                <p className="text-gray-500 text-sm">{profileData.ownerName}</p>

                                <div className="w-full mt-6 space-y-3">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        <span className="text-gray-600 break-all">{profileData.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Phone className="w-4 h-4 text-blue-600" />
                                        <span className="text-gray-600">{profileData.phone}</span>
                                    </div>
                                    <div className="flex items-start space-x-3 text-sm">
                                        <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600">{profileData.address}</span>
                                    </div>
                                </div>

                                <div className="w-full mt-6 pt-6 border-t border-gray-100">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">248</div>
                                            <div className="text-xs text-gray-500">Produk</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-cyan-600">1.2K</div>
                                            <div className="text-xs text-gray-500">Terjual</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">4.8</div>
                                            <div className="text-xs text-gray-500">Rating</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Information Card */}
                <div className="lg:col-span-2">
                    <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl">Informasi Toko</CardTitle>
                                    <CardDescription>Detail informasi toko Anda</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button
                                        onClick={handleEdit}
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex space-x-2">
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
                                            Simpan
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Toko
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.storeName}
                                            onChange={(e) => setEditData({ ...editData, storeName: e.target.value })}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {profileData.storeName}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Pemilik
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.ownerName}
                                            onChange={(e) => setEditData({ ...editData, ownerName: e.target.value })}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {profileData.ownerName}
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {profileData.address}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi Toko
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.description}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-blue-50 rounded-lg text-gray-800">
                                            {profileData.description}
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