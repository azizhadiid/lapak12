import ForgotPageComponent from "@/components/auth/register/ForgotPasswordPageComponent";
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Lupa Password', // Ini akan mengisi placeholder %s
};

export default function LoginPage() {
    return (
        <ForgotPageComponent />
    );
}