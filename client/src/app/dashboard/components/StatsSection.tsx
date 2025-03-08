import React from 'react';
import { StatsCard } from './StatsCard'; // Import the component
import { Package, Eye, MapPin, Users } from 'lucide-react';
import { COLORS } from '../../constants/colors';

interface StatsSectionProps {
    analyticsData: any;
}

export default function StatsSection({ analyticsData }: StatsSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Products"
                value={analyticsData.totalProducts.toString()}
                description={`${analyticsData.pendingApproval} awaiting approval`}
                icon={<Package />}
                color={COLORS.primary}
            />
            <StatsCard
                title="Monthly Views"
                value={analyticsData.productViews.toLocaleString()}
                description="8.2% increase this month"
                icon={<Eye />}
                color={COLORS.success}
            />
            <StatsCard
                title="Active Locations"
                value={analyticsData.activeLocations.toString()}
                description="Across La Union province"
                icon={<MapPin />}
                color={COLORS.gold}
            />
            <StatsCard
                title="Total Visitors"
                value={analyticsData.visitors.toLocaleString()}
                description="21.8% new visitors"
                icon={<Users />}
                color={COLORS.gradient.middle}
            />
        </div>
    );
}