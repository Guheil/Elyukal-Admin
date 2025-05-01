'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logoImage from '../../assets/img/logo.png';
import { ShoppingBag, Clock, ChevronLeft, Mail, CheckCircle2, Phone, RefreshCw, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function SellerPendingPage() {
    const router = useRouter();
    const [animateBackground, setAnimateBackground] = useState(false);
    const [countdown, setCountdown] = useState(72); // Hours remaining for review (example)
    const [progress, setProgress] = useState(40); // Application review progress percentage

    useEffect(() => {
        setAnimateBackground(true);

        // Animation for progress bar
        const timer = setTimeout(() => {
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [progress]);

    // Calculate expected review completion date (3 days from now)
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 3);
    const formattedDate = reviewDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

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
                            background: `linear-gradient(135deg, ${COLORS.gold}, #FFD700)`,
                            boxShadow: '0 10px 25px rgba(255, 193, 7, 0.3)'
                        }}>
                        <Clock className="h-10 w-10 text-white" />
                    </div>

                    {/* Status title */}
                    <h1 className="text-3xl md:text-4xl font-bold"
                        style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>
                        Application Under Review
                    </h1>

                    {/* Status description */}
                    <p className="text-lg" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                        Thank you for applying to become a seller on PRODUKTO ELYU-KAL! Your application is currently being reviewed by our team.
                    </p>

                    {/* Progress bar */}
                    <div className="w-full max-w-lg mx-auto mt-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium" style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>Application Review Progress</span>
                            <span className="text-sm font-medium" style={{ color: COLORS.primary, fontFamily: FONTS.semibold }}>{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                id="progress-bar"
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: '0%',
                                    background: `linear-gradient(90deg, ${COLORS.gradient.start}, ${COLORS.gradient.middle})`
                                }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>Submitted</span>
                            <span className="text-xs" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>Processing</span>
                            <span className="text-xs" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>Final Review</span>
                            <span className="text-xs" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>Approved</span>
                        </div>
                    </div>

                    {/* Main card */}
                    <Card className="border-0 shadow-xl rounded-xl overflow-hidden transition-all duration-300 mt-6 text-left"
                        style={{
                            backgroundColor: COLORS.white,
                            borderLeft: `4px solid ${COLORS.gold}`
                        }}>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full" style={{ backgroundColor: `rgba(255, 193, 7, 0.1)` }}>
                                    <Calendar className="h-6 w-6" style={{ color: COLORS.gold }} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                        Estimated Review Time
                                    </h2>
                                    <p style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                                        Our team is carefully reviewing your application. This process typically takes 3-5 business days.
                                    </p>
                                    <div className="bg-gray-50 p-3 rounded-lg inline-block">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" style={{ color: COLORS.primary }} />
                                            <span className="font-medium" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                Expected completion: {formattedDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px my-2" style={{ backgroundColor: COLORS.lightgray }}></div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                    <Mail className="h-6 w-6" style={{ color: COLORS.primary }} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                        Stay Informed
                                    </h2>
                                    <p style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                                        You'll receive an email notification once your application has been reviewed.
                                        Please ensure you check the email address you provided during registration.
                                    </p>
                                    <div className="text-sm italic" style={{ color: COLORS.primary, fontFamily: FONTS.regular }}>
                                        No action is required from you at this time.
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px my-2" style={{ backgroundColor: COLORS.lightgray }}></div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                    <CheckCircle2 className="h-6 w-6" style={{ color: '#10B981' }} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                        What Happens Next?
                                    </h2>
                                    <p style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                                        Once approved, you'll receive login credentials to access the Seller Portal
                                        where you can start listing your products, set up your store profile, and
                                        begin selling to customers across La Union.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status badges */}
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <div className="bg-gray-50 rounded-full px-5 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.gold }}></div>
                            <span className="text-sm font-medium" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                Review in progress
                            </span>
                        </div>

                        <div className="bg-gray-50 rounded-full px-5 py-2 flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" style={{ color: COLORS.primary, animationDuration: '3s' }} />
                            <span className="text-sm font-medium" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                Documents being verified
                            </span>
                        </div>

                        <div className="bg-gray-50 rounded-full px-5 py-2 flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                Est. wait: {countdown} hours
                            </span>
                        </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-8">
                        <Button
                            className="font-medium py-6 px-8 rounded-lg text-base transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-2px] relative overflow-hidden group"
                            style={{
                                background: `linear-gradient(90deg, ${COLORS.gradient.start}, ${COLORS.gradient.middle})`,
                                color: COLORS.white,
                                fontFamily: FONTS.semibold,
                            }}
                            onClick={() => window.location.href = 'mailto:support@produktoelyu-kal.com'}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Contact Support
                                <Phone className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                            </span>
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                                style={{ background: 'linear-gradient(270deg, white, transparent)' }}></span>
                        </Button>
                    </div>

                    {/* Additional help info */}
                    <div className="bg-gray-50 rounded-lg p-4 mt-6 inline-block mx-auto">
                        <p className="text-sm" style={{ color: COLORS.gray, fontFamily: FONTS.regular }}>
                            Questions about your application? Contact our support team at{' '}
                            <a
                                href="mailto:support@produktoelyukal.com"
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