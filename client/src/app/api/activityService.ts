// src/app/api/activityService.ts

/**
 * Service for fetching admin activity data from the API
 */

export interface Activity {
    id: string;
    admin_id: string;
    admin_name: string;
    activity: 'edited' | 'added' | 'deleted';
    object: string;
    created_at: string;
}

/**
 * Fetch all admin activities
 */
export const fetchActivities = async (): Promise<Activity[]> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_activities`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching activities: ${response.status}`);
        }

        const data = await response.json();
        return data.activities || [];
    } catch (error) {
        console.error('Activities fetch error:', error);
        return [];
    }
};