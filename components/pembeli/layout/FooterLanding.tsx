import { ShoppingCart } from "lucide-react";
import { BsInstagram } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa";
import { FiTwitter } from "react-icons/fi";

export default function FooterLandingPage() {
    return (
        <>
            <footer className="border-t border-gray-100 bg-white">
                <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
                        {/* Kolom 1: Logo & Sosial Media */}
                        <div className="col-span-2 md:col-span-2">
                            <a href="#" className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">Lapak12</span>
                            </a>
                            <p className="mt-4 text-sm text-gray-600">
                                Platform grosir B2B untuk warung dan toko kelontong.
                            </p>
                            <div className="mt-6 flex gap-4">
                                <a href="#" aria-label="Instagram">
                                    <BsInstagram className="h-6 w-6 text-gray-400 hover:text-gray-900" />
                                </a>
                                <a href="#" aria-label="Facebook">
                                    <FaFacebook className="h-6 w-6 text-gray-400 hover:text-gray-900" />
                                </a>
                                <a href="#" aria-label="Twitter">
                                    <FiTwitter className="h-6 w-6 text-gray-400 hover:text-gray-900" />
                                </a>
                            </div>
                        </div>

                        {/* Kolom 2: Layanan */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Layanan</h3>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Bantuan</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Hubungi Kami</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Lacak Pesanan</a></li>
                            </ul>
                        </div>

                        {/* Kolom 3: Jelajahi */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Jelajahi</h3>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Tentang Kami</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Karir</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                            </ul>
                        </div>

                        {/* Kolom 4: Pembayaran */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Pembayaran</h3>
                            {/* Di sini Anda bisa meletakkan ikon pembayaran seperti sebelumnya */}
                            <ul className="mt-4 space-y-3 text-sm">
                                <li className="text-gray-600">QRIS</li>
                                <li className="text-gray-600">DANA</li>
                                <li className="text-gray-600">OVO</li>
                                <li className="text-gray-600">GoPay</li>
                            </ul>
                        </div>

                    </div>

                    <div className="mt-12 border-t border-gray-100 pt-8 text-center">
                        <p className="text-sm text-gray-600">
                            © Lapak12 2025. Hak Cipta Dilindungi
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}