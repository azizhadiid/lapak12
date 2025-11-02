import ResetPasswordPageComponent from "@/components/auth/register/ResetPasswordPageComponent";
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
    title: 'Reset Password', // Ini akan mengisi placeholder %s
};

export default function ResetPasswordPage() {
    return (
        <ResetPasswordPageComponent />
    );
}