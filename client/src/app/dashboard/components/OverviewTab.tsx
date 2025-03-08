import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PerformanceMetric } from './PerformanceMetric';
import { COLORS } from '../../constants/colors';
import { Eye } from 'lucide-react';

interface OverviewTabProps {
    analyticsData: any;
}

export default function OverviewTab({ analyticsData }: OverviewTabProps) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount);
    const getGrowthClass = (growth: number) => growth >= 0 ? "text-success flex items-center gap-1" : "text-error flex items-center gap-1";
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed': return { bg: COLORS.success, text: 'white' };
            // Other cases
            default: return { bg: COLORS.gray, text: 'white' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle style={{ color: COLORS.accent }}>Top Selling Products</CardTitle>
                        <CardDescription>Products with the highest sales this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full">
                            {/* Table content */}
                        </table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle style={{ color: COLORS.accent }}>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <PerformanceMetric
                            icon={<Eye size={18} style={{ color: COLORS.primary }} />}
                            label="Product Views"
                            value={analyticsData.productViews.toLocaleString()}
                            change={8.2}
                            color={COLORS.primary}
                        />
                        {/* Other metrics */}
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle style={{ color: COLORS.accent }}>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full">
                            {/* Orders table */}
                        </table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle style={{ color: COLORS.accent }}>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Notifications list */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}