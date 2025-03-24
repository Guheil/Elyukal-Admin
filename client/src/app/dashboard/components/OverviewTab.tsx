import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from '@/config';
import { PerformanceMetric } from './PerformanceMetric';
import { COLORS } from '../../constants/colors';
import { Eye, ShoppingCart, Users, TrendingUp, CheckCircle2, AlertTriangle, Activity, Package, Star } from 'lucide-react';
import { fetchPopularProducts, Product } from '../../api/productService';

interface OverviewTabProps {
    analyticsData: any;
}

export default function OverviewTab({ analyticsData }: OverviewTabProps) {
    const [totalProducts, setTotalProducts] = useState<number>(0);

    const [popularProducts, setPopularProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        // Fetch total number of products and popular products on component mount
        const fetchData = async () => {
            try {
                // Fetch total products count
                const countResponse = await fetch(`${BASE_URL}/get_total_number_of_products`);
                const countData = await countResponse.json();
                setTotalProducts(countData.total_products);

                // Fetch total product views
                const viewsResponse = await fetch(`${BASE_URL}/get_total_number_of_product_views`);
                const viewsData = await viewsResponse.json();
                // Update analyticsData with the total product views
                if (analyticsData && typeof analyticsData === 'object') {
                    analyticsData.productViews = viewsData.total_product_views;
                }

                // Fetch popular products
                const productsResponse = await fetchPopularProducts();
                if (productsResponse && productsResponse.products) {
                    // Sort by total_reviews in descending order and take top 5
                    const sortedProducts = [...productsResponse.products]
                        .sort((a, b) => b.total_reviews - a.total_reviews)
                        .slice(0, 5);
                    setPopularProducts(sortedProducts);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchData();
    }, [analyticsData]);

    // Function to render rating stars
    const renderRatingStars = (rating: string) => {
        const ratingValue = parseFloat(rating);
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(ratingValue) ? COLORS.secondary : 'transparent'}
                        stroke={COLORS.secondary}
                        className={i < Math.floor(ratingValue) ? 'text-yellow-400' : 'text-gray-300'}
                    />
                ))}
                <span className="ml-1 text-sm" style={{ color: COLORS.gray }}>{ratingValue.toFixed(1)}</span>
            </div>
        );
    };

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

    // Sample admin activities data
    const adminActivities = [
        {
            id: 1,
            admin: "John Smith",
            activity: "edited",
            object: "Summer Collection Store",
            datetime: "Today, 10:45 AM"
        },
        {
            id: 2,
            admin: "Sarah Johnson",
            activity: "added",
            object: "Bacnotan Honey",
            datetime: "Today, 9:30 AM"
        },
        {
            id: 3,
            admin: "Michael Brown",
            activity: "deleted",
            object: "Inabel",
            datetime: "Yesterday, 4:15 PM"
        },
        {
            id: 4,
            admin: "Emma Wilson",
            activity: "edited",
            object: "Surf Miniature Figurine",
            datetime: "Yesterday, 2:20 PM"
        },
        {
            id: 5,
            admin: "David Lee",
            activity: "added",
            object: "Basi Wine",
            datetime: "Mar 22, 2025, 11:05 AM"
        }
    ];

    // Function to get activity badge color
    const getActivityBadge = (activity: string) => {
        switch (activity) {
            case 'added': return { bg: COLORS.success, text: 'white' };
            case 'edited': return { bg: COLORS.gradient.middle, text: 'white' };
            case 'deleted': return { bg: COLORS.error, text: 'white' };
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
                            <CardTitle style={{ color: COLORS.accent }}>Most Reviewed Products</CardTitle>
                            <Button variant="ghost" size="sm" className="text-sm" style={{ color: COLORS.primary }}>

                            </Button>
                        </div>
                        <CardDescription>Products with the highest number of customer reviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingProducts ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.primary }}></div>
                            </div>
                        ) : popularProducts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm" style={{ color: COLORS.gray }}>No products found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm" style={{ color: COLORS.gray }}>
                                        <th className="pb-3 font-medium">Product</th>
                                        <th className="pb-3 font-medium">Category</th>
                                        <th className="pb-3 font-medium">Rating</th>
                                        <th className="pb-3 font-medium text-right">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {popularProducts.map((product) => (
                                        <tr key={product.id} className="border-t border-gray-100">
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    {product.image_urls && product.image_urls.length > 0 ? (
                                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <img
                                                                src={product.image_urls[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <Package size={16} style={{ color: COLORS.gray }} />
                                                        </div>
                                                    )}
                                                    <div className="font-medium" style={{ color: COLORS.accent }}>{product.name}</div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <Badge variant="outline" className="font-normal rounded-full" style={{ borderColor: COLORS.lightgray }}>
                                                    {product.category}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                {renderRatingStars(product.average_rating)}
                                            </td>
                                            <td className="py-3 text-right font-medium">
                                                {product.total_reviews}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
                                change={analyticsData.productViewsGrowth || 0}
                                color={COLORS.primary}
                            />
                            <PerformanceMetric
                                icon={<ShoppingCart size={18} style={{ color: COLORS.success }} />}
                                label="Conversion Rate"
                                value={`${analyticsData.orderConversionRate || 0}%`}
                                change={analyticsData.conversionRateGrowth || 0}
                                color={COLORS.success}
                            />
                            <PerformanceMetric
                                icon={<Package size={18} style={{ color: COLORS.gold }} />}
                                label="Total Products"
                                value={totalProducts.toLocaleString()}
                                change={analyticsData.productsGrowth || 0}
                                color={COLORS.gold}
                            />
                            <PerformanceMetric
                                icon={<Package size={18} style={{ color: COLORS.gold }} />}
                                label="Stock Availability"
                                value={`${Math.round(((totalProducts || 0) - (analyticsData.pendingApproval || 0)) / (totalProducts || 1) * 100)}%`}
                                change={analyticsData.stockGrowth || 0}
                                color={COLORS.gold}
                            />
                            <PerformanceMetric
                                icon={<Users size={18} style={{ color: COLORS.gradient.middle }} />}
                                label="Active Users"
                                value={analyticsData.totalAdminUsers?.toString() || '0'}
                                change={analyticsData.usersGrowth || 0}
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
                {/* Recent Admin Activities */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle style={{ color: COLORS.accent }}>Recent Admin Activities</CardTitle>
                            <Button variant="ghost" size="sm" className="text-sm" style={{ color: COLORS.primary }}>
                                View All Activities
                            </Button>
                        </div>
                        <CardDescription>Latest admin actions in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="text-left text-sm" style={{ color: COLORS.gray }}>
                                    <th className="pb-3 font-medium w-1/4">Admin</th>
                                    <th className="pb-3 font-medium w-1/6">Activity</th>
                                    <th className="pb-3 font-medium w-1/3">Object</th>
                                    <th className="pb-3 font-medium w-1/4">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {adminActivities.map((activity) => {
                                    const activityStyles = getActivityBadge(activity.activity);
                                    return (
                                        <tr key={activity.id} className="h-16">
                                            <td className="py-3 font-medium" style={{ color: COLORS.accent }}>{activity.admin}</td>
                                            <td className="py-3">
                                                <Badge
                                                    className="rounded-full px-2 py-1 text-xs font-normal"
                                                    style={{ backgroundColor: activityStyles.bg, color: activityStyles.text }}
                                                >
                                                    {activity.activity}
                                                </Badge>
                                            </td>
                                            <td className="py-3 truncate">{activity.object}</td>
                                            <td className="py-3 text-sm" style={{ color: COLORS.gray }}>{activity.datetime}</td>
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