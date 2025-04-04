import React from 'react';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    isCollapsed: boolean;
}

export default function NavItem({ icon, label, isActive, isCollapsed }: NavItemProps) {
    return (
        <div
            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} py-3 px-3 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
        >
            <div className="flex items-center">
                <span className="w-5 h-5">{icon}</span>
                {!isCollapsed && <span className="ml-3 text-sm font-medium">{label}</span>}
            </div>
        </div>
    );
}