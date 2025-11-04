"use client"

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, ShoppingCart, DollarSign, Eye, Users, AlertCircle, CheckCircle } from 'lucide-react';
import MainLayoutPenjual from "../MainLayoutPenjual";

// Data dummy untuk grafik
const revenueData = [
    { bulan: 'Jan', pendapatan: 4500000, pesanan: 45 },
    { bulan: 'Feb', pendapatan: 5200000, pesanan: 52 },
    { bulan: 'Mar', pendapatan: 4800000, pesanan: 48 },
    { bulan: 'Apr', pendapatan: 6100000, pesanan: 61 },
    { bulan: 'Mei', pendapatan: 7200000, pesanan: 72 },
    { bulan: 'Jun', pendapatan: 8500000, pesanan: 85 },
];

const productData = [
    { name: 'Terjual', value: 245, color: '#10b981' },
    { name: 'Pending', value: 18, color: '#f59e0b' },
    { name: 'Stok', value: 87, color: '#3b82f6' },
];

const recentOrders = [
    { id: '#ORD-2024-001', customer: 'Budi Santoso', product: 'Laptop Gaming', status: 'Diproses', total: 'Rp 12.500.000' },
    { id: '#ORD-2024-002', customer: 'Siti Nurhaliza', product: 'Mouse Wireless', status: 'Dikirim', total: 'Rp 250.000' },
    { id: '#ORD-2024-003', customer: 'Ahmad Rizki', product: 'Keyboard Mechanical', status: 'Selesai', total: 'Rp 850.000' },
    { id: '#ORD-2024-004', customer: 'Dewi Lestari', product: 'Webcam HD', status: 'Diproses', total: 'Rp 450.000' },
];

export default function DashboardPageComponent() {
    const [timeRange, setTimeRange] = useState('6bulan');

    const stats = [
        {
            title: 'Total Pendapatan',
            value: 'Rp 36.300.000',
            change: '+12.5%',
            icon: DollarSign,
            color: 'bg-green-500',
            trend: 'up'
        },
        {
            title: 'Total Pesanan',
            value: '363',
            change: '+8.2%',
            icon: ShoppingCart,
            color: 'bg-blue-500',
            trend: 'up'
        },
        {
            title: 'Produk Terjual',
            value: '245',
            change: '+15.3%',
            icon: Package,
            color: 'bg-purple-500',
            trend: 'up'
        },
        {
            title: 'Pengunjung Toko',
            value: '2.847',
            change: '+5.7%',
            icon: Users,
            color: 'bg-orange-500',
            trend: 'up'
        },
    ];

    return (
        <MainLayoutPenjual>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Selamat datang kembali! Berikut ringkasan toko Anda.</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="7hari">7 Hari Terakhir</option>
                            <option value="30hari">30 Hari Terakhir</option>
                            <option value="6bulan">6 Bulan Terakhir</option>
                            <option value="1tahun">1 Tahun Terakhir</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-sm font-medium text-green-500">{stat.change}</span>
                                        <span className="text-xs text-gray-500 ml-1">vs bulan lalu</span>
                                    </div>
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
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Grafik Pendapatan</h2>
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600">Pendapatan</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-gray-600">Pesanan</span>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="bulan" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    formatter={(value, name) => {
                                        if (name === 'pendapatan') return [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan'];
                                        return [value, 'Pesanan'];
                                    }}
                                />
                                <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                                <Line type="monotone" dataKey="pesanan" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Product Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Distribusi Produk</h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={productData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {productData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {productData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Pesanan Terbaru</h2>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Lihat Semua →
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID Pesanan</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pelanggan</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produk</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                                        <td className="py-4 px-4 text-sm text-gray-700">{order.customer}</td>
                                        <td className="py-4 px-4 text-sm text-gray-700">{order.product}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Dikirim' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status === 'Selesai' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {order.status === 'Diproses' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">{order.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <Package className="w-8 h-8 mb-2" />
                        <h3 className="font-semibold text-lg">Tambah Produk</h3>
                        <p className="text-sm text-blue-100 mt-1">Upload produk baru</p>
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <ShoppingCart className="w-8 h-8 mb-2" />
                        <h3 className="font-semibold text-lg">Kelola Pesanan</h3>
                        <p className="text-sm text-green-100 mt-1">Proses pesanan masuk</p>
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <Eye className="w-8 h-8 mb-2" />
                        <h3 className="font-semibold text-lg">Lihat Toko</h3>
                        <p className="text-sm text-purple-100 mt-1">Preview toko Anda</p>
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
                        <TrendingUp className="w-8 h-8 mb-2" />
                        <h3 className="font-semibold text-lg">Laporan</h3>
                        <p className="text-sm text-orange-100 mt-1">Analisis penjualan</p>
                    </button>
                </div>
            </div>

        </MainLayoutPenjual>
    );
}