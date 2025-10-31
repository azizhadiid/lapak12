"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPinned } from "lucide-react";
import { AddressType } from "@/lib/types/profilePembeli";

type ProfileAddressListProps = {
    isEditing: boolean;
    addresses: AddressType[];
    onSetDefault: (id: number) => void;
}

export default function ProfileAddressList({ isEditing, addresses, onSetDefault }: ProfileAddressListProps) {
    return (
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
                    {addresses.map((address) => (
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
                                                onClick={() => onSetDefault(address.id)} // Panggil fungsi dari props
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
    );
}