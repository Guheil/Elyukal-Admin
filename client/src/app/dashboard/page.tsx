'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsSection from './components/StatsSection';
import OverviewTab from './components/OverviewTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { fetchDashboardStats } from '../api/dashboardService';

export default function Dashboard() {
    const { user } = useAuth();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [analyticsData, setAnalyticsData] = useState({
        totalProducts: 0,
        totalCategories: 0,
        activeLocations: 0,
        totalReviews: 0,
        averageRating: 0,
        topProducts: [
            { id: 1, name: "Virginia Tobacco", sales: 520, growth: 9.8, category: "Agriculture" },
            // ... other products
        ],
        recentOrders: [
            { id: "ORD-7301", product: "Inabel Fabric Set", customer: "Ana Mercado", date: "Mar 8, 2025", status: "Completed" },
            // ... other updates
        ],
        notifications: [
            // ... unchanged
        ],
    });
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await fetchDashboardStats();
                setAnalyticsData(prevData => ({
                    ...prevData,
                    ...stats
                }));
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };
        
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen flex  bg-container" style={{ backgroundColor: COLORS.container }}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={user} />
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Header user={user} notificationsCount={analyticsData.notifications.length} />
                <main className="p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Dashboard Overview</h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Welcome back! Here's what's happening with your products today.</p>
                            </div>
                        </div>
                        <StatsSection analyticsData={analyticsData} />
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="mb-6">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="products">Products</TabsTrigger>
                                <TabsTrigger value="stores">Stores</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview">
                                <OverviewTab analyticsData={analyticsData} />
                            </TabsContent>
                            <TabsContent value="products">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Products Management</CardTitle>
                                        <CardDescription>Manage your product catalog</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-500">This tab will contain product management features...</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="stores">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Stores Management</CardTitle>
                                        <CardDescription>Manage your store locations and inventory</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-500">This tab will contain store management features...</p>

                                        <div className="mt-4">
                                            <h3 className="text-sm font-medium mb-2">Store Statistics</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                <Card className="p-4">
                                                    <h4 className="text-sm font-medium mb-1">Stores with Most Products</h4>
                                                    <div className="py-6 border border-dashed rounded-md bg-slate-50 text-center">
                                                        <p className="text-sm text-gray-500">No data available</p>
                                                    </div>
                                                </Card>
                                                <Card className="p-4">
                                                    <h4 className="text-sm font-medium mb-1">Top Performing Stores</h4>
                                                    <div className="py-6 border border-dashed rounded-md bg-slate-50 text-center">
                                                        <p className="text-sm text-gray-500">No data available</p>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <h3 className="text-sm font-medium mb-2">All Stores</h3>
                                            <div className="py-8 border border-dashed rounded-md bg-slate-50 text-center">
                                                <p className="text-sm text-gray-500">No store data available</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            {/* Similar for orders and customers */}
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}