import LoginPageComponent from "@/components/auth/register/LoginPageComponent";
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Masuk Akun', // Ini akan mengisi placeholder %s
};

export default function LoginPage() {
    return (
        <LoginPageComponent />
    );
}