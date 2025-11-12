"use client"

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, Eye, CheckCircle, DollarSign, ShoppingCart, Loader2 } from 'lucide-react';
import MainLayoutPenjual from "../MainLayoutPenjual";
import Link from 'next/link';
import { FaProductHunt } from 'react-icons/fa';
import { Penjualan } from '@/lib/types/pencatatan';
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

export default function DashboardPageComponent() {
    const [timeRange, setTimeRange] = useState('6bulan'); // (Filter ini belum fungsional, tapi kita biarkan)
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('Penjual');
    const [penjualanData, setPenjualanData] = useState<Penjualan[]>([]);

    const supabase = createClientComponentClient();
    const router = useRouter();

    // --- 1. FETCH DATA SAAT HALAMAN DIBUKA ---
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

                // 3. Dapatkan semua data penjualan milik user ini
                // Kita urutkan berdasarkan tanggal (terbaru dulu)
                const { data: salesData, error: salesError } = await supabase
                    .from('penjualan')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('tanggal', { ascending: false });

                if (salesError) throw salesError;

                setPenjualanData(salesData || []);

            } catch (error: any) {
                console.error("Error fetching dashboard data:", error);
                toast.error(`Gagal memuat data: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [supabase, router]);

    // --- 2. KALKULASI DATA DINAMIS ---
    // (Data ini akan dihitung ulang setiap kali penjualanData berubah)

    // a. Untuk Stats Cards
    const totalPendapatan = penjualanData.reduce((acc, sale) => acc + sale.total_harga, 0);
    const totalPesanan = penjualanData.length;
    const totalProdukTerjual = penjualanData.reduce((acc, sale) => acc + sale.jumlah, 0);
    // Kita ganti 'Pengunjung' dengan 'Rata-rata Penjualan'
    const rataRataPenjualan = totalPesanan > 0 ? (totalPendapatan / totalPesanan) : 0;

    const stats = [
        {
            title: 'Total Pendapatan',
            value: formatCurrency(totalPendapatan),
            change: '+12.5%', // (Perubahan % masih dummy, butuh data bulan lalu)
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            title: 'Total Pesanan',
            value: totalPesanan.toString(),
            change: '+8.2%', // (dummy)
            icon: ShoppingCart,
            color: 'bg-blue-500',
        },
        {
            title: 'Produk Terjual',
            value: totalProdukTerjual.toString(),
            change: '+15.3%', // (dummy)
            icon: Package,
            color: 'bg-purple-500',
        },
        {
            title: 'Rata-rata Penjualan',
            value: formatCurrency(rataRataPenjualan),
            change: '+5.7%', // (dummy)
            icon: TrendingUp, // Ikon diganti
            color: 'bg-orange-500',
        },
    ];

    // b. Untuk Grafik Pendapatan (Line Chart)
    const monthlyData = [...penjualanData]
        .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()) // Urutkan dari terlama
        .reduce((acc, sale) => {
            const month = new Date(sale.tanggal).toLocaleString('id-ID', { month: 'short', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = { bulan: month, pendapatan: 0, pesanan: 0 };
            }
            acc[month].pendapatan += sale.total_harga;
            acc[month].pesanan += 1; // 1 pesanan (bukan sale.jumlah)
            return acc;
        }, {} as { [key: string]: { bulan: string, pendapatan: number, pesanan: number } });

    const processedRevenueData = Object.values(monthlyData);

    // c. Untuk Grafik Kategori (Pie Chart)
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
    const categoryData = penjualanData.reduce((acc, sale) => {
        const kategori = sale.kategori;
        if (!acc[kategori]) {
            acc[kategori] = { name: kategori, value: 0 };
        }
        acc[kategori].value += sale.total_harga; // Kita ukur berdasarkan pendapatan
        return acc;
    }, {} as { [key: string]: { name: string, value: number } });

    const processedPieData = Object.values(categoryData).map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
    }));

    // d. Untuk Pesanan Terbaru (Tabel)
    // (Data sudah di-fetch urut terbaru, jadi tinggal ambil 5 teratas)
    const processedRecentOrders = penjualanData.slice(0, 5);


    // --- 3. TAMPILAN LOADING ---
    if (isLoading) {
        return (
            <MainLayoutPenjual>
                <div className="flex justify-center items-center h-[70vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="ml-3 text-lg text-gray-600">Memuat data dashboard...</p>
                </div>
            </MainLayoutPenjual>
        );
    }

    // --- 4. RENDER HALAMAN ---
    return (
        <MainLayoutPenjual>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            {/* Ganti nama dummy dengan nama user */}
                            Selamat datang kembali, <span className="font-semibold">{username}</span>!
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="7hari">7 Hari Terakhir</option>
                            <option value="30hari">30 Hari Terakhir</option>
                            <option value="all">Semua Waktu</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards (Sekarang dinamis) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    {/* <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-sm font-medium text-green-500">{stat.change}</span>
                                        <span className="text-xs text-gray-500 ml-1">vs bulan lalu</span>
                                    </div> */}
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart (Sekarang dinamis) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Grafik Pendapatan</h2>
                            {/* ... (legenda tetap sama) ... */}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={processedRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="bulan" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" tickFormatter={(value) => `Rp ${value / 1000000} Jt`} />
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

                    {/* Product Distribution (Diubah ke Kategori) */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
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
                                >
                                    {processedPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {processedPieData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders (Sekarang dinamis) */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Pencatatan Terbaru</h2>
                        <Link href="/penjual/pencatatan" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Lihat Semua →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pelanggan</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produk</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedRecentOrders.length > 0 ? (
                                    processedRecentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                                {new Date(order.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-700">{order.nama_pembeli}</td>
                                            <td className="py-4 px-4 text-sm text-gray-700">{order.nama_produk}</td>
                                            <td className="py-4 px-4">
                                                {/* Karena ini 'pencatatan', kita anggap 'Selesai' */}
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Selesai
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                                                {formatCurrency(order.total_harga)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500">
                                            Belum ada data penjualan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <Link href='/penjual/products/tambah' className="flex flex-col items-center">
                            <Package className="w-8 h-8 mb-2" />
                            <h3 className="font-semibold text-lg">Tambah Produk</h3>
                            <p className="text-sm text-blue-100 mt-1">Upload produk baru</p>
                        </Link>
                    </div>
                    <div className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <Link href='/penjual/products' className="flex flex-col items-center">
                            <FaProductHunt className="w-8 h-8 mb-2" />
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