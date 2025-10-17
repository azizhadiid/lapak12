import LoginForm from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Masuk', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function LoginPage() {
    // Tugasnya hanya me-render Client Component
    return <LoginForm />;
}