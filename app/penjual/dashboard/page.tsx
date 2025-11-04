import DashboardPageComponent from '@/components/penjual/pages/DashboardPage';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Dashboard Penjual', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function DashboardPage() {
    // Tugasnya hanya me-render Client Component
    return <DashboardPageComponent />;
}