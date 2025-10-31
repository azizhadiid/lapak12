"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Camera, Mail, Phone } from "lucide-react";
import { ProfilePembeliData } from "@/lib/types/profilePembeli";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


type ProfileSidebarProps = {
    profileData: ProfilePembeliData;
    imagePreview: string | null;
    isEditing: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileSidebarCard({
    profileData,
    imagePreview,
    isEditing,
    fileInputRef,
    onImageChange
}: ProfileSidebarProps) {
    // Ambil inisial dari full_name, jika tidak ada, dari username
    const getInitial = () => {
        if (profileData.full_name) return profileData.full_name.charAt(0).toUpperCase();
        if (profileData.username) return profileData.username.charAt(0).toUpperCase();
        return "?";
    }

    return (
        <Card className="border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
                <div className="flex flex-col items-center">
                    <div className="relative group">

                        {/* Gunakan Komponen Avatar */}
                        <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                            <AvatarImage
                                src={imagePreview || undefined} // Tampilkan preview JIKA ADA
                                alt={profileData.full_name || "Foto Profil"}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                                {getInitial()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Input file tersembunyi */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onImageChange}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                        />

                        {/* Tombol ganti foto, HANYA muncul saat mode edit */}
                        {isEditing && (
                            <button
                                type="button" // Penting agar tidak submit form
                                onClick={() => fileInputRef.current?.click()} // Klik input tersembunyi
                                className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors"
                                aria-label="Ganti foto profil"
                            >
                                <Camera className="w-5 h-5 text-blue-600" />
                            </button>
                        )}
                    </div>

                    {/* Tampilkan full_name jika ada, jika tidak, username */}
                    <h2 className="mt-4 text-xl font-bold text-gray-800">
                        {profileData.full_name || profileData.username}
                    </h2>
                    <p className="text-gray-500 text-sm">Pembeli</p>

                    {/* Info Kontak */}
                    <div className="w-full mt-6 space-y-3">
                        <div className="flex items-center space-x-3 text-sm">
                            <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-600 break-all">{profileData.email}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-600">{profileData.phone || "-"}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-600">
                                {profileData.birth_date
                                    ? new Date(profileData.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}