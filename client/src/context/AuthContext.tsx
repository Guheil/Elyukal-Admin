// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";

interface User {
    status: boolean;
    email: string;
    first_name?: string;
    last_name?: string;
    app_metadata?: Record<string, any>;
    user_metadata?: Record<string, any>;
    aud?: string;
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                // Use credentials to include cookies in the request
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.profile);
                }
            } catch (error) {
                console.error("Profile fetch error:", error);
                // No need to remove access_token as we're using cookies now
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include", // Include cookies in the request
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Login failed");
            }
            // The server doesn't return user data or access token
            // It uses HTTP-only cookies for session management instead
            // We don't need to store anything in localStorage
            
            // Fetch user profile after successful login
            try {
                const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                    credentials: "include", // Include cookies in the request
                });
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    setUser(profileData.profile);
                }
            } catch (profileError) {
                console.error("Profile fetch error after login:", profileError);
                // Continue even if profile fetch fails
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call the logout endpoint to clear the session cookie
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: "GET",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear user state regardless of server response
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export default AuthProvider;