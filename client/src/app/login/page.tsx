'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Custom color palette to match React Native project
const styles = {
    colors: {
        primary: "#0c58bb",
        secondary: "#FFD700",
        gold: "#EEBC1D",
        white: "#FEFEFE",
        black: "#000000",
        gray: "#727D73",
        lightgray: "#ECEBDE",
        container: "#F1F5F9",
        accent: "#1E293B",
        highlight: "#3498DB",
    }
};

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

export default function AdminLoginPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/auth/login', values);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);

            toast.success('Login successful!');
            router.push('/admin/dashboard');
        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || 'Authentication failed. Please verify your credentials.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2" style={{ backgroundColor: styles.colors.container }}>
            {/* Left side - Brand panel */}
            <div className="hidden md:flex flex-col justify-between p-8 text-white" style={{ backgroundColor: styles.colors.accent }}>
                <div>
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-8 w-8" style={{ color: styles.colors.secondary }} />
                        <h1 className="text-2xl font-bold">AdminPanel</h1>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-3xl font-bold leading-tight">
                        Secure Admin Dashboard
                    </h2>
                    <p className="max-w-md" style={{ color: styles.colors.lightgray }}>
                        Access your administrative controls with enhanced security. Manage your organization's resources efficiently.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 27, 51, 0.6)' }}>
                            <div className="font-medium" style={{ color: styles.colors.gold }}>User Management</div>
                            <div className="text-sm mt-1" style={{ color: styles.colors.lightgray }}>Control access and permissions</div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 27, 51, 0.6)' }}>
                            <div className="font-medium" style={{ color: styles.colors.gold }}>Analytics</div>
                            <div className="text-sm mt-1" style={{ color: styles.colors.lightgray }}>Monitor system performance</div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 27, 51, 0.6)' }}>
                            <div className="font-medium" style={{ color: styles.colors.gold }}>Security</div>
                            <div className="text-sm mt-1" style={{ color: styles.colors.lightgray }}>Advanced protection protocols</div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 27, 51, 0.6)' }}>
                            <div className="font-medium" style={{ color: styles.colors.gold }}>Configuration</div>
                            <div className="text-sm mt-1" style={{ color: styles.colors.lightgray }}>System-wide settings</div>
                        </div>
                    </div>
                </div>

                <div className="text-sm" style={{ color: styles.colors.gray }}>
                    © 2025 AdminPanel. All rights reserved.
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex flex-col justify-center p-4 sm:p-8" style={{ backgroundColor: styles.colors.white }}>
                <div className="mx-auto w-full max-w-md space-y-6">
                    <div className="text-center md:text-left">
                        <div className="md:hidden flex items-center justify-center space-x-2 mb-6">
                            <ShieldCheck className="h-8 w-8" style={{ color: styles.colors.primary }} />
                            <h1 className="text-2xl font-bold" style={{ color: styles.colors.accent }}>AdminPanel</h1>
                        </div>
                        <h2 className="text-2xl font-bold" style={{ color: styles.colors.accent }}>Admin Login</h2>
                        <p style={{ color: styles.colors.gray }} className="mt-2">Enter your credentials to access the control panel</p>
                    </div>

                    <Card className="border-0 shadow-lg" style={{ backgroundColor: styles.colors.white }}>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium" style={{ color: styles.colors.accent }}>
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: styles.colors.gray }} />
                                                        <Input
                                                            placeholder="admin@company.com"
                                                            className="pl-10"
                                                            style={{
                                                                backgroundColor: styles.colors.lightgray,
                                                                borderColor: 'transparent',
                                                                color: styles.colors.accent
                                                            }}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-sm" style={{ color: 'red' }} />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center">
                                                    <FormLabel className="font-medium" style={{ color: styles.colors.accent }}>
                                                        Password
                                                    </FormLabel>
                                                    <Link
                                                        href="/forgot-password"
                                                        className="text-xs hover:underline"
                                                        style={{ color: styles.colors.primary }}
                                                    >
                                                        Forgot Password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: styles.colors.gray }} />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter your password"
                                                            className="pl-10 pr-10"
                                                            style={{
                                                                backgroundColor: styles.colors.lightgray,
                                                                borderColor: 'transparent',
                                                                color: styles.colors.accent
                                                            }}
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3"
                                                            style={{ color: styles.colors.gray }}
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-sm" style={{ color: 'red' }} />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full font-medium py-2.5 rounded-md mt-2"
                                        style={{
                                            backgroundColor: styles.colors.primary,
                                            color: styles.colors.white
                                        }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Authenticating...' : 'Login to Admin Panel'}
                                    </Button>

                                    <div className="pt-4 flex items-center justify-center gap-2">
                                        <div className="flex-1 h-px" style={{ backgroundColor: styles.colors.lightgray }}></div>
                                        <span className="text-xs" style={{ color: styles.colors.gray }}>OR</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: styles.colors.lightgray }}></div>
                                    </div>

                                    <Button
                                        type="button"
                                        className="w-full font-medium py-2.5 rounded-md"
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: styles.colors.accent,
                                            border: `1px solid ${styles.colors.gold}`
                                        }}
                                    >
                                        <span style={{ color: styles.colors.gold }}>Sign in with SSO</span>
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm" style={{ color: styles.colors.gray }}>
                        Need help? Contact <span className="font-medium" style={{ color: styles.colors.primary }}>IT Support</span>
                    </div>

                    <div className="pt-4 text-center text-xs" style={{ color: styles.colors.gray }}>
                        Protected by advanced security protocols. Unauthorized access attempts will be logged.
                    </div>
                </div>
            </div>
        </div>
    );
}