import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockProducts = [
    { id: 1, name: 'Cheetos Puffs', price: 'Rp 5K', img: 'https://placehold.co/300x300/F97316/FFFFFF?text=Cheetos', tag: 'Promo' },
    { id: 2, name: 'Teh Gelas', price: 'Rp 1.5K', img: 'https://placehold.co/300x300/0284C7/FFFFFF?text=Teh+Gelas' },
    { id: 3, name: 'Makaroni', price: 'Rp 6K', img: 'https://placehold.co/300x300/FACC15/FFFFFF?text=Makaroni' },
    { id: 4, name: 'Head & Shoulders', price: 'Rp 7K', img: 'https://placehold.co/300x300/2563EB/FFFFFF?text=Shampoo' },
    { id: 5, name: 'Bimoli 1L', price: 'Rp 10K', img: 'https://placehold.co/300x300/F59E0B/FFFFFF?text=Bimoli', tag: 'Baru' },
    { id: 6, name: 'Indomie Mi Goreng', price: 'Rp 3.5K', img: 'https://placehold.co/300x300/DC2626/FFFFFF?text=Indomie' },
    { id: 7, name: 'Milo', price: 'Rp 6.5K', img: 'https://placehold.co/300x300/166534/FFFFFF?text=Milo' },
    { id: 8, name: 'Kecap Sedaap', price: 'Rp 21K', img: 'https://placehold.co/300x300/1F2937/FFFFFF?text=Kecap' },
];


export default function ProductCard({ product }: { product: typeof mockProducts[0] }) {


    return (
        <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg">
            <div className="relative h-48 w-full">
                <img
                    src={product.img}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = 'https://placehold.co/300x300/cccccc/333333?text=Error&font=sans';
                        target.alt = 'Gagal memuat gambar';
                    }}
                />
                {product.tag && (
                    <Badge
                        variant={product.tag === 'Promo' ? 'destructive' : 'default'}
                        className="absolute left-3 top-3"
                    >
                        {product.tag}
                    </Badge>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-base font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="mt-1 text-lg font-bold text-blue-600">{product.price}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button size="sm" className="w-full bg-blue-600">Beli</Button>
                    <Button size="sm" variant="outline" className="w-full">Keranjang</Button>
                </div>
            </div>
        </div>
    );
}