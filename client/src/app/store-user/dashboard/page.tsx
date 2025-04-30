'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsSection from './components/StatsSection';
import OverviewTab from './components/OverviewTab';
import ProductsTab from './components/ProductsTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useStoreUserAuth } from '@/context/StoreUserAuthContext';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function StoreUserDashboard() {
    const { storeUser } = useStoreUserAuth();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [analyticsData, setAnalyticsData] = useState({
        totalProducts: 0,
        totalCategories: 0,
        productViews: 0,
        totalReviews: 0,
        averageRating: 0,
        topProducts: [
            { id: 1, name: "Handwoven Inabel Fabric", sales: 42, growth: 8.5, category: "Textiles", status: "Active", rating: 4.8 },
            { id: 2, name: "Bamboo Crafts Set", sales: 38, growth: 5.2, category: "Crafts", status: "Active", rating: 4.5 },
            { id: 3, name: "Ilocos Garlic", sales: 35, growth: 3.7, category: "Food", status: "Low Stock", rating: 4.7 },
            { id: 4, name: "Handmade Pottery", sales: 30, growth: 2.1, category: "Crafts", status: "Active", rating: 4.6 },
        ],
        recentOrders: [
            { id: "ORD-7301", product: "Inabel Fabric Set", customer: "Ana Mercado", date: "Mar 8, 2023", status: "Completed" },
            { id: "ORD-7302", product: "Bamboo Crafts Set", customer: "Juan Dela Cruz", date: "Mar 7, 2023", status: "Processing" },
            { id: "ORD-7303", product: "Ilocos Garlic (1kg)", customer: "Maria Santos", date: "Mar 6, 2023", status: "Shipped" },
            { id: "ORD-7304", product: "Handmade Pottery", customer: "Pedro Reyes", date: "Mar 5, 2023", status: "Completed" },
        ],
        notifications: [
            { id: 1, message: "New order received for Inabel Fabric Set", time: "2 hours ago" },
            { id: 2, message: "Product 'Ilocos Garlic' is running low on stock", time: "5 hours ago" },
            { id: 3, message: "New review for 'Bamboo Crafts Set'", time: "1 day ago" },
            { id: 4, message: "Payment received for order #ORD-7301", time: "2 days ago" },
        ],
    });
    
    useEffect(() => {
        const fetchStoreAnalytics = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/store-user/stats`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies for session authentication
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAnalyticsData(prevData => ({
                        ...prevData,
                        ...data
                    }));
                } else {
                    console.error('Error fetching store analytics:', response.status);
                }
            } catch (error) {
                console.error('Store analytics fetch error:', error);
            }
        };
        
        fetchStoreAnalytics();
    }, []);

    return (
        <div className="min-h-screen flex bg-container" style={{ backgroundColor: COLORS.container }}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={storeUser} />
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Header user={storeUser} notificationsCount={analyticsData.notifications.length} />
                <main className="p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Store Dashboard</h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Welcome back! Here's what's happening with your store today.</p>
                            </div>
                        </div>
                        {storeUser && storeUser.store_owned ? (
                            <>
                                <StatsSection analyticsData={analyticsData} />
                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="mb-6">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="products">Products</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview">
                                        <OverviewTab analyticsData={analyticsData} />
                                    </TabsContent>
                                    <TabsContent value="products">
                                        <ProductsTab analyticsData={analyticsData} />
                                    </TabsContent>
                                </Tabs>
                            </>
                        ) : (
                            <Card className="p-8 text-center">
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.accent }}>No Store Created Yet</h3>
                                        <p className="text-gray-500 mb-6 max-w-md">You need to create a store to view your dashboard statistics and manage your products.</p>
                                        <Button style={{ backgroundColor: COLORS.primary, color: 'white' }}>Create Your Store</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}