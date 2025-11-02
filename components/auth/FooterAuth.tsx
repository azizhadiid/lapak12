import { QrCode, Wallet } from "lucide-react";

export default function FooterAuth() {
    return (
        <>
            <footer className="border-t border-gray-100 bg-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Layanan Bantuan</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Bantuan</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Hubungi Kami</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Jelajahi Lapak12</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Tentang Kami</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Karir</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                            </ul>
                        </div>

                        {/* Metode Pembayaran dengan Ikon (Telah Diperbaiki) */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Metode Pembayaran</h4>
                            <div className="flex flex-wrap gap-4 items-center">
                                {/* Menggunakan ikon pengganti dari lucide-react */}
                                <div title="QRIS" className="flex flex-col items-center gap-1 text-gray-700">
                                    <QrCode className="text-3xl" />
                                    <span className="text-xs font-medium">QRIS</span>
                                </div>
                                <div title="DANA" className="flex flex-col items-center gap-1 text-blue-500">
                                    <Wallet className="text-3xl" />
                                    <span className="text-xs font-medium">DANA</span>
                                </div>
                                <div title="OVO" className="flex flex-col items-center gap-1 text-purple-600">
                                    <Wallet className="text-3xl" />
                                    <span className="text-xs font-medium">OVO</span>
                                </div>
                                <div title="GoPay" className="flex flex-col items-center gap-1 text-blue-700">
                                    <Wallet className="text-3xl" />
                                    <span className="text-xs font-medium">GoPay</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Ikuti Kami</h4>
                            <div className="flex gap-3">
                                {/* Instagram Icon */}
                                <a href="#" aria-label="Instagram" className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                                {/* Facebook Icon */}
                                <a href="#" aria-label="Facebook" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-600">
                            © Lapak12 2025. Hak Cipta Dilindungi
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}