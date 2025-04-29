'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronDown, BarChart2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { COLORS } from '../../constants/colors';

interface HeaderProps {
    user: any;
    notificationsCount: number;
}

export default function Header({ user, notificationsCount }: HeaderProps) {
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        // Function to format the current date
        const updateDate = () => {
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
            setCurrentDate(formattedDate);
        };

        // Update date immediately
        updateDate();

        // Set interval to update date every minute (60000ms)
        const intervalId = setInterval(updateDate, 60000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <header className="h-20 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10" style={{ backgroundColor: COLORS.white }}>
            <div className="flex items-center gap-4 flex-1">
                <div className="md:w-72 relative">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                        style={{ backgroundColor: COLORS.lightgray, color: COLORS.gray }}>
                        <BarChart2 size={18} />
                        <span className="font-medium">Dashboard Overview</span>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.gray }}>
                        <Calendar size={16} />
                        <span>{currentDate || 'Loading date...'}</span>
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