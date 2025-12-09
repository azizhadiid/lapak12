"use client"

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, Eye, CheckCircle, DollarSign, ShoppingCart, Loader2, Calendar, ChevronRight } from 'lucide-react';
import MainLayoutPenjual from "../MainLayoutPenjual";
import Link from 'next/link';
import { FaProductHunt } from 'react-icons/fa';
// Import Penjualan dari file Anda sebelumnya (asumsi sudah ada)
interface Penjualan {
    id: string;
    penjual_id: string;
    produk_id: string;
    tanggal: string;
    kategori: string;
    nama_produk_history: string;
    jumlah: number;
    harga_satuan: number;
    total_harga: number;
    nama_pembeli: string;
    metode_pembayaran: string;
    created_at: string;
    nama_produk: string;
}
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// --- Helper untuk format mata uang ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

// --- Komponen Skeleton Modern untuk Dashboard ---
const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse p-4 md:p-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-32">
                    <div className="h-4 bg-gray-200 w-1/3 mb-2 rounded"></div>
                    <div className="h-8 bg-gray-300 w-3/4 rounded"></div>
                </div>
            ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart Skeleton */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 h-[400px]">
                <div className="h-6 bg-gray-200 w-1/4 mb-6 rounded"></div>
                <div className="h-[280px] bg-gray-100 rounded"></div>
            </div>

            {/* Pie Chart Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-[400px]">
                <div className="h-6 bg-gray-200 w-1/2 mb-6 rounded"></div>
                <div className="h-[300px] bg-gray-100 rounded"></div>
            </div>
        </div>

        {/* Recent Orders Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-6 bg-gray-200 w-1/3 mb-6 rounded"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 bg-gray-100 rounded"></div>
                ))}
            </div>
        </div>
    </div>
);


export default function DashboardPageComponent() {
    // timeRange diaktifkan
    const [timeRange, setTimeRange] = useState('30hari');
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('Penjual');
    const [penjualanData, setPenjualanData] = useState<Penjualan[]>([]);

    const supabase = createClientComponentClient();
    const router = useRouter();

    // --- 1. FETCH DATA SAAT HALAMAN DIBUKA (TERGANTUNG timeRange) ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // 1. Dapatkan user yang login
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                toast.error("Gagal mendapatkan sesi. Silakan login ulang.");
                router.push('/login');
                return;
            }

            try {
                // 2. Dapatkan username dari tabel 'users'
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                if (userData?.username) {
                    setUsername(userData.username);
                }

                // 3. Tentukan filter tanggal berdasarkan timeRange
                let query = supabase
                    .from('penjualan')
                    .select('id, tanggal, kategori, nama_produk_history, jumlah, harga_satuan, total_harga, nama_pembeli, metode_pembayaran,created_at')
                    // FIX: Menggunakan penjual_id sesuai skema baru
                    .eq('penjual_id', user.id);

                const today = new Date();
                let filterDate = new Date();
                let isoDate: string | null = null;

                if (timeRange === '7hari') {
                    filterDate.setDate(today.getDate() - 7);
                    isoDate = filterDate.toISOString().split('T')[0]; // Ambil YYYY-MM-DD
                } else if (timeRange === '30hari') {
                    filterDate.setDate(today.getDate() - 30);
                    isoDate = filterDate.toISOString().split('T')[0];
                }
                // 'all' tidak memerlukan filter tanggal

                if (isoDate) {
                    query = query.gte('tanggal', isoDate); // Filter berdasarkan kolom tanggal
                }


                // 4. Eksekusi kueri penjualan
                const { data: salesData, error: salesError } = await query.order('tanggal', { ascending: false });

                if (salesError) throw salesError;

                // Memetakan data agar sesuai dengan interface Penjualan, menggunakan nama_produk_history
                const mappedSalesData: Penjualan[] = (salesData || []).map(sale => ({
                    ...sale,
                    // Menggunakan nama_produk_history dari DB
                    nama_produk: sale.nama_produk_history,
                    penjual_id: user.id, // Diisi manual karena tidak di-select
                    produk_id: '',
                    harga_satuan: parseFloat(sale.harga_satuan),
                    total_harga: parseFloat(sale.total_harga),
                    // Memastikan created_at ada (sudah di-select di query)
                    created_at: sale.created_at,
                    metode_pembayaran: sale.metode_pembayaran,
                }));

                setPenjualanData(mappedSalesData);

            } catch (error: any) {
                console.error("Error fetching dashboard data:", error);
                toast.error(`Gagal memuat data: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        // Tambahkan timeRange ke dependency array agar useEffect berjalan saat filter berubah
        fetchData();
    }, [supabase, router, timeRange]); // <-- DEPENDENCY BARU

    // --- 2. KALKULASI DATA DINAMIS ---

    // a. Untuk Stats Cards
    const totalPendapatan = penjualanData.reduce((acc, sale) => acc + sale.total_harga, 0);
    const totalPesanan = penjualanData.length;
    const totalProdukTerjual = penjualanData.reduce((acc, sale) => acc + sale.jumlah, 0);
    const rataRataPenjualan = totalPesanan > 0 ? (totalPendapatan / totalPesanan) : 0;

    const stats = [
        {
            title: 'Total Pendapatan',
            value: formatCurrency(totalPendapatan),
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            title: 'Total Pesanan',
            value: totalPesanan.toString(),
            icon: ShoppingCart,
            color: 'bg-blue-500',
        },
        {
            title: 'Produk Terjual',
            value: totalProdukTerjual.toString(),
            icon: Package,
            color: 'bg-purple-500',
        },
        {
            title: 'Rata-rata Pesanan',
            value: formatCurrency(rataRataPenjualan),
            icon: TrendingUp,
            color: 'bg-orange-500',
        },
    ];

    // b. Untuk Grafik Pendapatan (Line Chart)
    const monthlyData = [...penjualanData]
        .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
        .reduce((acc, sale) => {
            const date = new Date(sale.tanggal);
            // Gunakan format yang lebih sesuai, YYYY-MM-DD
            const key = date.toISOString().split('T')[0];

            if (!acc[key]) {
                // Gunakan format tanggal yang lebih user-friendly untuk label grafik
                const label = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                acc[key] = { date: key, label: label, pendapatan: 0, pesanan: 0 };
            }
            acc[key].pendapatan += sale.total_harga;
            acc[key].pesanan += 1;
            return acc;
        }, {} as { [key: string]: { date: string, label: string, pendapatan: number, pesanan: number } });

    // Mengubah objek menjadi array yang diurutkan berdasarkan tanggal
    const processedRevenueData = Object.values(monthlyData)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // c. Untuk Grafik Kategori (Pie Chart)
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e'];
    const categoryData = penjualanData.reduce((acc, sale) => {
        const kategori = sale.kategori;
        if (!acc[kategori]) {
            acc[kategori] = { name: kategori, value: 0 };
        }
        acc[kategori].value += sale.total_harga;
        return acc;
    }, {} as { [key: string]: { name: string, value: number } });

    const processedPieData = Object.values(categoryData).map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
    }));

    // d. Untuk Pesanan Terbaru (Tabel)
    const processedRecentOrders = penjualanData.slice(0, 5);


    // --- 3. TAMPILAN LOADING ---
    if (isLoading) {
        return (
            <MainLayoutPenjual>
                <DashboardSkeleton />
            </MainLayoutPenjual>
        );
    }

    // --- 4. RENDER HALAMAN ---
    return (
        <MainLayoutPenjual>
            <div className="space-y-8 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Penjual</h1>
                        <p className="text-gray-600 mt-1 text-lg">
                            Selamat datang, <span className="font-semibold text-blue-600">{username}</span>!
                        </p>
                    </div>
                    {/* Select Range Waktu (Diaktifkan) */}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl bg-white shadow-sm font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            <option value="7hari">7 Hari Terakhir</option>
                            <option value="30hari">30 Hari Terakhir</option>
                            <option value="all">Semua Waktu</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg border-l-4 border-blue-600 p-6 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`${stat.color} p-3 rounded-xl shadow-md`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Grafik Pendapatan ({timeRange})</h2>
                            <div className="flex text-xs text-gray-500 space-x-3">
                                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> Pendapatan</span>
                                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div> Pesanan</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={processedRevenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="label" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(value)} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    formatter={(value: number, name) => {
                                        if (name === 'pendapatan') return [formatCurrency(value), 'Pendapatan'];
                                        return [value, 'Pesanan'];
                                    }}
                                />
                                <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                                <Line type="monotone" dataKey="pesanan" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Pendapatan per Kategori</h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={processedPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    labelLine={false}
                                >
                                    {processedPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                            {processedPieData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Pencatatan Terbaru</h2>
                        <Link href="/penjual/pencatatan" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                            Lihat Semua <ChevronRight className='w-4 h-4 ml-1' />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pelanggan</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produk</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedRecentOrders.length > 0 ? (
                                    processedRecentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                                {new Date(order.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-700">{order.nama_pembeli}</td>
                                            <td className="py-4 px-4 text-sm text-gray-700">{order.nama_produk}</td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Selesai
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-semibold text-gray-900 text-right">
                                                {formatCurrency(order.total_harga)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500">
                                            Tidak ada pencatatan penjualan yang ditemukan dalam rentang waktu ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <Link href='/penjual/products/tambah' className="flex flex-col items-center">
                            <Package className="w-8 h-8 mb-2" />
                            <h3 className="font-semibold text-lg">Tambah Produk</h3>
                            <p className="text-sm text-blue-100 mt-1">Upload produk baru</p>
                        </Link>
                    </div>
                    <div className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <Link href='/penjual/products' className="flex flex-col items-center">
                            <Eye className="w-8 h-8 mb-2" />
                            <h3 className="font-semibold text-lg">Kelola Produk</h3>
                            <p className="text-sm text-green-100 mt-1">Proses Produk</p>
                        </Link>
                    </div>
                    <div className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <Link href='/' className="flex flex-col items-center">
                            <Eye className="w-8 h-8 mb-2" />
                            <h3 className="font-semibold text-lg">Lihat Toko</h3>
                            <p className="text-sm text-purple-100 mt-1">Preview toko Anda</p>
                        </Link>
                    </div>
                    <div className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <Link href='/penjual/pencatatan' className="flex flex-col items-center">
                            <TrendingUp className="w-8 h-8 mb-2" />
                            <h3 className="font-semibold text-lg">Laporan</h3>
                            <p className="text-sm text-orange-100 mt-1">Analisis penjualan</p>
                        </Link>
                    </div>
                </div>
            </div>

        </MainLayoutPenjual >
    );
}