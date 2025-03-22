import React from 'react';
import { Search, Bell, Calendar, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COLORS } from '../../constants/colors';

interface HeaderProps {
    user: any;
    notificationsCount: number;
}

export default function Header({ user, notificationsCount }: HeaderProps) {
    return (
        <header className="h-20 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10" style={{ backgroundColor: COLORS.white }}>
            <div className="flex items-center gap-4 flex-1">
                <div className="md:w-72 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search products, customers..."
                        className="pl-10 pr-4 py-2 rounded-full text-sm border-2"
                        style={{ borderColor: COLORS.lightgray, backgroundColor: COLORS.lightgray }}
                    />
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.gray }}>
                        <Calendar size={16} />
                        <span>Saturday, March 8, 2025</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="relative rounded-full" style={{ backgroundColor: COLORS.lightgray }}>
                    <Bell size={18} style={{ color: COLORS.gray }} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: COLORS.error, color: COLORS.white }}>
                        {notificationsCount}
                    </span>
                </Button>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarFallback style={{ backgroundColor: COLORS.gold, color: COLORS.accent }}>
                            {user && 'first_name' in user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 
                             user && 'email' in user ? user.email.charAt(0).toUpperCase() : 'DA'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block max-w-[150px]">
                        <p className="text-sm font-medium truncate" style={{ color: COLORS.accent }}>
                            {user && 'first_name' in user && 'last_name' in user ? 
                                `${user.first_name} ${user.last_name}` : 
                                user && 'email' in user ? user.email : "No Name Available"}
                        </p>
                        <p className="text-xs" style={{ color: COLORS.gray }}>Administrator</p>
                    </div>
                    <ChevronDown size={16} style={{ color: COLORS.gray }} className="hidden md:block" />
                </div>
            </div>
        </header>
    );
}