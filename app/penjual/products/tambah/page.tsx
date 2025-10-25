import ProductUploadForm from '@/components/penjual/TambahPage';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Tambah Product', // Ini akan mengisi placeholder %s
};

// Ini adalah Server Component (tanpa "use client")
export default function TambahProductPage() {
    // Tugasnya hanya me-render Client Component
    return <ProductUploadForm />;
}