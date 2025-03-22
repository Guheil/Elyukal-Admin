import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from '@/config';
import { PerformanceMetric } from './PerformanceMetric';
import { COLORS } from '../../constants/colors';
import { Eye, ShoppingCart, Users, TrendingUp, CheckCircle2, AlertTriangle, Activity, Package } from 'lucide-react';

interface OverviewTabProps {
    analyticsData: any;
}

export default function OverviewTab({ analyticsData }: OverviewTabProps) {
    const [totalProducts, setTotalProducts] = useState<number>(0);

    useEffect(() => {
        // Fetch total number of products on component mount
        const fetchTotalProducts = async () => {
            try {
                const response = await fetch(`${BASE_URL}/get_total_number_of_products`);
                const data = await response.json();
                setTotalProducts(data.total_products);
            } catch (error) {
                console.error('Error fetching total products:', error);
            }
        };

        fetchTotalProducts();
    }, []);

    const getGrowthClass = (growth: number) =>
        growth >= 0 ? "text-success flex items-center gap-1" : "text-error flex items-center gap-1";

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active': return { bg: COLORS.success, text: 'white' };
            case 'Pending': return { bg: COLORS.gradient.middle, text: 'white' };
            case 'Low Stock': return { bg: COLORS.gold, text: 'black' };
            default: return { bg: COLORS.gray, text: 'white' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Selling Products */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle style={{ color: COLORS.accent }}>Top Selling Products</CardTitle>
                            <Button variant="ghost" size="sm" className="text-sm" style={{ color: COLORS.primary }}>
                                View All
                            </Button>
                        </div>
                        <CardDescription>Products with the highest visibility this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm" style={{ color: COLORS.gray }}>
                                    <th className="pb-3 font-medium">Product</th>
                                    <th className="pb-3 font-medium">Category</th>
                                    <th className="pb-3 font-medium text-right">Views</th>
                                    <th className="pb-3 font-medium text-right">Growth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.topProducts.map((product: any) => (
                                    <tr key={product.id} className="border-t border-gray-100">
                                        <td className="py-3">
                                            <div className="font-medium" style={{ color: COLORS.accent }}>{product.name}</div>
                                        </td>
                                        <td className="py-3">
                                            <Badge variant="outline" className="font-normal rounded-full" style={{ borderColor: COLORS.lightgray }}>
                                                {product.category}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-right font-medium">{product.sales}</td>
                                        <td className="py-3 text-right">
                                            <span className={getGrowthClass(product.growth)}>
                                                {product.growth >= 0 ? (
                                                    <TrendingUp size={14} />
                                                ) : (
                                                    <TrendingUp size={14} className="transform rotate-180" />
                                                )}
                                                {Math.abs(product.growth)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle style={{ color: COLORS.accent }}>Performance Metrics</CardTitle>
                        <CardDescription>Key metrics for this month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <PerformanceMetric
                                icon={<Eye size={18} style={{ color: COLORS.primary }} />}
                                label="Product Views"
                                value={(analyticsData.productViews?.toLocaleString() || '0')}
                                change={8.2}
                                color={COLORS.primary}
                            />
                            <PerformanceMetric
                                icon={<ShoppingCart size={18} style={{ color: COLORS.success }} />}
                                label="Interest Rate"
                                value={`${analyticsData.orderConversionRate || 0}%`}
                                change={1.5}
                                color={COLORS.success}
                            />
                            <PerformanceMetric
                                icon={<Package size={18} style={{ color: COLORS.gold }} />}
                                label="Total Products"
                                value={totalProducts.toLocaleString()}
                                change={0}
                                color={COLORS.gold}
                            />
                            <PerformanceMetric
                                icon={<Package size={18} style={{ color: COLORS.gold }} />}
                                label="Stock Availability"
                                value={`${Math.round(((totalProducts || 0) - (analyticsData.pendingApproval || 0)) / (totalProducts || 1) * 100)}%`}
                                change={3.7}
                                color={COLORS.gold}
                            />
                            <PerformanceMetric
                                icon={<Users size={18} style={{ color: COLORS.gradient.middle }} />}
                                label="New Visitors"
                                value="235" // Hypothetical value
                                change={15.3}
                                color={COLORS.gradient.middle}
                            />
                        </div>
                        <Button
                            className="w-full"
                            variant="outline"
                            style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                        >
                            View Detailed Analytics
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Product Updates */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle style={{ color: COLORS.accent }}>Recent Product Updates</CardTitle>
                            <Button variant="ghost" size="sm" className="text-sm" style={{ color: COLORS.primary }}>
                                View All Updates
                            </Button>
                        </div>
                        <CardDescription>Latest changes to product listings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm" style={{ color: COLORS.gray }}>
                                    <th className="pb-3 font-medium">Product ID</th>
                                    <th className="pb-3 font-medium">Product</th>
                                    <th className="pb-3 font-medium">Updated By</th>
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.recentOrders.map((update: any) => {
                                    const statusStyles = getStatusBadge(update.status === "Completed" ? "Active" : update.status === "Processing" ? "Pending" : "Low Stock");
                                    return (
                                        <tr key={update.id} className="border-t border-gray-100">
                                            <td className="py-3 font-medium" style={{ color: COLORS.primary }}>{update.id}</td>
                                            <td className="py-3">{update.product}</td>
                                            <td className="py-3">{update.customer}</td>
                                            <td className="py-3 text-sm" style={{ color: COLORS.gray }}>{update.date}</td>
                                            <td className="py-3">
                                                <Badge
                                                    className="rounded-full px-2 py-1 text-xs font-normal"
                                                    style={{ backgroundColor: statusStyles.bg, color: statusStyles.text }}
                                                >
                                                    {update.status === "Completed" ? "Active" : update.status === "Processing" ? "Pending" : "Low Stock"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle style={{ color: COLORS.accent }}>Notifications</CardTitle>
                            <Badge
                                className="rounded-full px-2 py-1"
                                style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
                            >
                                {analyticsData.notifications?.length || 0} New
                            </Badge>
                        </div>
                        <CardDescription>Recent system notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analyticsData.notifications.map((notification: any) => (
                                <div key={notification.id} className="flex gap-3 pb-4 border-b border-gray-100">
                                    <div className="pt-0.5">
                                        {notification.type === 'alert' && (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.error}20` }}>
                                                <AlertTriangle size={16} style={{ color: COLORS.error }} />
                                            </div>
                                        )}
                                        {notification.type === 'success' && (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.success}20` }}>
                                                <CheckCircle2 size={16} style={{ color: COLORS.success }} />
                                            </div>
                                        )}
                                        {notification.type === 'info' && (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}20` }}>
                                                <Activity size={16} style={{ color: COLORS.primary }} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: COLORS.accent }}>{notification.message}</p>
                                        <p className="text-xs" style={{ color: COLORS.gray }}>{notification.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="ghost"
                            className="w-full text-sm"
                            style={{ color: COLORS.primary }}
                        >
                            View All Notifications
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}