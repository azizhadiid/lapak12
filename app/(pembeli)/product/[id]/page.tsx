import DetailProductPembeli from '@/components/pembeli/pages/DetailProductPagePembeli';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Detail Produk', // Ini akan mengisi placeholder %s
};

// 💡 PERBAIKAN: Ubah menjadi fungsi async
export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;

    // Tambahkan pemeriksaan di sisi server (opsional, tapi bagus untuk debugging)
    if (!id) {
        console.error("Server: ID Produk hilang dari URL atau routing bermasalah.");
        return <div>Error: ID Produk hilang. Pastikan URL Anda sudah benar.</div>;
    }

    // Tugasnya hanya me-render Client Component dan meneruskan params yang sudah divalidasi
    return <DetailProductPembeli params={{ id }} />;
}