"use client"

import React, { useState } from 'react';
import { Minus, Plus, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayoutPembeli from '../MainLayoutPembeli';
import { FaCcMastercard, FaCcVisa, FaPaypal } from 'react-icons/fa';

interface CartItem {
    id: number;
    name: string;
    color: string;
    size: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    total: number;
    image: string;
}

export default function KeranjangPagePembeli() {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: 1,
            name: 'Lorem ipsum dolor sit amet',
            color: 'Black',
            size: 'M',
            price: 89.99,
            quantity: 1,
            total: 89.99,
            image: '🪑'
        },
        {
            id: 2,
            name: 'Consectetur adipiscing elit',
            color: 'White',
            size: 'L',
            price: 64.99,
            originalPrice: 79.99,
            quantity: 2,
            total: 129.98,
            image: '👔'
        },
        {
            id: 3,
            name: 'Sed do eiusmod tempor',
            color: 'Blue',
            size: 'S',
            price: 49.99,
            quantity: 1,
            total: 49.99,
            image: '👕'
        }
    ]);

    const [shippingMethod, setShippingMethod] = useState('standard');
    const formatRupiah = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);


    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const tax = 27.00;
    const discount = 0;
    const shippingCost = shippingMethod === 'standard' ? 4.99 : shippingMethod === 'express' ? 12.99 : 0;
    const total = subtotal + tax + shippingCost - discount;

    const updateQuantity = (id: number, change: number) => {
        setCartItems(items =>
            items.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantity: Math.max(1, item.quantity + change),
                        total: item.price * Math.max(1, item.quantity + change)
                    }
                    : item
            )
        );
    };

    const removeItem = (id: number) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    return (
        <MainLayoutPembeli>
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Data Keranjang</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Header */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b-2 border-blue-600 font-semibold text-gray-700">
                            <div className="col-span-5">PRODUK</div>
                            <div className="col-span-2 text-center">HARGA</div>
                            <div className="col-span-3 text-center">JUMLAH</div>
                            <div className="col-span-2 text-center">TOTAL</div>
                        </div>

                        {/* Cart Items */}
                        {cartItems.map(item => (
                            <Card key={item.id} className="shadow-sm relative">

                                {/* Tombol Silang (X) di pojok kanan atas */}
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <CardContent className="p-4 md:p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                        {/* Product Info */}
                                        <div className="md:col-span-5 flex gap-4 items-center">
                                            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-4xl flex-shrink-0">
                                                {item.image}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 mb-1 truncate">{item.name}</h3>
                                                <p className="text-sm text-gray-600">Warna: {item.color}</p>
                                                <p className="text-sm text-gray-600">Ukuran: {item.size}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                                            <span className="md:hidden font-medium text-gray-700">Harga:</span>

                                            <div className="flex flex-col items-start md:items-center">
                                                <span className="font-semibold text-gray-900">
                                                    {formatRupiah(item.price)}
                                                </span>
                                                {item.originalPrice && (
                                                    <span className="text-sm text-gray-400 line-through">
                                                        {formatRupiah(item.originalPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="md:col-span-3 flex md:justify-center items-center gap-2">
                                            <span className="md:hidden font-medium text-gray-700">Jumlah:</span>

                                            <div className="flex items-center gap-2 border rounded-lg">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="h-10 w-10 p-0 hover:bg-gray-100"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>

                                                <span className="w-12 text-center font-medium">{item.quantity}</span>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="h-10 w-10 p-0 hover:bg-gray-100"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                                            <span className="md:hidden font-medium text-gray-700">Total:</span>

                                            <span className="font-bold text-lg text-gray-900">
                                                {formatRupiah(item.total)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Lanjutkan Berbelanja
                            </Button>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                                    Bersihkan
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Pemesanan Section */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-md sticky top-8">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-6 pb-3 border-b-2 border-blue-600">
                                    Ringkasan Pemesanan
                                </h2>

                                {/* Subtotal */}
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-700">Subtotal</span>
                                    <span className="font-semibold">{formatRupiah(Number(subtotal.toFixed(2)))}
                                    </span>
                                </div>


                                {/* Pajak */}
                                <div className="flex justify-between mb-4 pt-4 border-t">
                                    <span className="text-gray-700">Pajak</span>
                                    <span className="font-semibold">{formatRupiah(Number(tax.toFixed(2)))}
                                    </span>
                                </div>

                                {/* Diskon */}
                                <div className="flex justify-between mb-6">
                                    <span className="text-gray-700">Diskon</span>
                                    <span className="font-semibold text-red-600">{formatRupiah(Number(discount.toFixed(2)))}
                                    </span>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between mb-6 pt-4 border-t-2 border-gray-300">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-bold text-blue-600">{formatRupiah(Number(total.toFixed(2)))}
                                    </span>
                                </div>

                                {/* Checkout Button */}
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium mb-4">
                                    Proses Pembayaran →
                                </Button>

                                {/* Lanjutkan Berbelanja Link */}
                                <button className="w-full text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Lanjutkan Berbelanja
                                </button>

                                {/* Payment Methods */}
                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-sm text-gray-600 text-center mb-3">Kami Menyediakan</p>

                                    <div className="flex justify-center gap-3 flex-wrap">

                                        <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                                            <FaCcVisa className="w-7 h-7 text-blue-700" />
                                        </div>

                                        <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                                            <FaCcMastercard className="w-7 h-7 text-red-600" />
                                        </div>

                                        <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                                            <FaPaypal className="w-7 h-7 text-blue-600" />
                                        </div>

                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayoutPembeli>
    );
}