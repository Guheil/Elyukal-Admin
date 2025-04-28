'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import logoImage from '../../assets/img/logo.png';
import {
    Eye, EyeOff, ArrowLeft, Upload, X, FileText, CheckCircle2, AlertTriangle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    const [animateBackground, setAnimateBackground] = useState(false);
    const [permitFile, setPermitFile] = useState<File | null>(null);
    const [permitPreviewUrl, setPermitPreviewUrl] = useState<string | null>(null);
    
    // Modal state
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalTitle, setModalTitle] = useState('');
    const [modalDescription, setModalDescription] = useState('');

    React.useEffect(() => {
        setAnimateBackground(true);
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

    const handlePermitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // Check if file is PDF or image
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                setPermitFile(file);
                // Only create preview URL for images
                if (file.type.startsWith('image/')) {
                    const previewUrl = URL.createObjectURL(file);
                    setPermitPreviewUrl(previewUrl);
                } else {
                    // For PDF, just set a null preview
                    setPermitPreviewUrl(null);
                }
            } else {
                toast.error('Please upload an image or PDF file');
            }
        }
    };

    const removePermit = () => {
        if (permitPreviewUrl) {
            URL.revokeObjectURL(permitPreviewUrl);
        }
        setPermitFile(null);
        setPermitPreviewUrl(null);
    };

    const onSubmit = async (values: ApplicationFormValues) => {
        if (!permitFile) {
            toast.error('Please upload your business permit');
            return;
        }

        setIsLoading(true);
        try {
            // This would be replaced with actual API call when backend is implemented
            // For now, just simulate a successful submission
            
            // Create FormData object to send files and form data
            const formData = new FormData();
            
            // Add all form fields except confirmPassword
            Object.entries(values).forEach(([key, value]) => {
                if (key !== 'confirmPassword') {
                    formData.append(key, value.toString());
                }
            });

            // Add permit file
            if (permitFile) {
                formData.append('businessPermit', permitFile);
            }

            // Simulate API call delay
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
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2" style={{ backgroundColor: COLORS.container }}>
            {/* Left side - Brand panel with gradient background */}
            <div
                className={`hidden md:flex flex-col justify-between items-center p-12 text-white relative overflow-hidden transition-all duration-1000 ${animateBackground ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    background: `linear-gradient(135deg, ${COLORS.gradient.start}, ${COLORS.gradient.middle}, ${COLORS.gradient.end})`,
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
                        <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center shadow-lg">
                            <Image
                                src={logoImage}
                                alt="Shopping Bag"
                                width={120} 
                                height={120} 
                                className="rounded-full object-cover" 
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-wider" style={{ fontFamily: FONTS.bold }}>PRODUKTO ELYUKAL</h1>
                    </div>

                    <div className="mt-4 ml-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(5px)',
                            color: COLORS.gold,
                            fontFamily: FONTS.semibold
                        }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Seller Application
                    </div>
                </div>

                <div className="space-y-8 relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: FONTS.bold }}>
                        Join Our <span
                            className="relative"
                            style={{
                                color: COLORS.gold,
                                textShadow: '0 0 15px rgba(255, 193, 7, 0.3)'
                            }}>
                            Seller Community
                            <span className="absolute -bottom-1 left-0 w-full h-1 rounded-full" style={{ backgroundColor: COLORS.gold, opacity: 0.7 }}></span>
                        </span>
                    </h2>
                    <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: FONTS.regular, lineHeight: 1.6 }}>
                        Apply to become a seller on our platform and showcase your La Union local products to customers across the region. Fill out the application form to get started.
                    </p>

                    <div className="pt-6 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                                <CheckCircle2 className="h-5 w-5" style={{ color: COLORS.gold }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Simple Application Process</h3>
                                <p className="text-sm text-white text-opacity-80">Complete the form with your details and business permit</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                                <CheckCircle2 className="h-5 w-5" style={{ color: COLORS.gold }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Quick Review</h3>
                                <p className="text-sm text-white text-opacity-80">Our team will review your application promptly</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                                <CheckCircle2 className="h-5 w-5" style={{ color: COLORS.gold }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Start Selling</h3>
                                <p className="text-sm text-white text-opacity-80">Once approved, you can start listing your products</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full relative z-10">
                    <p className="text-sm text-white text-opacity-70 text-center">
                        Already have a seller account? <Link href="/seller-login" className="text-white underline hover:text-gold transition-colors">Sign in here</Link>
                    </p>
                </div>
            </div>

            {/* Right side - Application form */}
            <div className="flex flex-col justify-center p-6 md:p-12 overflow-auto">
                <div className="w-full max-w-md mx-auto">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            className="mb-2 flex items-center gap-1 text-gray-500 hover:text-gray-700"
                            onClick={() => router.push('/seller-login')}
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Button>
                        <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Seller Application</h1>
                        <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Fill out the form below to apply as a seller</p>
                    </div>

                    <Card className="border-none shadow-md">
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel style={{ color: COLORS.gray }}>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter first name" {...field} />
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
                                                    <FormLabel style={{ color: COLORS.gray }}>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter last name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel style={{ color: COLORS.gray }}>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Enter your email" {...field} />
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
                                                <FormLabel style={{ color: COLORS.gray }}>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter phone number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel style={{ color: COLORS.gray }}>Password</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input 
                                                            type={showPassword ? "text" : "password"} 
                                                            placeholder="Create a password" 
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel style={{ color: COLORS.gray }}>Confirm Password</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input 
                                                            type={showConfirmPassword ? "text" : "password"} 
                                                            placeholder="Confirm your password" 
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <Label style={{ color: COLORS.gray }}>Business Permit</Label>
                                        <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
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
                                                            removePermit();
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : permitFile && permitFile.type === 'application/pdf' ? (
                                                <div className="relative flex flex-col items-center">
                                                    <FileText size={48} className="text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500">{permitFile.name}</span>
                                                    <button
                                                        type="button"
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removePermit();
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Upload size={24} className="text-gray-400 mb-2" />
                                                    <p className="text-sm font-medium">Upload Business Permit</p>
                                                    <p className="text-xs text-gray-500 mt-1">Upload image or PDF file</p>
                                                </div>
                                            )}
                                            <input 
                                                id="permit-upload" 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*,application/pdf"
                                                onChange={handlePermitUpload}
                                            />
                                        </div>
                                        {!permitFile && (
                                            <p className="text-xs text-gray-500">Please upload your business permit (required)</p>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <Button 
                                            type="submit" 
                                            className="w-full" 
                                            disabled={isLoading}
                                            style={{
                                                backgroundColor: COLORS.primary,
                                                color: 'white',
                                                fontFamily: FONTS.semibold
                                            }}
                                        >
                                            {isLoading ? 'Submitting...' : 'Submit Application'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <p className="text-sm text-center mt-6" style={{ color: COLORS.gray }}>
                        Already have a seller account? <Link href="/seller-login" className="text-primary hover:underline" style={{ color: COLORS.primary }}>Sign in here</Link>
                    </p>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <FeedbackModal
                    isOpen={showFeedbackModal}
                    onClose={handleModalClose}
                    title={modalTitle}
                    description={modalDescription}
                    type={modalType}
                />
            )}
        </div>
    );
}