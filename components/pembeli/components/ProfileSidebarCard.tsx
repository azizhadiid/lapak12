"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Camera, Mail, Phone } from "lucide-react";
import { ProfileDataType } from "@/lib/types/profilePembeli";

type ProfileSidebarProps = {
    profileData: ProfileDataType;
}

export default function ProfileSidebarCard({ profileData }: ProfileSidebarProps) {
    return (
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
    );
}