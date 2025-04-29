import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, LayoutDashboard, Package, Users, MapPin, BarChart3, Settings, LogOut, ChevronDown, Store, User, LucideSquareActivity, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import Image from 'next/image';
import logoImage from '../../assets/img/logo.png';
import NavItem from './NavItem';
import { useRouter } from 'next/navigation'; // Changed from next/router to next/navigation
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
            // Make API call to logout endpoint using the environment variable
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            console.log('Attempting logout with API URL:', apiUrl);
            
            const response = await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include', // Include cookies for session
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Logout response status:', response.status);
            
            // Always clear local storage regardless of response
            localStorage.removeItem('access_token');
            
            if (response.ok) {
                console.log('Logged out successfully');
                // Redirect to login page
                router.push('/login');
            } else {
                // Try to parse error response
                let errorMessage = 'Logout failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || 'Unknown error';
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                }
                
                console.error('Logout failed:', errorMessage);
                // Still redirect to login page even if server-side logout fails
                router.push('/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local storage and redirect on error
            localStorage.removeItem('access_token');
            router.push('/login');
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
                        <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center  shadow-lg">
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
                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <nav className="space-y-1">
                        <Link href="/dashboard">
                            <NavItem icon={<LayoutDashboard />} label="Dashboard" isActive={false} isCollapsed={isCollapsed} />
                        </Link>
                        <Link href="/products">
                            <NavItem icon={<Package />} label="Products" isActive={false} isCollapsed={isCollapsed} />
                        </Link>
                        <Link href="/stores">
                            <NavItem icon={<Store />} label="Stores" isActive={false} isCollapsed={isCollapsed} />
                        </Link>
                        <Link href="/users">
                            <NavItem icon={<User />} label="Users" isActive={false} isCollapsed={isCollapsed} />
                        </Link>
                        <Link href="/activity">
                            <NavItem icon={<LucideSquareActivity />} label="Admin Activities" isActive={false} isCollapsed={isCollapsed} />
                        </Link>
                        <Link href="/seller-applications">
                            <NavItem icon={<UserPlus />} label="Seller Applications" isActive={false} isCollapsed={isCollapsed} />
                        </Link>
                        {/* Other nav items */}
                    </nav>
                </div>
                <div className={`px-4 py-4 border-t ${isCollapsed ? 'justify-center' : ''}`} style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="w-10 h-10 border-2 border-white">
                                <AvatarFallback style={{ backgroundColor: COLORS.gold, color: COLORS.accent }}>
                                    {user && 'first_name' in user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 
                                     user && 'email' in user ? user.email.charAt(0).toUpperCase() : 'DA'}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white opacity-75 hover:opacity-100"
                                onClick={showLogoutConfirmation}
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white">
                                <AvatarFallback style={{ backgroundColor: COLORS.gold, color: COLORS.accent }}>
                                    {user && 'first_name' in user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 
                                     user && 'email' in user ? user.email.charAt(0).toUpperCase() : 'DA'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 mr-2">
                                <p className="text-sm font-medium text-white truncate">
                                    {user && 'first_name' in user && 'last_name' in user ? 
                                        `${user.first_name} ${user.last_name}` : 
                                        user && 'email' in user ? user.email : "No Name Available"}
                                </p>
                                <p className="text-xs opacity-75 text-white">Administrator</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white opacity-75 hover:opacity-100"
                                onClick={showLogoutConfirmation}
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
                <button
                    className="absolute top-1/2 -right-3 w-6 h-12 bg-white rounded-md shadow-md flex items-center justify-center"
                    onClick={onToggle}
                    style={{ color: COLORS.primary }}
                >
                    <ChevronDown className={`h-4 w-4 transform transition-transform ${isCollapsed ? 'rotate-90' : '-rotate-90'}`} />
                </button>
            </div>
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={cancelLogout}
                onConfirm={handleLogout}
                title="Confirm Logout"
                description="Are you sure you want to logout? You will need to login again to access the dashboard."
                confirmLabel="Logout"
                cancelLabel="Cancel"
            />
        </div>
    );
}
