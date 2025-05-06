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
        topProducts: [],
        mostRatedProducts: [],
        recentOrders: [],
        notifications: [
            { id: 1, message: "New order received for Inabel Fabric Set", time: "2 hours ago" },
            { id: 2, message: "Product 'Ilocos Garlic' is running low on stock", time: "5 hours ago" },
            { id: 3, message: "New review for 'Bamboo Crafts Set'", time: "1 day ago" },
            { id: 4, message: "Payment received for order #ORD-7301", time: "2 days ago" },
        ],
    });

    // Function to fetch and calculate analytics data
    const fetchStoreAnalytics = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            // Fetch store stats
            const statsResponse = await fetch(`${apiUrl}/store-user/stats`, {
                method: 'GET',
                credentials: 'include', // Include cookies for session authentication
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Fetch products directly to ensure accurate count
            const productsResponse = await fetch(`${apiUrl}/store-user/fetch-products`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Process products data regardless of stats response
            if (productsResponse.ok) {
                const productsData = await productsResponse.json();

                // Calculate metrics from products data
                const products = productsData.products || [];
                const totalProducts = products.length;

                // Calculate unique categories
                const uniqueCategories = new Set();
                products.forEach((product: { category: unknown; }) => {
                    if (product.category) {
                        uniqueCategories.add(product.category);
                    }
                });
                const totalCategories = uniqueCategories.size;

                // Calculate total views
                const productViews = products.reduce((sum: any, product: { views: any; }) => sum + (product.views || 0), 0);

                // Calculate total reviews
                const totalReviews = products.reduce((sum: any, product: { total_reviews: any; }) => sum + (product.total_reviews || 0), 0);

                // Calculate average rating
                let averageRating = 0;
                if (totalReviews > 0) {
                    const totalRatingSum = products.reduce((sum: number, product: { average_rating: any; total_reviews: number; }) => {
                        const rating = parseFloat(product.average_rating || 0);
                        const reviews = product.total_reviews || 0;
                        return sum + (rating * reviews);
                    }, 0);
                    averageRating = totalRatingSum / totalReviews;
                }

                // Try to get stats data if available, otherwise just use product-derived metrics
                let statsData: any = {};
                let topProducts: any[] = [];

                if (statsResponse.ok) {
                    try {
                        statsData = await statsResponse.json();

                        // Extract top products from stats response if available
                        if (statsData && statsData.topProducts && Array.isArray(statsData.topProducts)) {
                            topProducts = statsData.topProducts;
                        }
                    } catch (e) {
                        console.warn('Could not parse stats response:', e);
                    }
                }

                // If we don't have top products from stats, use the products we already fetched
                if (!topProducts || topProducts.length === 0) {
                    // Sort products by views (descending) and take top 5
                    if (products.length > 0) {
                        topProducts = [...products]
                            .sort((a, b) => (b.views || 0) - (a.views || 0))
                            .slice(0, 5);

                        console.log('Created top products from products data:', {
                            productsCount: products.length,
                            topProductsCount: topProducts.length,
                            firstProduct: topProducts[0] ? {
                                id: topProducts[0].id,
                                name: topProducts[0].name,
                                views: topProducts[0].views,
                                hasImages: Array.isArray(topProducts[0].image_urls) && topProducts[0].image_urls.length > 0
                            } : 'No products'
                        });
                    } else {
                        console.log('No products found to create top products');
                    }
                }

                // Make sure topProducts is an array
                if (!Array.isArray(topProducts)) {
                    console.warn('topProducts is not an array, setting to empty array');
                    topProducts = [];
                }

                // Create most rated products list (by total reviews)
                let mostRatedProducts: any[] = [];
                if (products.length > 0) {
                    // Sort products by total_reviews (descending) and take top 5
                    mostRatedProducts = [...products]
                        .sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
                        .slice(0, 5);

                    console.log('Created most rated products:', {
                        count: mostRatedProducts.length,
                        sample: mostRatedProducts.length > 0 ? {
                            name: mostRatedProducts[0].name,
                            totalReviews: mostRatedProducts[0].total_reviews || 0
                        } : 'No products'
                    });
                }

                // Log the top products we're about to use
                console.log('Final topProducts before state update:', {
                    count: topProducts.length,
                    isArray: Array.isArray(topProducts),
                    sample: topProducts.length > 0 && topProducts[0] ? topProducts[0].name : 'No products'
                });

                // Check if data has changed before updating state
                const newData = {
                    ...statsData, // Include any additional stats data if available
                    // Override with our calculated metrics
                    totalProducts,
                    totalCategories,
                    productViews,
                    totalReviews,
                    averageRating: parseFloat(averageRating.toFixed(1)),
                    topProducts: topProducts,
                    mostRatedProducts: mostRatedProducts
                };

                // Only update if data has changed to avoid unnecessary re-renders
                setAnalyticsData(prevData => {
                    // Check if any key metrics have changed
                    const topProductsChanged = JSON.stringify(prevData.topProducts) !== JSON.stringify(newData.topProducts);
                    const mostRatedProductsChanged = JSON.stringify(prevData.mostRatedProducts) !== JSON.stringify(newData.mostRatedProducts);

                    if (
                        prevData.totalProducts !== newData.totalProducts ||
                        prevData.totalCategories !== newData.totalCategories ||
                        prevData.productViews !== newData.productViews ||
                        prevData.totalReviews !== newData.totalReviews ||
                        prevData.averageRating !== newData.averageRating ||
                        topProductsChanged ||
                        mostRatedProductsChanged
                    ) {
                        console.log('Dashboard metrics updated:', {
                            totalProducts,
                            totalCategories,
                            productViews,
                            totalReviews,
                            averageRating: parseFloat(averageRating.toFixed(1)),
                            topProductsCount: newData.topProducts?.length || 0
                        });
                        return { ...prevData, ...newData };
                    }
                    return prevData;
                });
            } else {
                console.error('Error fetching products data:', productsResponse.status);

                // If products fetch fails but stats is available, use stats data
                if (statsResponse.ok) {
                    try {
                        const statsData = await statsResponse.json();

                        // Make sure we extract top products from stats data
                        let topProducts: any[] = [];
                        if (statsData && statsData.topProducts && Array.isArray(statsData.topProducts)) {
                            topProducts = statsData.topProducts;
                            console.log('Found top products in stats data:', {
                                count: topProducts.length,
                                sample: topProducts.length > 0 && topProducts[0] ? topProducts[0].name : 'No products'
                            });
                        } else {
                            console.warn('No top products found in stats data or not in array format');
                        }

                        setAnalyticsData(prevData => {
                            const topProductsChanged = JSON.stringify(prevData.topProducts) !== JSON.stringify(topProducts);

                            if (
                                prevData.totalProducts !== (statsData.totalProducts || 0) ||
                                prevData.totalCategories !== (statsData.totalCategories || 0) ||
                                prevData.productViews !== (statsData.productViews || 0) ||
                                prevData.totalReviews !== (statsData.totalReviews || 0) ||
                                prevData.averageRating !== (statsData.averageRating || 0) ||
                                topProductsChanged
                            ) {
                                console.log('Dashboard metrics updated from stats:', {
                                    totalProducts: statsData.totalProducts || 0,
                                    totalCategories: statsData.totalCategories || 0,
                                    productViews: statsData.productViews || 0,
                                    totalReviews: statsData.totalReviews || 0,
                                    averageRating: statsData.averageRating || 0,
                                    topProductsCount: topProducts.length
                                });
                                return {
                                    ...prevData,
                                    ...statsData,
                                    topProducts: topProducts
                                };
                            }
                            return prevData;
                        });
                    } catch (e) {
                        console.error('Error parsing stats data:', e);
                    }
                } else {
                    console.error('Both API calls failed:',
                        `Stats: ${statsResponse.status}`,
                        `Products: ${productsResponse.status}`
                    );
                }
            }
        } catch (error) {
            console.error('Store analytics fetch error:', error);
        }
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchStoreAnalytics();

        // Set up polling interval for real-time updates (every 5 seconds)
        const intervalId = setInterval(() => {
            fetchStoreAnalytics();
        }, 5000); // 5000 ms = 5 seconds

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
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