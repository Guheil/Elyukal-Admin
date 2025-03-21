// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";

interface User {
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
            const token = localStorage.getItem("access_token");
            if (token) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.profile);
                    } else {
                        localStorage.removeItem("access_token");
                    }
                } catch (error) {
                    console.error("Profile fetch error:", error);
                    localStorage.removeItem("access_token");
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Login failed");
            }
            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            setUser(data.user);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
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