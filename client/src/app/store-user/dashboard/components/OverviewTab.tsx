import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COLORS } from '../../../constants/colors';
import { Eye, Star, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OverviewTabProps {
    analyticsData: any;
}

export default function OverviewTab({ analyticsData }: OverviewTabProps) {
    // Debug the incoming data
    console.log('OverviewTab received data:', {
        hasTopProducts: Boolean(analyticsData.topProducts),
        topProductsLength: analyticsData.topProducts ? analyticsData.topProducts.length : 0,
        topProductsIsArray: Array.isArray(analyticsData.topProducts),
        firstProduct: analyticsData.topProducts && Array.isArray(analyticsData.topProducts) && analyticsData.topProducts.length > 0 ? {
            id: analyticsData.topProducts[0].id,
            name: analyticsData.topProducts[0].name,
            hasImages: Array.isArray(analyticsData.topProducts[0].image_urls) && analyticsData.topProducts[0].image_urls.length > 0
        } : 'No products'
    });

    // Ensure products arrays are always arrays
    const topProducts = Array.isArray(analyticsData.topProducts) ? analyticsData.topProducts : [];
    const mostRatedProducts = Array.isArray(analyticsData.mostRatedProducts) ? analyticsData.mostRatedProducts : [];
    // Function to render rating stars
    const renderRatingStars = (rating: number) => {
        const ratingValue = typeof rating === 'string' ? parseFloat(rating) : rating;
        const validRating = isNaN(ratingValue) ? 0 : ratingValue;

        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(validRating) ? COLORS.secondary : 'transparent'}
                        stroke={COLORS.secondary}
                        className={i < Math.floor(validRating) ? 'text-yellow-400' : 'text-gray-300'}
                    />
                ))}
                <span className="ml-1 text-sm" style={{ color: COLORS.gray }}>{validRating.toFixed(1)}</span>
            </div>
        );
    };

    // Function to get the first image URL from a product
    const getProductImage = (product: any) => {
        if (product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
            return product.image_urls[0];
        }
        return null;
    };

    // Function to format price
    const formatPrice = (product: any) => {
        if (!product) return 'N/A';

        if (product.price_min !== undefined && product.price_min !== null &&
            product.price_max !== undefined && product.price_max !== null) {
            const priceMin = parseFloat(product.price_min);
            const priceMax = parseFloat(product.price_max);

            if (!isNaN(priceMin) && !isNaN(priceMax)) {
                if (priceMin === priceMax) {
                    return `₱${priceMin.toFixed(2)}`;
                }
                return `₱${priceMin.toFixed(2)} - ₱${priceMax.toFixed(2)}`;
            }
        }

        if (product.price !== undefined && product.price !== null) {
            const price = parseFloat(product.price);
            if (!isNaN(price)) {
                return `₱${price.toFixed(2)}`;
            }
        }

        return 'N/A';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Products Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
                    <CardDescription>Your best performing products by views</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? (
                            topProducts.map((product: any, index: number) => (
                                <div key={index} className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                        {getProductImage(product) ? (
                                            <Image
                                                src={getProductImage(product) || '/placeholder-image.jpg'}
                                                alt={product?.name || 'Product image'}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Package size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{product?.name || 'Unnamed Product'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}>
                                                {product?.category || 'Uncategorized'}
                                            </Badge>
                                            <span className="text-xs" style={{ color: COLORS.gray }}>
                                                {formatPrice(product)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Eye size={14} style={{ color: COLORS.gray }} />
                                                <span className="text-xs font-medium">{product?.views || 0}</span>
                                            </div>
                                            {renderRatingStars(product?.average_rating || 0)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm" style={{ color: COLORS.gray }}>No product data available</p>
                                <p className="text-xs text-gray-500">Add products to see them here</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Link href="/store-user/products" className="w-full">
                        <Button variant="outline" size="sm" className="w-full" style={{ borderColor: COLORS.lightgray, color: COLORS.accent }}>
                            View All Products
                        </Button>
                    </Link>
                </CardFooter>
            </Card>

            {/* Most Rated Products Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Most Rated Products</CardTitle>
                    <CardDescription>Your products with the most reviews</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mostRatedProducts.length > 0 ? (
                            mostRatedProducts.map((product: any, index: number) => (
                                <div key={index} className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                        {getProductImage(product) ? (
                                            <Image
                                                src={getProductImage(product) || '/placeholder-image.jpg'}
                                                alt={product?.name || 'Product image'}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Package size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{product?.name || 'Unnamed Product'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}>
                                                {product?.category || 'Uncategorized'}
                                            </Badge>
                                            <span className="text-xs" style={{ color: COLORS.gray }}>
                                                {formatPrice(product)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Star size={14} style={{ color: COLORS.secondary }} />
                                                <span className="text-xs font-medium">{product?.total_reviews || 0} reviews</span>
                                            </div>
                                            {renderRatingStars(product?.average_rating || 0)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm" style={{ color: COLORS.gray }}>No product data available</p>
                                <p className="text-xs text-gray-500">Add products to see them here</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Link href="/store-user/products" className="w-full">
                        <Button variant="outline" size="sm" className="w-full" style={{ borderColor: COLORS.lightgray, color: COLORS.accent }}>
                            View All Products
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}