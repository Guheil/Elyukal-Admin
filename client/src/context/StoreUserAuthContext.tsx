'use client'

import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";

interface StoreUser {
    status: string; // 'accepted', 'pending', 'rejected'
    email: string;
    first_name?: string;
    last_name?: string;
    store_owned?: number; // Foreign key to stores.store_id
    store_name?: string;
    store_id?: number; // For backward compatibility
    phone_number?: string;
    app_metadata?: Record<string, any>;
    user_metadata?: Record<string, any>;
    created_at?: string;
}

interface StoreUserAuthContextType {
    storeUser: StoreUser | null;
    setStoreUser: React.Dispatch<React.SetStateAction<StoreUser | null>>;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; status?: string }>;
    logout: () => void;
    refreshUserData: () => Promise<void>;
}

const StoreUserAuthContext = createContext<StoreUserAuthContextType | null>(null);

interface StoreUserAuthProviderProps {
    children: React.ReactNode;
}

const StoreUserAuthProvider = ({ children }: StoreUserAuthProviderProps) => {
    const [storeUser, setStoreUser] = useState<StoreUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkStoreUser = async () => {
            try {
                // Use credentials to include cookies in the request
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store-user/profile`, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setStoreUser(data.profile);

                    // Handle user status
                    if (data.profile && data.profile.status) {
                        if (data.profile.status === 'pending') {
                            router.push('/seller-login/pending');
                        } else if (data.profile.status === 'rejected') {
                            router.push('/seller-login/rejected');
                        }
                        // If accepted, allow normal navigation
                    }
                }
            } catch (error) {
                console.error("Store user profile fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        checkStoreUser();
    }, [router]);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store-user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include", // Include cookies in the request
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Login failed");
            }

            // Fetch store user profile after successful login
            try {
                const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store-user/profile`, {
                    credentials: "include", // Include cookies in the request
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    setStoreUser(profileData.profile);

                    // Check user status and handle accordingly
                    if (profileData.profile.status === 'accepted') {
                        return { success: true, status: 'accepted' };
                    } else if (profileData.profile.status === 'pending') {
                        router.push('/seller-login/pending');
                        return { success: true, status: 'pending' };
                    } else if (profileData.profile.status === 'rejected') {
                        router.push('/seller-login/rejected');
                        return { success: true, status: 'rejected' };
                    }
                }
                return { success: false };
            } catch (profileError) {
                console.error("Profile fetch error after login:", profileError);
                return { success: false };
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call the logout endpoint to clear the session cookie
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store-user/logout`, {
                method: "GET",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear user state regardless of server response
            setStoreUser(null);
            router.push('/seller-login');
        }
    };

    const refreshUserData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store-user/profile`, {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setStoreUser(data.profile);
                return data.profile;
            }
        } catch (error) {
            console.error("Error refreshing user data:", error);
        }
    };

    return (
        <StoreUserAuthContext.Provider value={{ storeUser, setStoreUser, loading, login, logout, refreshUserData }}>
            {children}
        </StoreUserAuthContext.Provider>
    );
};

export const useStoreUserAuth = () => {
    const context = useContext(StoreUserAuthContext);
    if (!context) throw new Error("useStoreUserAuth must be used within a StoreUserAuthProvider");
    return context;
};

export default StoreUserAuthProvider;