'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logoImage from '../../assets/img/logo.png';
import { ShoppingBag, AlertTriangle, ChevronLeft, Mail, Clock, X, RefreshCcw, HelpCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function SellerRejectedPage() {
    const router = useRouter();
    const [animateBackground, setAnimateBackground] = useState(false);

    useEffect(() => {
        setAnimateBackground(true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.container }}>
            {/* Header with logo */}
            <header className="w-full py-6 px-8 flex items-center justify-between" style={{ backgroundColor: COLORS.white }}>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center shadow-lg">
                        <Image
                            src={logoImage}
                            alt="Produkto Elyu-Kal Logo"
                            width={120}
                            height={120}
                            className="rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-xl font-bold tracking-wider" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>PRODUKTO ELYUKAL</h1>
                </div>

                <Link href="/seller-login">
                    <Button
                        variant="outline"
                        className="rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all hover:shadow"
                        style={{
                            borderColor: COLORS.primary,
                            color: COLORS.primary,
                            fontFamily: FONTS.semibold
                        }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Login
                    </Button>
                </Link>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full mx-auto text-center space-y-6">
                    {/* Status icon */}
                    <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
                        style={{
                            background: 'linear-gradient(135deg, #FF5757, #FF8A8A)',
                            boxShadow: '0 10px 25px rgba(255, 87, 87, 0.3)'
                        }}>
                        <X className="h-10 w-10 text-white" />
                    </div>

                    {/* Status title */}
                    <h1 className="text-3xl md:text-4xl font-bold"
                        style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>
                        Application Declined
                    </h1>

                    {/* Status description */}
                    <p className="text-lg" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                        We're sorry, but your seller application has been declined at this time.
                    </p>

                    {/* Main card */}
                    <Card className="border-0 shadow-xl rounded-xl overflow-hidden transition-all duration-300 mt-6 text-left"
                        style={{
                            backgroundColor: COLORS.white,
                            borderLeft: `4px solid #FF5757`
                        }}>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(255, 87, 87, 0.1)' }}>
                                    <AlertTriangle className="h-6 w-6" style={{ color: '#FF5757' }} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                        Why was my application declined?
                                    </h2>
                                    <p style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                                        Applications may be declined for several reasons, including:
                                    </p>
                                    <ul className="list-disc ml-5 space-y-1" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                                        <li>Incomplete or inaccurate business information</li>
                                        <li>Products that don't align with our platform's categories</li>
                                        <li>Missing required documentation</li>
                                        <li>Inability to verify your business credentials</li>
                                        <li>Violation of our community guidelines or terms of service</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="w-full h-px my-2" style={{ backgroundColor: COLORS.lightgray }}></div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                    <Mail className="h-6 w-6" style={{ color: COLORS.primary }} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                        Check your email
                                    </h2>
                                    <p style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                                        We've sent you an email with more specific details about why your application was declined
                                        and what steps you can take next. Please check your inbox, including spam or junk folders.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full h-px my-2" style={{ backgroundColor: COLORS.lightgray }}></div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                    <RefreshCcw className="h-6 w-6" style={{ color: '#10B981' }} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                        What can I do next?
                                    </h2>
                                    <p style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                                        You may reapply after addressing the concerns outlined in your notification email.
                                        Our team is happy to provide guidance on how to improve your application for future consideration.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        <Button
                            className="font-medium py-6 px-8 rounded-lg text-base w-full sm:w-auto transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-2px] relative overflow-hidden"
                            style={{
                                backgroundColor: COLORS.white,
                                color: COLORS.primary,
                                border: `2px solid ${COLORS.primary}`,
                                fontFamily: FONTS.semibold,
                            }}
                            onClick={() => router.push('/seller-login/apply')}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCcw className="h-5 w-5" />
                                Reapply with Changes
                            </span>
                        </Button>

                        <Button
                            className="font-medium py-6 px-8 rounded-lg text-base w-full sm:w-auto transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-2px] relative overflow-hidden group"
                            style={{
                                background: `linear-gradient(90deg, ${COLORS.gradient.start}, ${COLORS.gradient.middle})`,
                                color: COLORS.white,
                                fontFamily: FONTS.semibold,
                            }}
                            onClick={() => window.location.href = 'mailto:support@produktoelyu-kal.com'}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Contact Support
                                <HelpCircle className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                            </span>
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                                style={{ background: 'linear-gradient(270deg, white, transparent)' }}></span>
                        </Button>
                    </div>

                    {/* Additional help info */}
                    <div className="bg-gray-50 rounded-lg p-4 mt-8 inline-block mx-auto">
                        <p className="text-sm" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                            Need assistance? Contact our support team at{' '}
                            <a
                                href="mailto:support@produktoelyu-kal.com"
                                className="font-medium hover:underline"
                                style={{ color: COLORS.primary }}
                            >
                                support@produktoelyu-kal.com
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-6 px-8 text-center" style={{ backgroundColor: COLORS.white }}>
                <p className="text-sm" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                    © 2025 PRODUKTO ELYU-KAL. All rights reserved.
                </p>
            </footer>
        </div>
    );
}