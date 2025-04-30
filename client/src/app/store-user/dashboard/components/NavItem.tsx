import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
}

export default function NavItem({ href, icon, label, isCollapsed }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    return (
        <Link href={href} className="block">
            <div
                className={`flex items-center ${isCollapsed ? 'justify-center' : ''} py-3 px-3 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
                <div className="flex items-center">
                    <span className="w-5 h-5">{icon}</span>
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">{label}</span>}
                </div>
            </div>
        </Link>
    );
}