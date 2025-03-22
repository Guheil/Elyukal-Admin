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
                                <TabsTrigger value="orders">Orders</TabsTrigger>
                                <TabsTrigger value="customers">Customers</TabsTrigger>
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
                            {/* Similar for orders and customers */}
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}