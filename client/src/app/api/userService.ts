// src/app/api/userService.ts

/**
 * Service for fetching user data from the API
 */

export interface User {
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
    updated_at: string;
}

/**
 * Fetch all users
 */
export const fetchUsers = async (): Promise<{ users: User[] }> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_users`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching users: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Users fetch error:', error);
        return { users: [] };
    }
};

/**
 * Fetch a specific user by email
 */
export const fetchUserByEmail = async (email: string): Promise<{ user: User }> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/fetch_user/${email}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching user: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('User fetch error:', error);
        throw error;
    }
};