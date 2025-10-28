import SellerProfile from '@/components/penjual/ProfilePage';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Profile Penjual', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function LoginPage() {
    // Tugasnya hanya me-render Client Component
    return <SellerProfile/>;
}