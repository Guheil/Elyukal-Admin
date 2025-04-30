'use client';

import StoreUserAuthProvider from '@/context/StoreUserAuthContext';

export default function StoreUserLayout({ children }: { children: React.ReactNode }) {
    return (
        <StoreUserAuthProvider>
            {children}
        </StoreUserAuthProvider>
    );
}