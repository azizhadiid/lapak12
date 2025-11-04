import PencatatanPageComponent from '@/components/penjual/pages/PencatatanPage';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Pencatatan Penjualan', // Ini akan mengisi placeholder %s
};

export default function PencatatanPenjualanPage() {
    return <PencatatanPageComponent />;
}