import { Check, LayoutDashboard, Store, TrendingUp, } from "lucide-react";

export default function SectionIlustrationAuthPenjual() {
    // Daftar keuntungan untuk pembeli
    const sellerBenefits = [
        {
            text: 'Pendaftaran Gratis & Mudah',
            icon: <Check className="w-5 h-5 text-white" strokeWidth={3} />
        },
        {
            text: 'Dashboard Penjual Intuitif',
            icon: <LayoutDashboard className="w-5 h-5 text-white" strokeWidth={3} />
        },
        {
            text: 'Jangkauan Pasar Luas',
            icon: <Store className="w-5 h-5 text-white" strokeWidth={3} />
        },
        {
            text: 'Pencairan Dana Cepat',
            icon: <TrendingUp className="w-5 h-5 text-white" strokeWidth={3} />
        },
    ];

    return (
        <>
            <div className="hidden lg:block space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Mulai Berjualan Sekarang {/* <-- Diubah */}
                    </div>
                    <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                        Bergabung dengan<br /> {/* <-- Diubah */}
                        <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            Ribuan Seller {/* <-- Diubah */}
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-md">
                        Daftar gratis dan mulai jual produk Anda ke seluruh Indonesia dengan mudah dan cepat. {/* <-- Diubah */}
                    </p>
                </div>

                {/* Keuntungan (Diubah untuk PENJUAL) */}
                <div className="space-y-4">
                    {sellerBenefits.map((benefit, idx) => ( // <-- Diubah
                        <div key={idx} className="flex items-center gap-3 group">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                {benefit.icon}
                            </div>
                            <span className="text-gray-700 font-medium">{benefit.text}</span>
                        </div>
                    ))}
                </div>

                {/* Ilustrasi (Menggunakan img tag) */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 blur-3xl opacity-10 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 p-8 rounded-3xl overflow-hidden">
                        <img
                            src="/ilustrasi/shope.png"
                            alt="Ilustrasi Penjual"
                            className="w-full h-auto"
                            onError={(e) => {
                                // Fallback jika gambar gagal dimuat
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = 'https://placehold.co/400x300/E0F2FE/0284C7?text=Ilustrasi&font=sans';
                                target.alt = 'Gagal memuat ilustrasi';
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}