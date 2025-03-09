import React from 'react';
import Link from 'next/link';
import { ShoppingBag, LayoutDashboard, Package, Users, MapPin, BarChart3, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { NavItem } from './NavItem';
import { useRouter } from 'next/navigation'; // Changed from next/router to next/navigation

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    user: any;
}

export default function Sidebar({ isCollapsed, onToggle, user }: SidebarProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Make API call to logout endpoint
            const response = await fetch('http://localhost:8000/auth/logout', {
                method: 'POST',
                credentials: 'include', // Include cookies for session
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Clear any client-side auth state if needed
                localStorage.removeItem('authToken'); // If you're storing tokens

                console.log('Logged out successfully');
                // Redirect to login page
                router.push('/login');
            } else {
                const errorData = await response.json();
                console.error('Logout failed:', errorData.detail || 'Unknown error');
                alert(errorData.detail || 'Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout');
        }
    };

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen flex-shrink-0 fixed left-0 top-0 transition-all duration-300 z-10`}
            style={{ background: `linear-gradient(180deg, ${COLORS.gradient.start}, ${COLORS.gradient.middle}, ${COLORS.gradient.end})` }}
        >
            <div className="flex flex-col h-full">
                <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'} h-20`}>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <ShoppingBag className="h-6 w-6" style={{ color: COLORS.primary }} />
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
                        <NavItem icon={<LayoutDashboard />} label="Dashboard" isActive={true} isCollapsed={isCollapsed} />
                        <NavItem icon={<Package />} label="Products" isActive={false} isCollapsed={isCollapsed} />
                        {/* Other nav items */}
                    </nav>
                </div>
                <div className={`px-4 py-4 border-t ${isCollapsed ? 'justify-center' : ''}`} style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="w-10 h-10 border-2 border-white">
                                <AvatarFallback style={{ backgroundColor: COLORS.gold, color: COLORS.accent }}>
                                    {user && 'email' in user ? user.email.charAt(0).toUpperCase() : 'DA'}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white opacity-75 hover:opacity-100"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white">
                                <AvatarFallback style={{ backgroundColor: COLORS.gold, color: COLORS.accent }}>
                                    {user && 'email' in user ? user.email.charAt(0).toUpperCase() : 'DA'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                    {user && 'email' in user ? user.email : "No Email Available"}
                                </p>
                                <p className="text-xs opacity-75 text-white">Administrator</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white opacity-75 hover:opacity-100"
                                onClick={handleLogout}
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
        </div>
    );
}