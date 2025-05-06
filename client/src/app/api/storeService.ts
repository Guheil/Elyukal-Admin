// src/app/api/storeService.ts

/**
 * Service for fetching and managing store data from the API
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

/**
 * Add a new store
 */
export const addStore = async (formData: FormData) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/add_store`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error adding store: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store add error:', error);
        throw error;
    }
};

/**
 * Create a new store for a seller
 */
export const createSellerStore = async (formData: FormData) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/create-store`, {
            method: 'POST',
            credentials: 'include', // Include cookies for session authentication
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error creating store: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store creation error:', error);
        throw error;
    }
};

/**
 * Fetch a store by ID
 */
export const fetchStoreById = async (storeId: string) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_store/${storeId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching store: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store fetch error:', error);
        throw error;
    }
};

/**
 * Update an existing store
 */
export const updateStore = async (storeId: string, formData: FormData) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/update_store/${storeId}`, {
            method: 'PUT',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error updating store: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store update error:', error);
        throw error;
    }
};

/**
 * Delete a store
 */
export const deleteStore = async (storeId: string) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/delete_store/${storeId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error deleting store: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store delete error:', error);
        throw error;
    }
};
 
/**
 * Update a store for a seller (store user)
 */
export const updateUserStore = async (storeId: string, formData: FormData) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/update-store/${storeId}`, {
            method: 'PUT',
            credentials: 'include', // Include cookies for session authentication
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error updating store: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store update error:', error);
        throw error;
    }
};