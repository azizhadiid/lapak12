import { Check, Package, ShieldCheck, Tag, } from "lucide-react";

export default function SectionIlustrationAuth() {
    // Daftar keuntungan untuk pembeli
    const buyerBenefits = [
        {
            text: 'Pendaftaran Gratis & Cepat',
            icon: <Check className="w-5 h-5 text-white" strokeWidth={3} />
        },
        {
            text: 'Jaminan Produk Original',
            icon: <ShieldCheck className="w-5 h-5 text-white" strokeWidth={3} />
        },
        {
            text: 'Dukungan Berbagai Metode Pembayaran',
            icon: <Package className="w-5 h-5 text-white" strokeWidth={3} />
        },
        {
            text: 'Promo & Diskon Menarik',
            icon: <Tag className="w-5 h-5 text-white" strokeWidth={3} />
        },
    ];

    return (
        <>
            <div className="hidden lg:block space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Mulai Berbelanja Sekarang
                    </div>
                    <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                        Temukan Jutaan<br />
                        <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            Produk Terbaik
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-md">
                        Daftar gratis dan nikmati kemudahan berbelanja di ujung jari Anda dengan promo menarik setiap hari.
                    </p>
                </div>

                {/* Keuntungan (Diubah untuk Pembeli) */}
                <div className="space-y-4">
                    {buyerBenefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3 group">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                {benefit.icon}
                            </div>
                            <span className="text-gray-700 font-medium">{benefit.text}</span>
                        </div>
                    ))}
                </div>

                {/* Ilustrasi (Diubah untuk Pembeli) */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 blur-3xl opacity-10 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 p-8 rounded-3xl overflow-hidden">
                        <img src="/ilustrasi/shope.png" alt="" className="w-5xl h-auto" />
                    </div>
                </div>
            </div>
        </>
    );
}