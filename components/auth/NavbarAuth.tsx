export default function NavbarAuth() {
    return (
        <>
            {/* Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Diubah menjadi tag img sesuai permintaan */}
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
            </header>
        </>
    );
}