// src/app/api/productService.ts

/**
 * Service for fetching and managing product data from the API
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
 * Add a new product with images and optional AR asset
 */
export const addProduct = async (formData: FormData) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/add_product`, {
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
        console.error('Product add error:', error);
        throw error; // Re-throw to handle in the component
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

/**
 * Fetch a product by ID
 */
export const fetchProductById = async (productId: number) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_product/${productId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching product: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Product fetch error:', error);
        throw error; // Re-throw to handle in the component
    }
};

/**
 * Update an existing product with images and optional AR asset
 */
export const updateProduct = async (productId: number, formData: FormData) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/update_product/${productId}`, {
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
        console.error('Product update error:', error);
        throw error; // Re-throw to handle in the component
    }
};