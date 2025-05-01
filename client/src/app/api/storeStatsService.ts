// src/app/api/storeStatsService.ts

/**
 * Service for fetching store statistics and performance data
 */

export interface StoreStats {
    store_owned: string | null;
    store_details?: any;
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

/**
 * Fetch store statistics for the current store user
 */
export const fetchStoreStats = async (): Promise<StoreStats> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/stats`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching store stats: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store stats fetch error:', error);
        // Return default empty stats object
        return {
            store_owned: null,
            totalProducts: 0,
            totalCategories: 0,
            productViews: 0,
            totalReviews: 0,
            averageRating: 0,
            topProducts: [],
            recentOrders: []
        };
    }
};

/**
 * Fetch store details by store ID
 */
export const fetchStoreDetails = async (storeId: string) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/store/${storeId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching store details: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store details fetch error:', error);
        throw error;
    }
};