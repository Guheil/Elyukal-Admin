import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COLORS } from '../../../constants/colors';
import { Eye, TrendingUp, Star } from 'lucide-react';

interface OverviewTabProps {
    analyticsData: any;
}

export default function OverviewTab({ analyticsData }: OverviewTabProps) {
    // Function to render rating stars
    const renderRatingStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(rating) ? COLORS.secondary : 'transparent'}
                        stroke={COLORS.secondary}
                        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
                    />
                ))}
                <span className="ml-1 text-sm" style={{ color: COLORS.gray }}>{rating.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Products Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
                    <CardDescription>Your best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analyticsData.topProducts && analyticsData.topProducts.length > 0 ? (
                            analyticsData.topProducts.map((product: any, index: number) => (
                                <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-100">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}>
                                                {product.category}
                                            </Badge>
                                            <span className="text-xs" style={{ color: COLORS.gray }}>
                                                {product.price && typeof product.price === 'number'
                                                    ? `$${product.price.toFixed(2)}`
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            <Eye size={14} style={{ color: COLORS.gray }} />
                                            <span className="text-sm font-medium">{product.sales}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <TrendingUp size={14} style={{ color: COLORS.success }} />
                                            <span className="text-xs" style={{ color: COLORS.success }}>
                                                {product.growth}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm" style={{ color: COLORS.gray }}>No product data available</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" style={{ borderColor: COLORS.lightgray, color: COLORS.accent }}>
                        View All Products
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}