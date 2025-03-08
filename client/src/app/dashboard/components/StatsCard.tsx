import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

interface StatsCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

export const StatsCard = ({ title, value, description, icon, color }: StatsCardProps) => {
    return (
        <Card className="overflow-hidden">
            <div className="h-1" style={{ backgroundColor: color }} />
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-sm font-medium" style={{ color: COLORS.gray }}>
                            {title}
                        </p>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: COLORS.accent, fontFamily: FONTS.bold }}
                        >
                            {value}
                        </p>
                        <p className="text-xs" style={{ color: COLORS.gray }}>
                            {description}
                        </p>
                    </div>
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                            backgroundColor: `${color}15`, // 15% opacity for background
                            color: color,
                        }}
                    >
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};