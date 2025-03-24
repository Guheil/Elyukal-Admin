// src/app/api/reviewService.ts

/**
 * Service for fetching and submitting product reviews
 */

interface ReviewSubmission {
    product_id: number;
    rating: number;
    review_text: string;
}

interface Review {
    id: number;
    user_id: string;
    product_id: number;
    rating: number;
    review_text: string;
    created_at: string;
    full_name: string;
}

/**
 * Submit a new product review
 */
export const submitReview = async (reviewData: ReviewSubmission) => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/reviews`, {
            method: 'POST',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
            throw new Error(`Error submitting review: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Review submission error:', error);
        throw error;
    }
};

/**
 * Fetch reviews for a specific product
 */
export const fetchProductReviews = async (productId: number | string): Promise<Review[]> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/reviews/${productId}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching reviews: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        return [];
    }
};