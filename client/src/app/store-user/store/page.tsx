'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { Plus, Store, ArrowRight, Clock, MapPin, Phone, Settings, ShoppingBag } from 'lucide-react';
import { useStoreUserAuth } from '@/context/StoreUserAuthContext';

// Define the type for storeDetails
interface StoreDetails {
    name?: string;
    description?: string;
    store_image?: string;
    town?: string;
    operating_hours?: string;
    phone?: string;
    rating?: number;
}

// Define the type for store stats
interface StoreStats {
    totalProducts: number;
    totalCategories: number;
    productViews: number;
    totalReviews: number;
    averageRating: number;
    topProducts: Array<{
        id: string;
        name: string;
        category: string;
        sales: number;
        growth: number;
        price: number;
    }>;
    recentOrders: any[];
}

// Define the type for storeData
interface StoreProfile {
    store_owned?: string | null;
    storeDetails?: StoreDetails;
    stats?: StoreStats;
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    status?: string;
    created_at?: string;
}

export default function SellerStorePage() {
    const { storeUser } = useStoreUserAuth();
    const router = useRouter();
    const [storeData, setStoreData] = useState<StoreProfile | null>(null);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStoreProfile = async () => {
            try {
                setLoading(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/store-user/profile`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();

                    // If the user has a store, fetch the complete store details and stats
                    if (data.profile?.store_owned) {
                        // Fetch store details using the correct endpoint
                        const storeResponse = await fetch(
                            `${apiUrl}/store-user/store/${data.profile.store_owned}`,
                            { credentials: 'include' }
                        );

                        // Fetch store stats for performance metrics
                        const statsResponse = await fetch(`${apiUrl}/store-user/stats`, {
                            credentials: 'include',
                        });

                        if (storeResponse.ok) {
                            const storeDetails = await storeResponse.json();
                            let storeData = { ...data.profile, storeDetails };
                            
                            // Add stats data if available
                            if (statsResponse.ok) {
                                const statsData = await statsResponse.json();
                                storeData = { ...storeData, stats: statsData };
                            }
                            
                            setStoreData(storeData);
                        } else {
                            setStoreData(data.profile);
                        }
                    } else {
                        setStoreData(data.profile);
                    }
                } else {
                    // Redirect to login if session is invalid
                    router.push('/seller-login');
                }
            } catch (error) {
                console.error('Error fetching store profile:', error);
                router.push('/seller-login');
            } finally {
                setLoading(false);
            }
        };

        fetchStoreProfile();
    }, [router]);

    const handleCreateStore = () => {
        router.push('/store-user/store/add');
    };

    const handleViewStore = (storeId: string) => {
        router.push(`/store-user/store/view/${storeId}`);
    };

    const handleEditStore = (storeId: string) => {
        router.push(`/store-user/store/edit/${storeId}`);
    };

    const handleManageProducts = (storeId: string) => {
        router.push(`/store-user/products/${storeId}`);
    };

    const mainContentClasses = isSidebarCollapsed
        ? 'ml-20 transition-all duration-300 flex-1'
        : 'ml-64 transition-all duration-300 flex-1';

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
                user={storeUser}
            />

            {/* Main Content Area */}
            <div className={mainContentClasses}>
                {/* Header component */}
                <Header user={storeUser} notificationsCount={0} />

                {/* Main Content */}
                <main className="p-6">
                    {loading ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>
                                        My Store
                                    </h1>
                                    <p className="text-sm mt-1" style={{ color: COLORS.gray }}>
                                        Manage your marketplace store
                                    </p>
                                </div>
                            </div>
                            <Card className="border-none shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex justify-center items-center h-40">
                                        <div className="animate-pulse flex space-x-4 w-full">
                                            <div className="rounded-lg bg-gray-200 h-32 w-32"></div>
                                            <div className="flex-1 space-y-4 py-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>
                                        My Store
                                    </h1>
                                    <p className="text-sm mt-1" style={{ color: COLORS.gray }}>
                                        Manage your marketplace store
                                    </p>
                                </div>
                            </div>

                            {storeData?.store_owned ? (
                                // User has a store - Enhanced Display
                                <div className="grid gap-6 md:grid-cols-3">
                                    {/* Store Info Card */}
                                    <Card className="border-none shadow-md md:col-span-2">
                                        <CardHeader>
                                            <CardTitle style={{ color: COLORS.accent }}>Your Store</CardTitle>
                                            <CardDescription>View and manage your store details</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Store Image */}
                                                <div className="flex-shrink-0">
                                                    {storeData.storeDetails?.store_image ? (
                                                        <div className="relative w-full md:w-40 h-40 overflow-hidden rounded-lg">
                                                            <img
                                                                src={storeData.storeDetails.store_image}
                                                                alt={storeData?.storeDetails?.name || 'Store'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-primary/10 w-full md:w-40 h-40 rounded-lg flex items-center justify-center">
                                                            <Store size={60} style={{ color: COLORS.primary }} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Store Details */}
                                                <div className="flex-1">
                                                    <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
                                                        {storeData.storeDetails?.name || 'Your Store'}
                                                    </h2>
                                                    <div className="flex flex-col gap-2">
                                                        <p className="text-gray-600 text-sm mb-3">
                                                            {storeData.storeDetails?.description || 'No description available.'}
                                                        </p>

                                                        {storeData.storeDetails?.town && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <MapPin size={16} style={{ color: COLORS.accent }} />
                                                                <span>{storeData.storeDetails.town}</span>
                                                            </div>
                                                        )}

                                                        {storeData.storeDetails?.operating_hours && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Clock size={16} style={{ color: COLORS.accent }} />
                                                                <span>{storeData.storeDetails.operating_hours}</span>
                                                            </div>
                                                        )}

                                                        {storeData.storeDetails?.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Phone size={16} style={{ color: COLORS.accent }} />
                                                                <span>{storeData.storeDetails.phone}</span>
                                                            </div>
                                                        )}

                                                        {storeData.storeDetails?.rating && storeData.storeDetails.rating > 0 && (
                                                            <div className="flex items-center gap-1 mt-2">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <svg
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < Math.round(storeData.storeDetails?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                                                            }`}
                                                                        fill="currentColor"
                                                                        viewBox="0 0 20 20"
                                                                    >
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                ))}
                                                                <span className="text-sm ml-1 text-gray-600">
                                                                    {(storeData.storeDetails.rating || 0).toFixed(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 mt-4">
                                                        <Button
                                                            onClick={() => handleViewStore(storeData.store_owned!)}
                                                            className="flex items-center gap-2"
                                                            style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                                        >
                                                            <ArrowRight size={16} /> View Store
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleEditStore(storeData.store_owned!)}
                                                            variant="outline"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Settings size={16} /> Edit Store
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Quick Actions Card */}
                                    <Card className="border-none shadow-md">
                                        <CardHeader>
                                            <CardTitle style={{ color: COLORS.accent }}>Quick Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col gap-3">
                                                <Button
                                                    onClick={() => handleManageProducts(storeData.store_owned!)}
                                                    variant="outline"
                                                    className="flex items-center justify-start gap-2 h-12 w-full"
                                                >
                                                    <ShoppingBag size={18} style={{ color: COLORS.primary }} />
                                                    <div className="text-left">
                                                        <span className="font-medium">Manage Products</span>
                                                        <p className="text-xs text-gray-500">Add or edit your products</p>
                                                    </div>
                                                </Button>

                                                    <Button
                                                        onClick={() => router.push(`/store-user/location`)}
                                                        variant="outline"
                                                        className="flex items-center justify-start gap-2 h-12 w-full"
                                                    >
                                                        <MapPin size={18} style={{ color: COLORS.primary }} />
                                                        <div className="text-left">
                                                            <span className="font-medium">View Location</span>
                                                            <p className="text-xs text-gray-500">Check store location</p>
                                                        </div>
                                                    </Button>

                                                <div className="bg-gray-50 p-4 rounded-lg mt-2">
                                                    <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.accent }}>
                                                        Store ID
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mb-1">Your unique store identifier:</p>
                                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs block overflow-x-auto">
                                                        {storeData.store_owned}
                                                    </code>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Store Stats Card - Optional */}
                                    <Card className="border-none shadow-md md:col-span-3 mt-2">
                                        <CardHeader>
                                            <CardTitle style={{ color: COLORS.accent }}>Store Performance</CardTitle>
                                            <CardDescription>View your store metrics and performance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-primary/5 p-4 rounded-lg">
                                                    <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.accent }}>
                                                        Views
                                                    </h3>
                                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                                        {storeData.stats?.productViews || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Product views</p>
                                                </div>
                                                <div className="bg-primary/5 p-4 rounded-lg">
                                                    <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.accent }}>
                                                        Products
                                                    </h3>
                                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                                        {storeData.stats?.totalProducts || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Active products</p>
                                                </div>
                                                <div className="bg-primary/5 p-4 rounded-lg">
                                                    <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.accent }}>
                                                        Reviews
                                                    </h3>
                                                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                                                        {storeData.stats?.totalReviews || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Customer reviews</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                // User doesn't have a store yet - Enhanced Create Store Card
                                <Card className="border-none shadow-md bg-gradient-to-br from-white to-primary/5">
                                    <CardHeader>
                                        <CardTitle style={{ color: COLORS.accent }}>Create Your Store</CardTitle>
                                        <CardDescription>
                                            You don't have a store yet. Create one to start selling your products.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col md:flex-row items-center justify-between py-8 gap-8">
                                            <div className="flex flex-col items-center md:items-start max-w-md">
                                                <div className="bg-primary/10 p-6 rounded-full mb-6">
                                                    <Store size={48} style={{ color: COLORS.primary }} />
                                                </div>
                                                <h3
                                                    className="text-xl font-medium text-center md:text-left mb-4"
                                                    style={{ color: COLORS.accent, fontFamily: FONTS.bold }}
                                                >
                                                    Ready to start selling?
                                                </h3>
                                                <p className="text-center md:text-left text-gray-600 mb-6">
                                                    Create your store to showcase your products to customers across La Union.
                                                    Setting up your store only takes a few minutes.
                                                </p>
                                                <Button
                                                    onClick={handleCreateStore}
                                                    className="flex items-center gap-2 px-6 py-5"
                                                    style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                                >
                                                    <Plus size={18} /> Create Your Store
                                                </Button>
                                            </div>

                                            <div className="hidden md:block">
                                                <div className="relative w-64 h-64">
                                                    <div className="absolute top-4 left-4 w-56 h-56 bg-primary/10 rounded-lg"></div>
                                                    <div className="absolute top-2 left-2 w-56 h-56 bg-primary/20 rounded-lg"></div>
                                                    <div className="absolute top-0 left-0 w-56 h-56 bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg shadow-lg flex items-center justify-center">
                                                        <Store size={80} style={{ color: 'white' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-6 mt-4">
                                            <h4 className="font-medium mb-4" style={{ color: COLORS.accent }}>
                                                What you can do with your store:
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    {
                                                        title: 'Showcase Products',
                                                        description: 'Display all your products with images and descriptions',
                                                    },
                                                    {
                                                        title: 'Accept Orders',
                                                        description: 'Receive and manage orders from customers',
                                                    },
                                                    {
                                                        title: 'Build Reputation',
                                                        description: 'Collect reviews and ratings from satisfied customers',
                                                    },
                                                ].map((item, index) => (
                                                    <div key={index} className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 mt-1">
                                                            <div className="bg-primary/20 w-6 h-6 rounded-full flex items-center justify-center">
                                                                <span className="text-xs font-bold" style={{ color: COLORS.primary }}>
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h5 className="font-medium mb-1">{item.title}</h5>
                                                            <p className="text-sm text-gray-600">{item.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}