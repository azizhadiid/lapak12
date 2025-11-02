import RegisterPageComponent from "@/components/auth/pages/RegisterPageComponent";
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Daftar Akun', // Ini akan mengisi placeholder %s
};

export default function RegisterPage() {
    return (
        <RegisterPageComponent />
    );
}