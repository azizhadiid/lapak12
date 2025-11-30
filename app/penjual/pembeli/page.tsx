import AkunPemebliPenjualanPage from '@/components/penjual/pages/PembeliBaikPage';
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Daftar Akun Pembeli', // Ini akan mengisi placeholder %s
};

export default function PemebliPenjualanPage() {
    return <AkunPemebliPenjualanPage />;
}