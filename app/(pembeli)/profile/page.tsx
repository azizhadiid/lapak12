
import ProfilePembeliPage from '@/components/pembeli/pages/ProfilePembeliPage';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Profile Pembeli', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function ProfilePembeli() {
    // Tugasnya hanya me-render Client Component
    return <ProfilePembeliPage />;
}