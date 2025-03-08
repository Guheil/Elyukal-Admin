import React from 'react';
import { TrendingUp } from 'lucide-react';
import { COLORS } from '../../constants/colors';

interface PerformanceMetricProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    change: number;
    color: string;
}

export const PerformanceMetric = ({ icon, label, value, change, color }: PerformanceMetricProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }} 
                >
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium" style={{ color: COLORS.accent }}>
                        {label}
                    </p>
                    <p className="text-xs" style={{ color: COLORS.gray }}>
                        This month
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-bold" style={{ color: COLORS.accent }}>
                    {value}
                </p>
                <div
                    className="text-xs flex items-center gap-1"
                    style={{ color: COLORS.success }}
                >
                    <TrendingUp size={12} />
                    <span>+{change}%</span>
                </div>
            </div>
        </div>
    );
};