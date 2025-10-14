import RegisterForm from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Daftar Akun', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function RegisterPage() {
    // Tugasnya hanya me-render Client Component
    return <RegisterForm />;
}