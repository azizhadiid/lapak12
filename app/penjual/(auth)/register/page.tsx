import RegisterFormPenjual from '@/components/auth/RegisterFormPenjual';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Daftar Penjual', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function RegisterPage() {
    // Tugasnya hanya me-render Client Component
    return <RegisterFormPenjual />;
}