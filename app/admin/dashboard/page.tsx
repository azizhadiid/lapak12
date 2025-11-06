import DashboardAdminPageComponent from '@/components/admin/pages/DashboardPageAdmin';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Dashboard Admin', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function DashboardAdminPage() {
    // Tugasnya hanya me-render Client Component
    return <DashboardAdminPageComponent />;
}