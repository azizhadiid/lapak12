import Link from "next/link";
import { FaFacebookSquare, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { SiShopee } from "react-icons/si";

export default function FooterPembeli() {
    return (
        <>
            <footer className="border-t border-gray-100 bg-white">
                <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
                        {/* Kolom 1: Logo & Sosial Media */}
                        <div className="col-span-2 md:col-span-2">
                            {/* Mengganti Link dengan <a> */}
                            <Link href="/" className="flex flex-shrink-0 items-center gap-2">
                                <div className="flex items-center justify-center rounded-lg">
                                    <img
                                        // Menggunakan placeholder yang lebih baik untuk logo
                                        src="/logo.png"
                                        alt="Lapak12 Logo"
                                        className="h-11 w-auto"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/100x44/cccccc/333333?text=Logo";
                                            e.currentTarget.alt = "Gagal memuat logo";
                                        }}
                                    />
                                </div>
                            </Link>
                            <p className="mt-4 text-sm text-gray-600">
                                Platform e-commerce RT 12.
                            </p>
                            <div className="mt-6 flex gap-4">
                                {/* Mengganti React Icons dengan Lucide Icons */}
                                <a href="#" aria-label="Instagram">
                                    <FaInstagram className="h-6 w-6 text-gray-400 hover:text-indigo-600 transition-colors" />
                                </a>
                                <a href="#" aria-label="Tiktok">
                                    <FaTiktok className="h-6 w-6 text-gray-400 hover:text-indigo-600 transition-colors" />
                                </a>
                                <a href="#" aria-label="Twitter">
                                    <FaSquareXTwitter className="h-6 w-6 text-gray-400 hover:text-indigo-600 transition-colors" />
                                </a>
                                <a href="#" aria-label="Facebook">
                                    <FaFacebookSquare className="h-6 w-6 text-gray-400 hover:text-indigo-600 transition-colors" />
                                </a><a href="#" aria-label="Shopee">
                                    <SiShopee className="h-6 w-6 text-gray-400 hover:text-indigo-600 transition-colors" />
                                </a>
                            </div>
                        </div>

                        {/* Kolom 2: Layanan */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Layanan</h3>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Bantuan</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Hubungi Kami</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Lacak Pesanan</a></li>
                            </ul>
                        </div>

                        {/* Kolom 3: Jelajahi */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Jelajahi</h3>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Tentang Kami</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Karir</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Blog</a></li>
                            </ul>
                        </div>

                        {/* Kolom 4: Pembayaran */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Pembayaran</h3>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li className="text-gray-600">QRIS</li>
                                <li className="text-gray-600">DANA</li>
                                <li className="text-gray-600">OVO</li>
                                <li className="text-gray-600">BANKING</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-gray-100 pt-8 text-center">
                        <p className="text-sm text-gray-600">
                            © Lapak 12 2025. Hak Cipta Dilindungi
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}