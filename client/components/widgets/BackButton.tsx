'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
    children?: React.ReactNode;
    fallbackPath?: string;
    className?: string;
}

const BackButton = ({ children, fallbackPath = '/', className = '' }: BackButtonProps) => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
            type="button"
            aria-label="Go back"
        >
            <ArrowLeft size={20} />
            {children}
        </button>
    );
};

export default BackButton;