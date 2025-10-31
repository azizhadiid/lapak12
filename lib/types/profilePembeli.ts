export type AddressType = {
    id: number;
    label: string;
    recipientName: string;
    phone: string;
    fullAddress: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
};

export type ProfilePembeliData = {
    // Dari 'users' (Read-only)
    username: string;
    email: string;

    // Dari 'profile_pembeli' (Editable)
    full_name: string;      // <-- Sesuai skema DB
    phone: string | null;
    gender: string | null;
    birth_date: string | null;  // <-- Sesuai skema DB
    foto_url: string | null;

    // Dari tabel alamat (untuk nanti)
    addresses: AddressType[];
};