import React from 'react';
import { Package, Tag, ShoppingCart, Star, Eye } from 'lucide-react';
import { COLORS } from '../../../constants/colors';
import { StatsCard } from './StatsCard';

interface StatsSectionProps {
    analyticsData: any;
}

export default function StatsSection({ analyticsData }: StatsSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Products"
                value={analyticsData.totalProducts.toLocaleString()}
                description="Total products in your store"
                icon={<Package />}
                color={COLORS.primary}
            />
            <StatsCard
                title="Product Categories"
                value={analyticsData.totalCategories.toLocaleString()}
                description="Unique categories offered"
                icon={<Tag />}
                color={COLORS.success}
            />
            <StatsCard
                title="Total Views"
                value={analyticsData.productViews.toLocaleString()}
                description="Sum of all product views"
                icon={<Eye />}
                color={COLORS.gold}
            />
            <StatsCard
                title="Total Reviews"
                value={analyticsData.totalReviews.toLocaleString()}
                description={`${analyticsData.averageRating} average rating`}
                icon={<Star />}
                color={COLORS.gradient.middle}
            />
        </div>
    );
}