// src/app/api/storeService.ts

/**
 * Service for fetching store data from the API
 */

export interface Store {
    store_id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    rating: number;
    store_image: string | null;
    type: string | null;
    operating_hours: string | null;
    phone: string | null;
}

/**
 * Fetch all stores
 */
export const fetchStores = async (): Promise<Store[]> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_stores`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching stores: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Stores fetch error:', error);
        return [];
    }
};