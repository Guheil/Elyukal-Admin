'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { COLORS } from '@/app/constants/colors';
import { FONTS } from '@/app/constants/fonts';
import { ArrowLeft, MapPin, Clock, Phone, Star } from 'lucide-react';
import { useStoreUserAuth } from '@/context/StoreUserAuthContext';
import Header from '@/app/store-user/dashboard/components/Header';
import Sidebar from '@/app/store-user/dashboard/components/Sidebar';
import StoreLocationMap from '@/components/ui/map/StoreLocationMap';
import 'leaflet/dist/leaflet.css';

interface StoreDetails {
    store_id?: string;
    name?: string;
    description?: string;
    store_image?: string;
    town?: string;
    operating_hours?: string;
    phone?: string;
    rating?: number;
    products?: any[];
    reviews?: any[];
    latitude?: number;
    longitude?: number;
}

export default function StoreViewPage() {
    const { storeUser } = useStoreUserAuth();
    const router = useRouter();
    const params = useParams();
    const storeId = params.id as string;

    const [store, setStore] = useState<StoreDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const fetchStoreDetails = async () => {
            try {
                setLoading(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/store-user/store/${storeId}`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setStore(data);
                } else {
                    console.error('Failed to fetch store details');
                    router.push('/store-user/store');
                }
            } catch (error) {
                console.error('Error fetching store details:', error);
                router.push('/store-user/store');
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchStoreDetails();
        }
    }, [storeId, router]);

    const handleBack = () => {
        router.push('/store-user/store');
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
                    <div className="flex items-center mb-6">
                        <Button variant="ghost" onClick={handleBack} className="mr-4">
                            <ArrowLeft size={16} className="mr-2" /> Back to My Store
                        </Button>
                    </div>

                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-64 bg-gray-200 rounded mb-6"></div>
                        </div>
                    ) : (
                        store ? (
                            <div className="grid gap-6">
                                {/* Store Details Card */}
                                    {/* Store Details Card */}
                                    <div className="grid gap-6 md:grid-cols-3">
                                        {/* Store Details Card - takes 2/3 of the space */}
                                        <Card className="border-none shadow-md md:col-span-2">
                                            <CardHeader>
                                                <CardTitle style={{ color: COLORS.accent }}>{store.name}</CardTitle>
                                                <CardDescription>Store Details</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Store Image */}
                                                    <div className="flex-shrink-0">
                                                        {store.store_image ? (
                                                            <div className="relative w-full md:w-40 h-40 overflow-hidden rounded-lg">
                                                                <img
                                                                    src={store.store_image}
                                                                    alt={store.name || 'Store'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-primary/10 w-full md:w-40 h-40 rounded-lg flex items-center justify-center">
                                                                <span className="text-primary text-xl font-bold">{store.name?.charAt(0) || 'S'}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Store Details */}
                                                    <div className="flex-1">
                                                        <p className="text-gray-600 text-sm mb-4">
                                                            {store.description || 'No description available.'}
                                                        </p>

                                                        <div className="flex flex-col gap-2">
                                                            {store.town && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <MapPin size={16} style={{ color: COLORS.accent }} />
                                                                    <span>{store.town}</span>
                                                                </div>
                                                            )}

                                                            {store.operating_hours && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Clock size={16} style={{ color: COLORS.accent }} />
                                                                    <span>{store.operating_hours}</span>
                                                                </div>
                                                            )}

                                                            {store.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Phone size={16} style={{ color: COLORS.accent }} />
                                                                    <span>{store.phone}</span>
                                                                </div>
                                                            )}

                                                            {store.rating && store.rating > 0 && (
                                                                <div className="flex items-center gap-1 mt-2">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <svg
                                                                            key={i}
                                                                            className={`w-4 h-4 ${i < Math.round(store.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                            fill="currentColor"
                                                                            viewBox="0 0 20 20"
                                                                        >
                                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                        </svg>
                                                                    ))}
                                                                    <span className="text-sm ml-1 text-gray-600">
                                                                        {(store.rating || 0).toFixed(1)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Store Stats Card - takes 1/3 of the space */}
                                        <Card className="border-none shadow-md">
                                            <CardHeader>
                                                <CardTitle style={{ color: COLORS.accent }}>Store ID</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1">Your unique store identifier:</p>
                                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs block overflow-x-auto">
                                                        {store.store_id}
                                                    </code>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                {/* Store Location Map and Reviews */}
                                <div className="grid gap-6 md:grid-cols-2 w-full">
                                    {/* Store Location Map */}
                                            <StoreLocationMap
                                                storeName={store.name || 'Store'}
                                                town={store.town}
                                                latitude={store.latitude}
                                                longitude={store.longitude}
                                                className="w-full min-h-[500px]"
                                            />
                                    {/* Reviews Section */}
                                    <Card className="border-none shadow-md h-full w-full">
                                        <CardHeader>
                                            <CardTitle style={{ color: COLORS.accent }}>Customer Reviews</CardTitle>
                                            <CardDescription>What customers are saying about your store</CardDescription>
                                        </CardHeader>
                                        <CardContent className="overflow-y-auto max-h-[500px]">
                                            {store.reviews && store.reviews.length > 0 ? (
                                                <div className="grid gap-4">
                                                    {store.reviews.map((review, index) => (
                                                        <div key={index} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="flex items-center">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            size={16}
                                                                            className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm font-medium">{review.user_name || 'Anonymous'}</span>
                                                                <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{review.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8">
                                                    <div className="bg-gray-50 rounded-full p-4 mb-4">
                                                        <Star size={24} className="text-gray-300" />
                                                    </div>
                                                    <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.accent }}>
                                                        No reviews yet
                                                    </h3>
                                                    <p className="text-sm text-gray-500 text-center max-w-md">
                                                        Your store hasn't received any customer reviews yet. As customers shop and experience your products, reviews will appear here.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-lg text-gray-600">Store not found</p>
                                <Button onClick={handleBack} className="mt-4" style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                                    Return to My Store
                                </Button>
                            </div>
                        )
                    )}
                </main>
            </div>
        </div>
    );
}