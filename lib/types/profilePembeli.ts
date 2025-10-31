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

export type ProfileDataType = {
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    birthDate: string;
    addresses: AddressType[];
};