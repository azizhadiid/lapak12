// Tipe Data Gabungan
export type ProfileData = {
    // Dari 'users' (Read-only)
    username: string;
    email: string;

    // Dari 'profile_penjual' (Editable)
    store_name: string;
    owner_name: string;
    phone: string;
    address: string;
    description: string;
    foto_url: string | null;
};