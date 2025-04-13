/**
 * Service for fetching and managing user data from the API
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
            credentials: 'include',
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
 * Update a user's information
 */
export const updateUser = async (email: string, userData: { first_name: string; last_name: string; email: string }): Promise<{ success: boolean }> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/update_user/${email}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error(`Error updating user: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('User update error:', error);
        throw error;
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

/**
 * Fetch total number of users
 */
export const getTotalNumberOfUsers = async (): Promise<{ total_users: number }> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/get_total_number_of_users`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching total users: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Total users fetch error:', error);
        throw error;
    }
};