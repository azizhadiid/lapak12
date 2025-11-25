import HomePagePembeli from '@/components/pembeli/pages/HomePagePembeli';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Bernada', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function HomePage() {
    // Tugasnya hanya me-render Client Component
    return <HomePagePembeli />;
}