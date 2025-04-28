'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COLORS } from '@/app/constants/colors';
import { FONTS } from '@/app/constants/fonts';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            // Small delay before showing content for smoother animation
            setTimeout(() => {
                setIsVisible(true);
            }, 30);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 150); // Match this with the CSS transition duration

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    const title = type === 'terms' ? 'Terms and Conditions' : 'Privacy Policy';
    const content = type === 'terms' ? (
        <div className="space-y-6">
            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    1. Acceptance of Terms
                </h3>
                <p className="text-sm text-gray-600">
                    By using Produkto Elyukal, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    2. Seller Responsibilities
                </h3>
                <p className="text-sm text-gray-600">
                    Sellers must provide accurate information about their products and business, maintain valid permits, and comply with all applicable local laws and regulations in La Union.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    3. Account Security
                </h3>
                <p className="text-sm text-gray-600">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    4. Termination
                </h3>
                <p className="text-sm text-gray-600">
                    We reserve the right to terminate or suspend your account for violation of these terms or for any other reason at our discretion.
                </p>
            </section>
            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    5. Violations
                </h3>
                <p className="text-sm text-gray-600">
                    Any violations against cybercrime laws and being caught doing any illegal activities through the platform will constitute appropriate punishment and action including but not limited to, suspension, termination, and legal action.
                </p>
            </section>
        </div>
    ) : (
        <div className="space-y-6">
            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    1. Information We Collect
                </h3>
                <p className="text-sm text-gray-600">
                    We collect personal information you provide during registration, including your name, email, phone number, and business documents, to verify your identity and facilitate your seller account.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    2. How We Use Your Information
                </h3>
                <p className="text-sm text-gray-600">
                    Your information is used to process your seller application, communicate with you, and improve our platform's services. We do not sell your personal information to third parties.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    3. Data Security
                </h3>
                <p className="text-sm text-gray-600">
                    We implement reasonable security measures to protect your information. However, no method of transmission over the internet is completely secure.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONTS.semibold, color: COLORS.accent }}>
                    4. Your Rights
                </h3>
                <p className="text-sm text-gray-600">
                    You have the right to access, correct, or delete your personal information. Contact us at support@produktoelyukal.com to exercise these rights.
                </p>
            </section>
        </div>
    );

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{
                backdropFilter: `blur(${isVisible ? '8px' : '0px'})`,
                backgroundColor: `rgba(0, 0, 0, ${isVisible ? 0.5 : 0})`,
                transition: 'backdrop-filter 400ms ease-in-out, background-color 400ms ease-in-out'
            }}
        >
            <Card
                className={`w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col shadow-xl transition-all duration-400 ease-out ${isVisible
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-8'
                    }`}
            >
                <div className="h-2" style={{ background: `linear-gradient(to right, ${COLORS.gradient.start}, ${COLORS.gradient.end})` }} />
                <div className="p-6 flex justify-between items-center border-b">
                    <h2 className="text-xl font-bold" style={{ fontFamily: FONTS.bold, color: COLORS.accent }}>
                        {title}
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200 rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </Button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {content}
                </div>
                <div className="p-6 border-t flex justify-end">
                    <Button
                        onClick={onClose}
                        style={{
                            backgroundColor: COLORS.primary,
                            fontFamily: FONTS.semibold,
                            color: 'white'
                        }}
                        className="px-6 transition-all duration-200 hover:scale-105 hover:shadow-md"
                    >
                        Close
                    </Button>
                </div>
            </Card>
        </div>
    );
};