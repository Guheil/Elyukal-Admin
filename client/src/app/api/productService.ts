// src/app/api/productService.ts

/**
 * Service for fetching product data from the API
 */

export interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    price_min: number;
    price_max: number;
    ar_asset_url: string;
    image_urls: string[];
    address: string;
    in_stock: boolean;
    store_id: number;
    stores: {
        name: string;
        store_id: number;
        latitude: number;
        longitude: number;
        store_image: string;
        type: string;
        rating: number;
        town: string;
    };
    average_rating: string;
    total_reviews: number;
}

/**
 * Fetch all products
 */
export const fetchProducts = async () => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_products`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Products fetch error:', error);
        return { products: [] };
    }
};

/**
 * Fetch products by municipality
 */
export const fetchProductsByMunicipality = async (municipalityId: string) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_products_by_municipality/${municipalityId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching products by municipality: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Products by municipality fetch error:', error);
        return { products: [] };
    }
};

/**
 * Fetch popular products
 */
export const fetchPopularProducts = async () => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_popular_products`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching popular products: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Popular products fetch error:', error);
        return { products: [] };
    }
};