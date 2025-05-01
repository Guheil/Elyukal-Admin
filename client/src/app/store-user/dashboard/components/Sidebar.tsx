import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, LayoutDashboard, Package, Users, MapPin, BarChart3, Settings, LogOut, ChevronDown, Store, User, LucideSquareActivity, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import Image from 'next/image';
import logoImage from '../../../assets/img/logo.png';
import NavItem from './NavItem';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    user: any;
}

export default function Sidebar({ isCollapsed, onToggle, user }: SidebarProps) {
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const showLogoutConfirmation = () => {
        setIsLogoutModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            // Use the correct API endpoint and method
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            console.log('Attempting logout with API URL:', apiUrl);

            const response = await fetch(`${apiUrl}/store-user/logout`, {
                method: 'GET', // Match backend endpoint method
                credentials: 'include', // Include cookies for session
            });

            console.log('Logout response status:', response.status);

            // Clear local storage (optional, since backend uses cookies)
            localStorage.removeItem('access_token');

            if (response.ok) {
                console.log('Logged out successfully');
                router.push('/seller-login');
            } else {
                let errorMessage = 'Logout failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || 'Unknown error';
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                }

                // Handle session-related errors gracefully
                if (errorMessage.includes('Invalid session') || errorMessage.includes('Session expired')) {
                    console.warn('Session already invalid or expired, proceeding with logout');
                } else {
                    console.error('Logout failed:', errorMessage);
                }
                router.push('/seller-login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Clear local storage and redirect on error
            localStorage.removeItem('access_token');
            router.push('/seller-login');
        }
    };

    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
    };

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen flex-shrink-0 fixed left-0 top-0 transition-all duration-300 z-10`}
            style={{ background: `linear-gradient(180deg, ${COLORS.gradient.start}, ${COLORS.gradient.middle}, ${COLORS.gradient.end})` }}
        >
            <div className="flex flex-col h-full">
                <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'} h-20`}>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center shadow-lg">
                            <Image
                                src={logoImage} 
                                alt="Shopping Bag"
                                width={40} 
                                height={40} 
                                className="rounded-full object-cover" 
                            />
                        </div>
                        {!isCollapsed && (
                            <h1 className="text-lg font-bold tracking-wider text-white" style={{ fontFamily: FONTS.bold }}>
                                PRODUKTO <span style={{ color: COLORS.gold }}>ELYU-KAL</span>
                            </h1>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 px-3">
                    <div className="space-y-1">
                        <NavItem 
                            href="/store-user/dashboard" 
                            icon={<LayoutDashboard size={20} />} 
                            label="Dashboard" 
                            isCollapsed={isCollapsed} 
                        />
                        
                        <NavItem 
                            href="/store-user/store" 
                            icon={<ShoppingCart size={20} />} 
                            label="Store" 
                            isCollapsed={isCollapsed} 
                        />
                        <NavItem
                            href="/store-user/products"
                            icon={<Package size={20} />}
                            label="Products"
                            isCollapsed={isCollapsed}
                        />
                        <NavItem 
                            href="/store-user/analytics" 
                            icon={<BarChart3 size={20} />} 
                            label="Analytics" 
                            isCollapsed={isCollapsed} 
                        />
                        <NavItem 
                            href="/store-user/profile" 
                            icon={<User size={20} />} 
                            label="Profile" 
                            isCollapsed={isCollapsed} 
                        />
                        
                    </div>
                </div>
                
                <div className="p-4">
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10" 
                        onClick={showLogoutConfirmation}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {!isCollapsed && <span>Logout</span>}
                    </Button>
                </div>
                
                {!isCollapsed && (
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center space-x-3">
                            <Avatar>
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary text-white">
                                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-white/70">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={cancelLogout}
                onConfirm={handleLogout}
                title="Confirm Logout"
                description="Are you sure you want to log out?"
                confirmLabel="Logout"
                cancelLabel="Cancel"
            />
        </div>
    );
}