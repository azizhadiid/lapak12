// lib/types.ts
export interface Penjualan {
    id?: number;
    user_id?: string;
    tanggal: string;
    kategori: string;
    nama_produk: string;
    jumlah: number;
    harga_satuan: number;
    total_harga: number;
    nama_pembeli: string;
    metode_pembayaran: string;
    created_at?: string;
}
