"use client"

import React, { useState } from "react";

import MainLayoutPembeli from "../MainLayoutPembeli";
import ProfileSidebarCard from "../components/ProfileSidebarCard";
import ProfileDataForm from "../components/ProfileDataForm";
import ProfileAddressList from "../components/ProfileAddressList";

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
        setEditData(profileData); // Reset data editan ke data asli saat edit
        setIsEditing(true);
    };

    const handleSave = () => {
        // Logika untuk menyimpan ke database akan ada di sini
        setProfileData(editData); // Simpan data editan ke data asli
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(profileData); // Kembalikan data editan ke data asli
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
                    <ProfileSidebarCard profileData={profileData} />
                </div>

                {/* Information Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <ProfileDataForm
                        isEditing={isEditing}
                        editData={editData}
                        profileData={profileData}
                        setEditData={setEditData}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />

                    {/* Shipping Addresses */}
                    <ProfileAddressList
                        isEditing={isEditing}
                        addresses={isEditing ? editData.addresses : profileData.addresses}
                        onSetDefault={setDefaultAddress}
                    />
                </div>
            </div>
        </MainLayoutPembeli>
    );
}