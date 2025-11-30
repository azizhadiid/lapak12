'use client'

import { useEffect, useState } from 'react'
import { Search, MoreVertical, Filter, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import MainLayoutPenjual from '../MainLayoutPenjual'

interface User {
    id: number
    username: string
    nama: string
    email: string
    status: 'active' | 'inactive'
}

// Data dummy untuk contoh
const dummyUsers: User[] = [
    { id: 1, username: 'johndoe', nama: 'John Doe', email: 'john.doe@email.com', status: 'active' },
    { id: 2, username: 'janesmth', nama: 'Jane Smith', email: 'jane.smith@email.com', status: 'active' },
    { id: 3, username: 'bobwilson', nama: 'Bob Wilson', email: 'bob.wilson@email.com', status: 'inactive' },
    { id: 4, username: 'alicejohn', nama: 'Alice Johnson', email: 'alice.j@email.com', status: 'active' },
    { id: 5, username: 'charliebr', nama: 'Charlie Brown', email: 'charlie.b@email.com', status: 'inactive' },
    { id: 6, username: 'dianaross', nama: 'Diana Ross', email: 'diana.ross@email.com', status: 'active' },
    { id: 7, username: 'evandavis', nama: 'Evan Davis', email: 'evan.davis@email.com', status: 'active' },
    { id: 8, username: 'fionalee', nama: 'Fiona Lee', email: 'fiona.lee@email.com', status: 'inactive' },
]

export default function AkunPembeliPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // Simulasi loading data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            // Simulasi delay loading dari API
            await new Promise(resolve => setTimeout(resolve, 1500))
            setUsers(dummyUsers)
            setIsLoading(false)
        }

        loadData()
    }, [])

    // Filter users berdasarkan pencarian dan status
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || user.status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentUsers = filteredUsers.slice(startIndex, endIndex)

    // Reset ke halaman 1 saat filter berubah
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter])

    const activeCount = users.filter(u => u.status === 'active').length
    const inactiveCount = users.filter(u => u.status === 'inactive').length

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="animate-pulse">
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                ))}
            </div>

            {/* Filter skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded mb-3"></div>
                ))}
            </div>
        </div>
    )

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                    </div>
                    <LoadingSkeleton />
                </div>
            </div>
        )
    }

    return (
        <MainLayoutPenjual>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Akun Pembeli
                    </h1>
                    <p className="text-gray-600">Kelola dan pantau akun pembeli Anda</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Pembeli</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <UserCheck className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Aktif</p>
                                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tidak Aktif</p>
                                <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <UserX className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Cari username, nama, atau email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table - Desktop View */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Username</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-900">{user.username}</td>
                                            <td className="py-3 px-4 text-gray-900">{user.nama}</td>
                                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    // variant={user.status === 'active' ? 'default' : 'secondary'} // <-- Dihapus
                                                    className={user.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}
                                                >
                                                    {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            Tidak ada data pembeli yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {filteredUsers.length > itemsPerPage && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                        <div className="text-sm text-gray-600">
                            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} dari {filteredUsers.length} data
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Sebelumnya
                            </Button>

                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 ${currentPage === page ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="disabled:opacity-50"
                            >
                                Selanjutnya
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Card View - Mobile */}
                <div className="md:hidden space-y-4">
                    {currentUsers.length > 0 ? (
                        currentUsers.map((user) => (
                            <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{user.nama}</h3>
                                        <p className="text-sm text-gray-600">@{user.username}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">
                                                {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <Badge
                                        variant={user.status === 'active' ? 'default' : 'secondary'}
                                        className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                    >
                                        {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <p className="text-gray-500">Tidak ada data pembeli yang ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayoutPenjual>
    )
}