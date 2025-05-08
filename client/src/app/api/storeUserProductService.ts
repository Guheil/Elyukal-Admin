// src/app/api/storeUserProductService.ts

/**
 * Service for fetching and managing store user's products from the API
 */

export interface StoreUserProduct {
    id: number;
    name: string;
    description: string;
    category: string;
    price_min: number;
    price_max: number;
    ar_asset_url: string;
    image_urls: string[];
    in_stock: boolean;
    store_id: number;
    average_rating: string;
    total_reviews: number;
    views: number;
    is_archived?: boolean;
}

/**
 * Fetch all products for the current store user
 */
export const fetchStoreUserProducts = async () => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/fetch-products`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching store user products: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store user products fetch error:', error);
        return { products: [] };
    }
};

/**
 * Add a new product for the current store user with images and optional AR asset
 */
export const addStoreUserProduct = async (formData: FormData) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/add-product`, {
            method: 'POST',
            credentials: 'include', // Include cookies for session authentication
            body: formData, // FormData automatically sets the correct Content-Type with boundary
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error adding product: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store user product add error:', error);
        throw error; // Re-throw to handle in the component
    }
};

/**
 * Fetch a product by ID for the current store user
 */
export const fetchStoreUserProductById = async (productId: number) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/fetch-product/${productId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching store user product: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store user product fetch error:', error);
        throw error; // Re-throw to handle in the component
    }
};

/**
 * Update an existing product for the current store user with images and optional AR asset
 */
export const updateStoreUserProduct = async (productId: number, formData: FormData) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/update-product/${productId}`, {
            method: 'PUT',
            credentials: 'include',
            body: formData, // FormData automatically sets the correct Content-Type with boundary
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error updating product: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store user product update error:', error);
        throw error; // Re-throw to handle in the component
    }
};

/**
 * Archive a product by ID for the current store user (soft delete)
 */
export const archiveStoreUserProduct = async (productId: number) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/archive-product/${productId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error archiving product: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store user product archive error:', error);
        throw error; // Re-throw to handle in the component
    }
};

/**
 * Restore an archived product by ID
 */
export const restoreStoreUserProduct = async (productId: number) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/restore-product/${productId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error restoring product: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store user product restore error:', error);
        throw error; // Re-throw to handle in the component
    }
};

/**
 * Fetch archived products for the current store user
 */
export const fetchArchivedStoreUserProducts = async () => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/fetch-archived-products`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching archived products: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Archived products fetch error:', error);
        return { products: [] };
    }
};

/**
 * Permanently delete a product by ID for the current store user
 */
export const deleteStoreUserProduct = async (productId: number) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/store-user/permanently-delete-product/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error deleting product: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Store user product delete error:', error);
        throw error; // Re-throw to handle in the component
    }
};