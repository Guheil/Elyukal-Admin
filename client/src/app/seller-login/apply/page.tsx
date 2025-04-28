'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import logoImage from '../../assets/img/logo.png';
import heroImage from '../../assets/img/elyu-capitol.jpg'; 
import {
    Eye, EyeOff, ArrowLeft, Upload, X, FileText, CheckCircle2, AlertTriangle
} from 'lucide-react';

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { FeedbackModal } from '@/components/ui/feedback-modal';

// Form validation schema
const applicationFormSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
    phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

export default function SellerApplicationPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // File states
    const [permitFile, setPermitFile] = useState<File | null>(null);
    const [permitPreviewUrl, setPermitPreviewUrl] = useState<string | null>(null);
    const [validIdFile, setValidIdFile] = useState<File | null>(null);
    const [validIdPreviewUrl, setValidIdPreviewUrl] = useState<string | null>(null);
    const [dtiFile, setDtiFile] = useState<File | null>(null);
    const [dtiPreviewUrl, setDtiPreviewUrl] = useState<string | null>(null);

    // Modal state
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalTitle, setModalTitle] = useState('');
    const [modalDescription, setModalDescription] = useState('');

    // Animation states
    const [hasScrolled, setHasScrolled] = useState(false);
    const [showHeroImage, setShowHeroImage] = useState(false);

    // Handle scroll effects
    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        // Animate hero image after component mounts
        const timer = setTimeout(() => {
            setShowHeroImage(true);
        }, 300);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, []);

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
        },
    });

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const maxSizeInMB = 5;
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (file.size > maxSizeInBytes) {
                toast.error(`File size exceeds ${maxSizeInMB}MB limit`);
                return;
            }

            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                setFile(file);
                if (file.type.startsWith('image/')) {
                    const previewUrl = URL.createObjectURL(file);
                    setPreviewUrl(previewUrl);
                } else {
                    setPreviewUrl(null);
                }
            } else {
                toast.error('Please upload an image or PDF file');
            }
        }
    };

    const removeFile = (
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>,
        previewUrl: string | null
    ) => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
    };

    const onSubmit = async (values: ApplicationFormValues) => {
        if (!permitFile) {
            toast.error('Please upload your business permit');
            return;
        }

        if (!validIdFile) {
            toast.error('Please upload your valid ID');
            return;
        }

        setIsLoading(true);
        try {
            // Create FormData object to send files and form data
            const formData = new FormData();

            // Add all form fields except confirmPassword
            Object.entries(values).forEach(([key, value]) => {
                if (key !== 'confirmPassword') {
                    formData.append(key, value.toString());
                }
            });

            // Add files
            if (permitFile) {
                formData.append('businessPermit', permitFile);
            }
            if (validIdFile) {
                formData.append('validId', validIdFile);
            }
            if (dtiFile) {
                formData.append('dtiRegistration', dtiFile);
            }

            // Simulate API call delay (replace with actual API call in production)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            setModalType('success');
            setModalTitle('Application Submitted');
            setModalDescription('Your seller application has been submitted successfully. We will review your application and get back to you soon.');
            setShowFeedbackModal(true);
        } catch (error: any) {
            console.error('Application submission error:', error);

            // Show error message
            setModalType('error');
            setModalTitle('Submission Failed');
            setModalDescription('There was a problem submitting your application. Please try again.');
            setShowFeedbackModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle modal close and redirect if success
    const handleModalClose = () => {
        setShowFeedbackModal(false);
        if (modalType === 'success') {
            router.push('/seller-login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Header with logo and nav */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${hasScrolled ? 'bg-white shadow-md py-2' : 'py-4'}`}>
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Image
                            src={logoImage}
                            alt="Produkto Elyukal"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        <h1 className="text-lg font-bold" style={{ fontFamily: FONTS.bold, color: COLORS.accent }}>
                            PRODUKTO ELYUKAL
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-sm flex items-center gap-1"
                            style={{ color: COLORS.gray }}
                            onClick={() => router.push('/seller-login')}
                        >
                            <ArrowLeft size={14} />
                            Back to Login
                        </Button>
                        <Link href="/seller-login">
                            
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-20">
                {/* Hero section */}
                <section className="relative overflow-hidden">
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: `linear-gradient(135deg, ${COLORS.gradient.start}, ${COLORS.gradient.middle}, ${COLORS.gradient.end})`,
                            opacity: 0.9
                        }}
                    />

                    {/* Decorative shapes */}
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-transparent to-gray-50 z-10" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-white opacity-10" />
                    <div className="absolute top-20 -left-20 w-40 h-40 rounded-full bg-white opacity-5" />

                    <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="md:w-1/2 text-white">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-6"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(5px)',
                                        color: COLORS.gold,
                                        fontFamily: FONTS.semibold
                                    }}>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Seller Application Portal
                                </div>

                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: FONTS.bold }}>
                                    Join Our <span style={{ color: COLORS.gold }}>Seller Community</span> in La Union
                                </h2>

                                <p className="text-lg mb-8 max-w-lg" style={{ fontFamily: FONTS.regular, color: 'rgba(255, 255, 255, 0.9)' }}>
                                    Start selling your local products and reach customers across the region. Complete your application to begin your journey with us.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-start gap-3 bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                                        <CheckCircle2 className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: COLORS.gold }} />
                                        <div>
                                            <h3 className="font-semibold" style={{ fontFamily: FONTS.semibold, color: COLORS.primary }}>Easy Registration</h3>
                                            <p className="text-sm text-white text-opacity-80" style={{ color: COLORS.primary }}>One simple form to start your seller journey</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                                        <CheckCircle2 className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: COLORS.gold }} />
                                        <div>
                                            <h3 className="font-semibold" style={{ fontFamily: FONTS.semibold, color: COLORS.primary }}>Verified Sellers</h3>
                                            <p className="text-sm text-white text-opacity-80" style={{ color: COLORS.primary }}>Join our trusted community of local vendors</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`md:w-1/2 flex justify-center transition-all duration-700 ${showHeroImage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl border border-white border-opacity-20 shadow-xl">
                                    <Image
                                        src={heroImage}
                                        alt="La Union Local Products"
                                        width={500}
                                        height={400}
                                        className="rounded-lg shadow-lg w-full max-w-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Form section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: FONTS.bold, color: COLORS.accent }}>
                                Seller Application Form
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: FONTS.regular }}>
                                Please complete all required fields and upload the necessary documents to verify your business.
                                Our team will review your application within 3-5 business days.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <Card className="border-none shadow-xl overflow-hidden">
                                <div className="h-2" style={{ background: `linear-gradient(to right, ${COLORS.gradient.start}, ${COLORS.gradient.end})` }} />
                                <CardContent className="p-8">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                            {/* Personal Information Section */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 pb-2 border-b" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs text-white" style={{ backgroundColor: COLORS.primary }}>1</span>
                                                    Personal Information
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="firstName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>First Name*</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Enter your first name"
                                                                        className="rounded-md border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="lastName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>Last Name*</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Enter your last name"
                                                                        className="rounded-md border-gray-300"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>Email Address*</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="email"
                                                                        placeholder="Enter your email address"
                                                                        className="rounded-md border-gray-300"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="phoneNumber"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>Phone Number*</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Enter your phone number"
                                                                        className="rounded-md border-gray-300"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Account Security Section */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 pb-2 border-b" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs text-white" style={{ backgroundColor: COLORS.primary }}>2</span>
                                                    Account Security
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>
                                                                    Password*
                                                                </FormLabel>
                                                                <div className="relative">
                                                                    <FormControl>
                                                                        <Input
                                                                            type={showPassword ? "text" : "password"}
                                                                            placeholder="Create a secure password"
                                                                            className="rounded-md border-gray-300 pr-10"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <button
                                                                        type="button"
                                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                    >
                                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                    </button>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1 min-h-[40px]">
                                                                    Must contain at least 8 characters, including uppercase, lowercase, and a number
                                                                </p>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="confirmPassword"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>
                                                                    Confirm Password*
                                                                </FormLabel>
                                                                <div className="relative">
                                                                    <FormControl>
                                                                        <Input
                                                                            type={showConfirmPassword ? "text" : "password"}
                                                                            placeholder="Confirm your password"
                                                                            className="rounded-md border-gray-300 pr-10"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <button
                                                                        type="button"
                                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    >
                                                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                    </button>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1 min-h-[40px]">
                                                                    Must match the password 
                                                                </p>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Document Uploads Section */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 pb-2 border-b" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs text-white" style={{ backgroundColor: COLORS.primary }}>3</span>
                                                    Document Verification
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {/* Business Permit Upload */}
                                                    <div className="space-y-2">
                                                        <Label style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>
                                                            Business Permit*
                                                            <span className="text-xs font-normal ml-2 text-gray-500">(Required)</span>
                                                        </Label>
                                                        <div
                                                            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${permitFile ? 'border-green-500 bg-green-50' : 'border-dashed hover:bg-gray-50'
                                                                }`}
                                                            onClick={() => document.getElementById('permit-upload')?.click()}
                                                        >
                                                            {permitPreviewUrl ? (
                                                                <div className="relative">
                                                                    <Image
                                                                        src={permitPreviewUrl}
                                                                        alt="Business Permit"
                                                                        width={200}
                                                                        height={150}
                                                                        className="mx-auto object-contain max-h-40"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeFile(setPermitFile, setPermitPreviewUrl, permitPreviewUrl);
                                                                        }}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : permitFile && permitFile.type === 'application/pdf' ? (
                                                                <div className="relative flex flex-col items-center">
                                                                    <FileText size={48} className="text-green-500 mb-2" />
                                                                    <span className="text-sm text-gray-600 font-medium">{permitFile.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeFile(setPermitFile, setPermitPreviewUrl, permitPreviewUrl);
                                                                        }}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center py-6">
                                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                                        <Upload size={24} className="text-gray-400" />
                                                                    </div>
                                                                    <p className="text-sm font-medium" style={{ color: COLORS.accent }}>
                                                                        Upload Business Permit
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        PNG, JPG or PDF (max 5MB)
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <input
                                                                id="permit-upload"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*,application/pdf"
                                                                onChange={(e) => handleFileUpload(e, setPermitFile, setPermitPreviewUrl)}
                                                            />
                                                        </div>
                                                        {!permitFile && (
                                                            <p className="text-xs text-gray-500">Municipal business permit is required for verification</p>
                                                        )}
                                                    </div>

                                                    {/* Valid ID Upload */}
                                                    <div className="space-y-2">
                                                        <Label style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>
                                                            Valid ID*
                                                            <span className="text-xs font-normal ml-2 text-gray-500">(Required)</span>
                                                        </Label>
                                                        <div
                                                            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${validIdFile ? 'border-green-500 bg-green-50' : 'border-dashed hover:bg-gray-50'
                                                                }`}
                                                            onClick={() => document.getElementById('valid-id-upload')?.click()}
                                                        >
                                                            {validIdPreviewUrl ? (
                                                                <div className="relative">
                                                                    <Image
                                                                        src={validIdPreviewUrl}
                                                                        alt="Valid ID"
                                                                        width={200}
                                                                        height={150}
                                                                        className="mx-auto object-contain max-h-40"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeFile(setValidIdFile, setValidIdPreviewUrl, validIdPreviewUrl);
                                                                        }}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : validIdFile && validIdFile.type === 'application/pdf' ? (
                                                                <div className="relative flex flex-col items-center">
                                                                    <FileText size={48} className="text-green-500 mb-2" />
                                                                    <span className="text-sm text-gray-600 font-medium">{validIdFile.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeFile(setValidIdFile, setValidIdPreviewUrl, validIdPreviewUrl);
                                                                        }}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center py-6">
                                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                                        <Upload size={24} className="text-gray-400" />
                                                                    </div>
                                                                    <p className="text-sm font-medium" style={{ color: COLORS.accent }}>
                                                                        Upload Valid ID
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Driver's License, Passport, UMID, etc.
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <input
                                                                id="valid-id-upload"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*,application/pdf"
                                                                onChange={(e) => handleFileUpload(e, setValidIdFile, setValidIdPreviewUrl)}
                                                            />
                                                        </div>
                                                        {!validIdFile && (
                                                            <p className="text-xs text-gray-500">Any government-issued ID for identity verification</p>
                                                        )}
                                                    </div>

                                                    {/* DTI Registration Upload (Optional) */}
                                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                                        <Label style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>
                                                            DTI Registration
                                                            <span className="text-xs font-normal ml-2 text-gray-500">(Optional)</span>
                                                        </Label>
                                                        <div
                                                            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${dtiFile ? 'border-green-500 bg-green-50' : 'border-dashed hover:bg-gray-50'
                                                                }`}
                                                            onClick={() => document.getElementById('dti-upload')?.click()}
                                                        >
                                                            {dtiPreviewUrl ? (
                                                                <div className="relative">
                                                                    <Image
                                                                        src={dtiPreviewUrl}
                                                                        alt="DTI Registration"
                                                                        width={200}
                                                                        height={150}
                                                                        className="mx-auto object-contain max-h-40"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeFile(setDtiFile, setDtiPreviewUrl, dtiPreviewUrl);
                                                                        }}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : dtiFile && dtiFile.type === 'application/pdf' ? (
                                                                <div className="relative flex flex-col items-center">
                                                                    <FileText size={48} className="text-green-500 mb-2" />
                                                                    <span className="text-sm text-gray-600 font-medium">{dtiFile.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeFile(setDtiFile, setDtiPreviewUrl, dtiPreviewUrl);
                                                                        }}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center py-6">
                                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                                        <Upload size={24} className="text-gray-400" />
                                                                    </div>
                                                                    <p className="text-sm font-medium" style={{ color: COLORS.accent }}>
                                                                        Upload DTI Registration
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Department of Trade and Industry registration document
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <input
                                                                id="dti-upload"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*,application/pdf"
                                                                onChange={(e) => handleFileUpload(e, setDtiFile, setDtiPreviewUrl)}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-500">DTI registration is optional but recommended</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Terms and Submit Section */}
                                            <div className="pt-6 flex flex-col items-center">
                                                <div className="flex items-start mb-6 max-w-lg mx-auto">
                                                    <div className="flex items-center h-5">
                                                        <input
                                                            id="terms"
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="ml-3 text-sm">
                                                        <label htmlFor="terms" className="text-gray-600">
                                                            I agree to the <Link href="/terms" className="font-medium underline" style={{ color: COLORS.primary }}>Terms and Conditions</Link> and <Link href="/privacy" className="font-medium underline" style={{ color: COLORS.primary }}>Privacy Policy</Link>. I confirm that all information provided is accurate and complete.
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center gap-4">
                                                    <Button
                                                        type="submit"
                                                        className="px-8 py-2 text-white rounded-md shadow-md flex items-center gap-2"
                                                        style={{ backgroundColor: COLORS.primary, fontFamily: FONTS.semibold }}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                                                <span>Processing...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={18} />
                                                                <span>Submit Application</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                    <p className="text-xs text-gray-500 text-center max-w-sm">
                                                        By submitting, you acknowledge that we'll review your application before approval.
                                                        This process may take 3-5 business days.
                                                    </p>
                                                </div>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Application Guide Section */}
                <section className="bg-gray-50 py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: FONTS.bold, color: COLORS.accent }}>
                                Application Guide
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: FONTS.regular }}>
                                Follow these steps to ensure your seller application is approved quickly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                                    <CheckCircle2 size={24} style={{ color: COLORS.primary }} />
                                </div>
                                <h3 className="text-lg font-semibold text-center mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                                    Complete Your Profile
                                </h3>
                                <p className="text-gray-600 text-center text-sm">
                                    Fill out all required fields accurately. This information will be used to verify your identity as a seller.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                                    <Upload size={24} style={{ color: COLORS.primary }} />
                                </div>
                                <h3 className="text-lg font-semibold text-center mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                                    Upload Documents
                                </h3>
                                <p className="text-gray-600 text-center text-sm">
                                    Submit clear copies of your business permit and valid ID. These documents help us verify your business legitimacy.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                                    <AlertTriangle size={24} style={{ color: COLORS.primary }} />
                                </div>
                                <h3 className="text-lg font-semibold text-center mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                                    Await Verification
                                </h3>
                                <p className="text-gray-600 text-center text-sm">
                                    Our team will review your application. You'll receive an email notification once your account is approved.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Image
                                    src={logoImage}
                                    alt="Produkto Elyukal"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                                <h3 className="text-lg font-bold" style={{ fontFamily: FONTS.bold, color: COLORS.gold }}>
                                    PRODUKTO ELYUKAL
                                </h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-6">
                                Connecting local sellers with customers across La Union and beyond.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Facebook</span>
                                    <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Instagram</span>
                                    <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: FONTS.semibold }}>
                                For Sellers
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white">How to Sell</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Seller Guidelines</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Seller FAQ</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Success Stories</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: FONTS.semibold }}>
                                Company
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">News & Press</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: FONTS.semibold }}>
                                Legal
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Legal Notices</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} Produkto Elyukal. All rights reserved.
                        </p>
                        <div className="mt-4 md:mt-0">
                            <p className="text-xs text-gray-500">
                                A platform for La Union's local products and sellers.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={handleModalClose}
                type={modalType}
                title={modalTitle}
                description={modalDescription}
            />
        </div>
    );
}