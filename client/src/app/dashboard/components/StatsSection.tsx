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
    const [totalCategories, setTotalCategories] = useState<number>(0);
    const [totalStores, setTotalStores] = useState<number>(0);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    
    useEffect(() => {
        // Fetch all stats on component mount
        const fetchStats = async () => {
            try {
                // Fetch total products
                const productsResponse = await fetch(`${BASE_URL}/get_total_number_of_products`);
                const productsData = await productsResponse.json();
                setTotalProducts(productsData.total_products);
                
                // Fetch total categories
                const categoriesResponse = await fetch(`${BASE_URL}/get_total_number_of_categories`);
                const categoriesData = await categoriesResponse.json();
                setTotalCategories(categoriesData.total_categories);
                
                // Fetch total stores (active locations)
                const storesResponse = await fetch(`${BASE_URL}/get_total_number_of_stores`);
                const storesData = await storesResponse.json();
                setTotalStores(storesData.total_stores);
                
                // Fetch total reviews
                const reviewsResponse = await fetch(`${BASE_URL}/get_total_number_of_reviews`);
                const reviewsData = await reviewsResponse.json();
                setTotalReviews(reviewsData.total_reviews);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
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
                value={totalCategories.toLocaleString()}
                description="Diverse product offerings"
                icon={<Tag />}
                color={COLORS.success}
            />
            <StatsCard
                title="Active Locations"
                value={totalStores.toLocaleString()}
                description="Across La Union province"
                icon={<MapPin />}
                color={COLORS.gold}
            />
            <StatsCard
                title="Product Reviews"
                value={totalReviews.toLocaleString()}
                description={`${analyticsData.averageRating} average rating`}
                icon={<Star />}
                color={COLORS.gradient.middle}
            />
        </div>
    );
}