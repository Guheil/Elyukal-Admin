'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
    Eye, EyeOff, MapPin, ShoppingBag, ShieldCheck, Mail, Lock,
    ChevronRight, CheckCircle2, Activity, Settings, DollarSign, Users
} from 'lucide-react';

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
        },
        error: "#FF5252"
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
    const [animateBackground, setAnimateBackground] = useState(false);

    // Animation trigger
    useEffect(() => {
        setAnimateBackground(true);
    }, []);

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
                className={`hidden md:flex flex-col justify-between items-center p-12 text-white relative overflow-hidden transition-all duration-1000 ${animateBackground ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    background: `linear-gradient(135deg, ${styles.colors.gradient.start}, ${styles.colors.gradient.middle}, ${styles.colors.gradient.end})`,
                    boxShadow: '0 10px 30px rgba(0, 82, 212, 0.3)'
                }}
            >
                {/* Background pattern elements for visual interest */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-40 h-40 rounded-full opacity-10" style={{ background: 'white' }}></div>
                    <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full opacity-10" style={{ background: 'white' }}></div>
                    <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full opacity-5" style={{ background: 'white' }}></div>

                    {/* Animated dots/circles */}
                    <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full opacity-20 animate-pulse" style={{ background: 'white' }}></div>
                    <div className="absolute top-2/3 left-1/4 w-2 h-2 rounded-full opacity-20 animate-pulse" style={{ background: 'white', animationDelay: '1s' }}></div>
                    <div className="absolute bottom-1/4 right-1/3 w-4 h-4 rounded-full opacity-20 animate-pulse" style={{ background: 'white', animationDelay: '1.5s' }}></div>

                    {/* Decorative lines/patterns */}
                    <div className="absolute top-20 right-20 w-32 h-px opacity-20" style={{ background: 'white', transform: 'rotate(45deg)' }}></div>
                    <div className="absolute bottom-40 left-10 w-24 h-px opacity-20" style={{ background: 'white', transform: 'rotate(-30deg)' }}></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 duration-300">
                            <ShoppingBag className="h-7 w-7" style={{ color: styles.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-wider" style={{ fontFamily: FONTS.bold }}>PRODUKTO ELYU-KAL</h1>
                    </div>

                    <div className="mt-4 ml-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(5px)',
                            color: styles.colors.gold,
                            fontFamily: FONTS.semibold
                        }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Administrator Portal
                    </div>
                </div>

                <div className="space-y-8 relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: FONTS.bold }}>
                        Admin Portal for <span
                            className="relative"
                            style={{
                                color: styles.colors.gold,
                                textShadow: '0 0 15px rgba(255, 193, 7, 0.3)'
                            }}>
                            PRODUKTO ELYU-KAL
                            <span className="absolute -bottom-1 left-0 w-full h-1 rounded-full" style={{ backgroundColor: styles.colors.gold, opacity: 0.7 }}></span>
                        </span>
                    </h2>
                    <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular, lineHeight: 1.6 }}>
                        Manage La Union's local products and agri-tourism initiatives with advanced digital tools. Securely oversee product listings, user interactions, and analytics to boost local economic growth.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-6">
                        <FeatureCard
                            icon={<ShoppingBag className="h-5 w-5" style={{ color: styles.colors.gold }} />}
                            title="Product Management"
                            description="Control product listings and AR assets"
                        />
                        <FeatureCard
                            icon={<Activity className="h-5 w-5" style={{ color: styles.colors.gold }} />}
                            title="Analytics"
                            description="Track user engagement and sales"
                        />
                        <FeatureCard
                            icon={<MapPin className="h-5 w-5" style={{ color: styles.colors.gold }} />}
                            title="Geolocation Hub"
                            description="Manage location-based services"
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-5 w-5" style={{ color: styles.colors.gold }} />}
                            title="Security"
                            description="Protect user and product data"
                        />
                    </div>

                    <div className="flex items-center gap-5 pt-4">
                        <StatusIndicator label="System Status" status="All systems operational" active={true} />
                        <StatusIndicator label="Security" status="Protected" active={true} />
                        <StatusIndicator label="Updates" status="Latest version" active={true} />
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                            {[styles.colors.gold, '#FF6B6B', '#48DBFB', '#1DD1A1'].map((color, index) => (
                                <div key={index} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                                    style={{ backgroundColor: color, zIndex: 4 - index }}>
                                    {['AK', 'LM', 'TS', 'PD'][index]}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular }}>
                            Join <span className="font-semibold">12 admins</span> currently active
                        </p>
                    </div>

                    <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: FONTS.regular }}>
                        © 2025 PRODUKTO ELYU-KAL. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right side - Login form with enhanced visual appeal */}
            <div className="flex flex-col justify-center p-4 sm:p-10 relative" style={{ backgroundColor: styles.colors.white }}>
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute right-10 top-10 w-64 h-64 rounded-full" style={{ background: `radial-gradient(circle, ${styles.colors.gradient.middle}, transparent)` }}></div>
                    <div className="absolute left-10 bottom-10 w-48 h-48 rounded-full" style={{ background: `radial-gradient(circle, ${styles.colors.gradient.start}, transparent)` }}></div>
                </div>

                <div className="mx-auto w-full max-w-md space-y-8 relative">
                    <div className="text-center md:text-left">
                        <div className="md:hidden flex items-center justify-center space-x-3 mb-8">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{
                                background: `linear-gradient(135deg, ${styles.colors.gradient.start}, ${styles.colors.gradient.end})`,
                                boxShadow: '0 4px 10px rgba(0, 82, 212, 0.3)'
                            }}>
                                <ShoppingBag className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-wider" style={{ color: styles.colors.accent, fontFamily: FONTS.bold }}>PRODUKTO ELYU-KAL</h1>
                        </div>
                        <h2 className="text-3xl font-bold mb-2" style={{ color: styles.colors.accent, fontFamily: FONTS.bold }}>Admin Login</h2>
                        <p style={{ color: styles.colors.gray, fontFamily: FONTS.regular }} className="text-lg">
                            Securely access the admin panel to manage La Union's local products.
                        </p>
                    </div>

                    <Card className="border-0 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
                        style={{
                            backgroundColor: styles.colors.white,
                            borderTop: `4px solid ${styles.colors.primary}`
                        }}>
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
                                                    <div className="relative transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 rounded-lg group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors group-focus-within:text-primary"
                                                            style={{ color: styles.colors.gray }} />
                                                        <Input
                                                            placeholder="admin@produktoelyu-kal.com"
                                                            className="pl-12 py-6 rounded-lg text-base border-2 transition-all focus:border-primary"
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
                                                <FormMessage className="text-sm mt-1 flex items-center gap-1" style={{ color: styles.colors.error, fontFamily: FONTS.regular }} />
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
                                                        className="text-sm hover:underline transition-colors hover:text-primary"
                                                        style={{ color: styles.colors.primary, fontFamily: FONTS.regular }}
                                                    >
                                                        Forgot Password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 rounded-lg group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors group-focus-within:text-primary"
                                                            style={{ color: styles.colors.gray }} />
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter your admin password"
                                                            className="pl-12 pr-12 py-6 rounded-lg text-base border-2 transition-all focus:border-primary"
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
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 transition-colors hover:text-primary"
                                                            style={{ color: styles.colors.gray }}
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-sm mt-1 flex items-center gap-1" style={{ color: styles.colors.error, fontFamily: FONTS.regular }} />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Remember me option */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="remember-me"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label
                                            htmlFor="remember-me"
                                            className="text-sm font-medium"
                                            style={{ color: styles.colors.gray, fontFamily: FONTS.regular }}
                                        >
                                            Remember me for 30 days
                                        </label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full font-medium py-6 rounded-lg text-base mt-6 transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-2px] relative overflow-hidden group"
                                        style={{
                                            background: `linear-gradient(90deg, ${styles.colors.gradient.start}, ${styles.colors.gradient.middle})`,
                                            color: styles.colors.white,
                                            fontFamily: FONTS.semibold,
                                        }}
                                        disabled={isLoading}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {isLoading ? 'Authenticating...' : 'Login to Admin Panel'}
                                            <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                        <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                                            style={{ background: 'linear-gradient(270deg, white, transparent)' }}></span>
                                    </Button>

                                    <div className="pt-4 flex items-center justify-center gap-3">
                                        <div className="flex-1 h-px" style={{ backgroundColor: styles.colors.lightgray }}></div>
                                        <span className="text-sm" style={{ color: styles.colors.gray, fontFamily: FONTS.regular }}>OR</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: styles.colors.lightgray }}></div>
                                    </div>

                                    <Button
                                        type="button"
                                        className="w-full font-medium py-6 rounded-lg text-base transition-all duration-300 hover:shadow-md relative overflow-hidden group"
                                        style={{
                                            backgroundColor: 'white',
                                            color: styles.colors.accent,
                                            border: `2px solid ${styles.colors.gold}`,
                                            fontFamily: FONTS.semibold,
                                        }}
                                    >
                                        <span className="relative z-10" style={{ color: styles.colors.gold, fontFamily: FONTS.semibold }}>Sign in with SSO</span>
                                        <span className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                            style={{ background: styles.colors.gold }}></span>
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="mt-6 space-y-4">
                        <div className="text-center" style={{ color: styles.colors.gray, fontFamily: FONTS.regular }}>
                            Need help? Contact <span className="font-medium cursor-pointer hover:underline transition-colors"
                                style={{ color: styles.colors.primary, fontFamily: FONTS.semibold }}>Support Team</span>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-2 text-center text-sm px-8"
                            style={{ color: styles.colors.gray, fontFamily: FONTS.regular }}>
                            <ShieldCheck className="h-4 w-4 flex-shrink-0" style={{ color: styles.colors.primary }} />
                            <span>Protected by advanced security protocols. Unauthorized access attempts will be logged.</span>
                        </div>

                        {/* Latest login indicator */}
                        <div className="text-center text-xs py-2 px-4 rounded-lg mx-auto w-max opacity-80"
                            style={{
                                backgroundColor: styles.colors.lightgray,
                                color: styles.colors.gray,
                                fontFamily: FONTS.regular
                            }}>
                            Last successful login: Today, 09:45 AM from La Union
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div
        className="p-5 rounded-xl transition-all duration-300 hover:translate-y-[-5px] cursor-pointer group"
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
    >
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                {icon}
            </div>
            <div className="font-medium text-lg group-hover:translate-x-1 transition-transform"
                style={{ color: styles.colors.gold, fontFamily: FONTS.semibold }}>
                {title}
            </div>
        </div>
        <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular }}>{description}</div>
    </div>
);

interface StatusIndicatorProps {
    label: string;
    status: string;
    active: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ label, status, active }) => (
    <div className="flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${active ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: active ? styles.colors.gold : 'rgba(255, 255, 255, 0.5)' }}></div>
        <div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: FONTS.regular }}>{label}</div>
            <div className="font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.semibold }}>{status}</div>
        </div>
    </div>
);