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
                description="Products in your store"
                icon={<Package />}
                color={COLORS.primary}
            />
            <StatsCard
                title="Product Categories"
                value={analyticsData.totalCategories.toLocaleString()}
                description="Diverse product offerings"
                icon={<Tag />}
                color={COLORS.success}
            />
            <StatsCard
                title="Product Views"
                value={analyticsData.productViews.toLocaleString()}
                description="Total product impressions"
                icon={<Eye />}
                color={COLORS.gold}
            />
            <StatsCard
                title="Product Reviews"
                value={analyticsData.totalReviews.toLocaleString()}
                description={`${analyticsData.averageRating} average rating`}
                icon={<Star />}
                color={COLORS.gradient.middle}
            />
        </div>
    );
}