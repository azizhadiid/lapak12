import EditProductTable from '@/components/penjual/pages/EditProductPage';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Edit Product', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function TambahProductPage() {
    // Tugasnya hanya me-render Client Component
    return <EditProductTable />;
}