import ForgotPageComponent from "@/components/auth/pages/ForgotPasswordPageComponent";
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Lupa Password', // Ini akan mengisi placeholder %s
};

export default function ForgotPage() {
    return (
        <ForgotPageComponent />
    );
}