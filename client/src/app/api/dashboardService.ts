// src/app/api/dashboardService.ts

/**
 * Service for fetching dashboard statistics from the API
 */
export const fetchDashboardStats = async () => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/dashboard/stats`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // if (!response.ok) {
        //     throw new Error(`Error fetching dashboard stats: ${response.status}`);
        // }

        return await response.json();
    } catch (error) {
        console.error('Dashboard stats fetch error:', error);
        // Return default values in case of error
        return {
            totalProducts: 0,
            totalCategories: 0,
            activeLocations: 0,
            totalReviews: 0,
            averageRating: 0,
            productViews: 0,
            orderConversionRate: 0,
            pendingApproval: 0
        };
    }
};