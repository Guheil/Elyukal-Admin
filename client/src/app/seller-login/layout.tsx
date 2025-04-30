'use client';

import StoreUserAuthProvider from '@/context/StoreUserAuthContext';

export default function SellerLoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <StoreUserAuthProvider>
            {children}
        </StoreUserAuthProvider>
    );
}