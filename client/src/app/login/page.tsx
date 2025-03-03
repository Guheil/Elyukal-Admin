'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, MapPin, ShoppingBag, ShieldCheck, Mail, Lock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Enhanced color palette with more vibrant colors
const styles = {
    colors: {
        primary: "#0052D4",
        secondary: "#FFD700",
        gold: "#FFC107", 
        white: "#FFFFFF",
        black: "#000000",
        gray: "#5A6472", 
        lightgray: "#F0F4F8", 
        container: "#EEF2F7", 
        accent: "#1A365D", 
        highlight: "#2196F3", 
        success: "#00C853", 
        gradient: {
            start: "#0052D4",
            middle: "#4364F7",
            end: "#6FB1FC"
        }
    }
};

const FONTS = {
    regular: 'Open Sans, sans-serif',
    bold: 'Open Sans, sans-serif',
    semibold: 'Open Sans, sans-serif',
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
            {/* Left side - Brand panel with gradient background */}
            <div
                className="hidden md:flex flex-col justify-between p-10 text-white relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${styles.colors.gradient.start}, ${styles.colors.gradient.middle}, ${styles.colors.gradient.end})`,
                    boxShadow: '0 10px 30px rgba(0, 82, 212, 0.3)'
                }}
            >
                {/* Background pattern elements for visual interest */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 rounded-full" style={{ background: 'white' }}></div>
                    <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full" style={{ background: 'white' }}></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <ShoppingBag className="h-6 w-6" style={{ color: styles.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-wider" style={{ fontFamily: FONTS.bold }}>PRODUKTO ELYU-KAL</h1>
                    </div>
                </div>

                <div className="space-y-8 relative z-10">
                    <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: FONTS.bold }}>
                        Admin Portal for <span style={{ color: styles.colors.gold }}>PRODUKTO ELYU-KAL</span>
                    </h2>
                    <p className="max-w-md text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular }}>
                        Manage La Union's local products and agri-tourism initiatives with advanced digital tools. Securely oversee product listings, user interactions, and analytics to boost local economic growth.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="p-5 rounded-xl transition-all duration-300 hover:translate-y-[-5px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
                            <div className="font-medium text-lg mb-1" style={{ color: styles.colors.gold, fontFamily: FONTS.semibold }}>Product Management</div>
                            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular }}>Control product listings and AR assets</div>
                        </div>
                        <div className="p-5 rounded-xl transition-all duration-300 hover:translate-y-[-5px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
                            <div className="font-medium text-lg mb-1" style={{ color: styles.colors.gold, fontFamily: FONTS.semibold }}>Analytics</div>
                            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular }}>Track user engagement and sales</div>
                        </div>
                        <div className="p-5 rounded-xl transition-all duration-300 hover:translate-y-[-5px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
                            <div className="font-medium text-lg mb-1" style={{ color: styles.colors.gold, fontFamily: FONTS.semibold }}>Geolocation Hub</div>
                            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular }}>Manage location-based services</div>
                        </div>
                        <div className="p-5 rounded-xl transition-all duration-300 hover:translate-y-[-5px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
                            <div className="font-medium text-lg mb-1" style={{ color: styles.colors.gold, fontFamily: FONTS.semibold }}>Security</div>
                            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular }}>Protect user and product data</div>
                        </div>
                    </div>
                </div>

                <div className="text-sm relative z-10" style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: FONTS.regular }}>
                    © 2025 PRODUKTO ELYU-KAL. All rights reserved.
                </div>
            </div>

            {/* Right side - Login form with enhanced visual appeal */}
            <div className="flex flex-col justify-center p-4 sm:p-10" style={{ backgroundColor: styles.colors.white }}>
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <div className="md:hidden flex items-center justify-center space-x-3 mb-8">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                                background: `linear-gradient(135deg, ${styles.colors.gradient.start}, ${styles.colors.gradient.end})`,
                                boxShadow: '0 4px 10px rgba(0, 82, 212, 0.3)'
                            }}>
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-wider" style={{ color: styles.colors.accent, fontFamily: FONTS.bold }}>PRODUKTO ELYU-KAL</h1>
                        </div>
                        <h2 className="text-3xl font-bold mb-2" style={{ color: styles.colors.accent, fontFamily: FONTS.bold }}>Admin Login</h2>
                        <p style={{ color: styles.colors.gray, fontFamily: FONTS.regular }} className="text-lg">
                            Securely access the admin panel to manage PRODUKTO ELYU-KAL's local products.
                        </p>
                    </div>

                    <Card className="border-0 shadow-xl rounded-xl overflow-hidden" style={{ backgroundColor: styles.colors.white }}>
                        <CardContent className="p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-base mb-1" style={{ color: styles.colors.accent, fontFamily: FONTS.semibold }}>
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 rounded-lg">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: styles.colors.gray }} />
                                                        <Input
                                                            placeholder="admin@produktoelyu-kal.com"
                                                            className="pl-12 py-6 rounded-lg text-base"
                                                            style={{
                                                                backgroundColor: styles.colors.lightgray,
                                                                borderColor: 'transparent',
                                                                color: styles.colors.accent,
                                                                fontFamily: FONTS.regular,
                                                            }}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-sm mt-1" style={{ color: 'red', fontFamily: FONTS.regular }} />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center mb-1">
                                                    <FormLabel className="font-medium text-base" style={{ color: styles.colors.accent, fontFamily: FONTS.semibold }}>
                                                        Password
                                                    </FormLabel>
                                                    <Link
                                                        href="/forgot-password"
                                                        className="text-sm hover:underline"
                                                        style={{ color: styles.colors.primary, fontFamily: FONTS.regular }}
                                                    >
                                                        Forgot Password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 rounded-lg">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: styles.colors.gray }} />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter your admin password"
                                                            className="pl-12 pr-12 py-6 rounded-lg text-base"
                                                            style={{
                                                                backgroundColor: styles.colors.lightgray,
                                                                borderColor: 'transparent',
                                                                color: styles.colors.accent,
                                                                fontFamily: FONTS.regular,
                                                            }}
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3"
                                                            style={{ color: styles.colors.gray }}
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-sm mt-1" style={{ color: 'red', fontFamily: FONTS.regular }} />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full font-medium py-6 rounded-lg text-base mt-4 transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-2px]"
                                        style={{
                                            background: `linear-gradient(90deg, ${styles.colors.gradient.start}, ${styles.colors.gradient.middle})`,
                                            color: styles.colors.white,
                                            fontFamily: FONTS.semibold,
                                        }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Authenticating...' : 'Login to Admin Panel'}
                                    </Button>

                                    <div className="pt-4 flex items-center justify-center gap-3">
                                        <div className="flex-1 h-px" style={{ backgroundColor: styles.colors.lightgray }}></div>
                                        <span className="text-sm" style={{ color: styles.colors.gray, fontFamily: FONTS.regular }}>OR</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: styles.colors.lightgray }}></div>
                                    </div>

                                    <Button
                                        type="button"
                                        className="w-full font-medium py-6 rounded-lg text-base transition-all duration-300 hover:shadow-md"
                                        style={{
                                            backgroundColor: 'white',
                                            color: styles.colors.accent,
                                            border: `2px solid ${styles.colors.gold}`,
                                            fontFamily: FONTS.semibold,
                                        }}
                                    >
                                        <span style={{ color: styles.colors.gold, fontFamily: FONTS.semibold }}>Sign in with SSO</span>
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="text-center" style={{ color: styles.colors.gray, fontFamily: FONTS.regular }}>
                        Need help? Contact <span className="font-medium" style={{ color: styles.colors.primary, fontFamily: FONTS.semibold }}>Support Team</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-4 text-center text-sm" style={{ color: styles.colors.gray, fontFamily: FONTS.regular }}>
                        <ShieldCheck className="h-4 w-4" style={{ color: styles.colors.primary }} />
                        Protected by advanced security protocols. Unauthorized access attempts will be logged.
                    </div>
                </div>
            </div>
        </div>
    );
}