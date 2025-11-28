import { Store } from "lucide-react";

export default function FooterPenjual() {
    return (
        // Hapus div pembungkus yang tidak perlu
        <footer className="mt-16 py-8 border-t border-gray-200 bg-white shadow-inner">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">

                    {/* Bagian Kiri: Logo/Nama Toko */}
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <img
                            src="/logo.png"
                            alt="Lapak12 Logo"
                            className="w-auto h-11"
                            onError={(e) => {
                                // Menambahkan fallback jika gambar gagal dimuat
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = 'https://placehold.co/44x44/cccccc/333333?text=Logo&font=sans';
                                target.alt = 'Gagal memuat logo';
                            }}
                        />
                    </div>

                    {/* Bagian Kanan: Copyright */}
                    <p className="text-center md:text-right">
                        © {new Date().getFullYear()} Lapak 12. Semua hak dilindungi.
                    </p>

                </div>

                {/* Garis Pembatas (Opsional) */}
                <hr className="my-6 border-gray-100 hidden md:block" />

                {/* Tautan Tambahan (Contoh) */}
                <div className="flex justify-center md:justify-end space-x-6 mt-4">
                    <a href="#" className="hover:text-blue-600 transition-colors">Bantuan</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Privasi</a>
                </div>
            </div>
        </footer>
    );
}