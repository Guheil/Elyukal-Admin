import React from 'react';
import { useEffect } from 'react';
import { useState } from'react';
import { BASE_URL } from '@/config';
import { StatsCard } from './StatsCard'; // Import the component
import { Package, Tag, MapPin, Star } from 'lucide-react';
import { COLORS } from '../../constants/colors';

interface StatsSectionProps {
    analyticsData: any;
}

export default function StatsSection({ analyticsData }: StatsSectionProps) {
    const [totalProducts, setTotalProducts] = useState<number>(0);
    
    useEffect(() => {
        // Fetch total number of products on component mount
        const fetchTotalProducts = async () => {
            try {
                const response = await fetch(`${BASE_URL}/get_total_number_of_products`);
                const data = await response.json();
                setTotalProducts(data.total_products);
            } catch (error) {
                console.error('Error fetching total products:', error);
            }
        };

        fetchTotalProducts();
    }, []);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Products"
                value={totalProducts.toLocaleString()}
                description="Available in the marketplace"
                icon={<Package />}
                color={COLORS.primary}
            />
            <StatsCard
                title="Product Categories"
                value={analyticsData.totalCategories.toString()}
                description="Diverse product offerings"
                icon={<Tag />}
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
                title="Product Reviews"
                value={analyticsData.totalReviews.toString()}
                description={`${analyticsData.averageRating} average rating`}
                icon={<Star />}
                color={COLORS.gradient.middle}
            />
        </div>
    );
}