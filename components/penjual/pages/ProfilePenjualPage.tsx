"use client"

import MainLayoutPenjual from "../MainLayoutPenjual";
import FormProfilePenjual from "../components/FormProfilePenjual";

export default function ProfilePenjualPage() {
    // --- Tampilan Form ---
    return (
        <MainLayoutPenjual>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profil Penjual</h1>
                <p className="text-gray-600 mt-1">Kelola informasi toko dan profil Anda</p>
            </div>

            <FormProfilePenjual />
        </MainLayoutPenjual>
    );
}