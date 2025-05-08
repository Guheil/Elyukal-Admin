'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../dashboard/components/Sidebar';
import Header from '../../dashboard/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Download,
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Clock,
    Building,
    AlertTriangle,
    ShieldCheck,
    AlertCircle,
    Eye
} from 'lucide-react';

interface ApplicationDetails {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    business_permit: string;
    valid_id: string;
    dti_registration?: string;
}

export default function ApplicationDetailsPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [application, setApplication] = useState<ApplicationDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'accepted' | 'rejected' | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [documentErrors, setDocumentErrors] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchApplicationDetails();
    }, []);

    const fetchApplicationDetails = async () => {
        try {
            setIsLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/seller-applications/${params.id}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch application details');
            }

            const data = await response.json();
            setApplication(data);
        } catch (error) {
            console.error('Error fetching application details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = (status: 'accepted' | 'rejected') => {
        if (!params.id) {
            toast.error('Invalid application ID');
            return;
        }
        setActionType(status);
        setIsConfirmModalOpen(true);
    };

    const confirmStatusUpdate = async () => {
        if (!actionType) return;

        try {
            setIsUpdatingStatus(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            console.log(`Sending status update request to ${apiUrl}/seller-applications/${params.id}/status`);
            console.log(`Request body:`, { status: actionType });

            const response = await fetch(`${apiUrl}/seller-applications/${params.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: actionType }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to update application status: ${response.status} ${response.statusText}`);
            }

            // Parse the response
            const responseText = await response.text();
            console.log('Response text:', responseText);

            let result;
            try {
                result = JSON.parse(responseText);
                console.log('Parsed response:', result);
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                throw new Error('Invalid response format from server');
            }

            // Show success toast notification
            const actionText = actionType === 'accepted' ? 'accepted' : 'rejected';

            // Force toast to display regardless of email status
            toast.success(`Application successfully ${actionText}!`, {
                duration: 5000,
                position: 'top-center',
            });

            // Add additional toast about email status
            if (result && result.email_notification_sent === true) {
                setTimeout(() => {
                    toast.success(`Email notification sent to applicant.`, {
                        duration: 4000,
                        position: 'top-center',
                    });
                }, 500);
            } else {
                setTimeout(() => {
                    toast.error(`Email notification could not be sent to applicant.`, {
                        duration: 4000,
                        position: 'top-center',
                    });
                }, 500);
            }

            // Refresh the application details
            await fetchApplicationDetails();

            // Close modal and reset state
            setIsConfirmModalOpen(false);
            setActionType(null);
        } catch (error) {
            console.error('Error updating application status:', error);
            toast.error(`Failed to update application status: ${error instanceof Error ? error.message : 'Unknown error'}`, {
                duration: 5000,
                position: 'top-center',
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return { backgroundColor: COLORS.warning, color: 'white' };
            case 'accepted':
                return { backgroundColor: COLORS.success, color: 'white' };
            case 'rejected':
                return { backgroundColor: COLORS.error, color: 'white' };
            default:
                return { backgroundColor: COLORS.primary, color: 'white' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock size={18} />;
            case 'accepted':
                return <CheckCircle size={18} />;
            case 'rejected':
                return <XCircle size={18} />;
            default:
                return null;
        }
    };

    const getConfirmationData = () => {
        if (!actionType) return { title: '', description: '', confirmLabel: '', icon: null };

        if (actionType === 'accepted') {
            return {
                title: 'Confirm Approval',
                description: 'Are you sure you want to approve this seller application? An email notification will be sent to the applicant, and they will be granted access to the platform.',
                confirmLabel: isUpdatingStatus ? 'Processing...' : 'Approve',
                icon: <CheckCircle className="h-6 w-6 text-green-500" />
            };
        } else {
            return {
                title: 'Confirm Rejection',
                description: 'Are you sure you want to reject this seller application? An email notification will be sent to inform the applicant of the rejection.',
                confirmLabel: isUpdatingStatus ? 'Processing...' : 'Reject',
                icon: <AlertTriangle className="h-6 w-6 text-red-500" />
            };
        }
    };

    const formattedDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleImageError = (documentKey: string) => {
        setDocumentErrors((prev) => ({ ...prev, [documentKey]: true }));
    };

    const renderDocumentPreview = (url: string, documentKey: string) => {
        if (!url) {
            return (
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText size={48} style={{ color: `${COLORS.gray}80` }} />
                    <span className="absolute text-sm text-gray-500">No document available</span>
                </div>
            );
        }

        if (documentErrors[documentKey]) {
            return (
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText size={48} style={{ color: `${COLORS.gray}80` }} />
                    <span className="absolute text-sm text-red-500">Failed to load document</span>
                </div>
            );
        }

        const isPDF = url.toLowerCase().endsWith('.pdf');

        return (
            <div
                className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handleDocumentOpen(url)}
            >
                {isPDF ? (
                    <div className="h-full bg-gray-100 flex flex-col items-center justify-center">
                        <FileText size={48} style={{ color: `${COLORS.gray}80` }} />
                        <span className="mt-2 text-sm text-gray-500">PDF Document</span>
                        <span className="mt-1 text-xs text-gray-400">Click to view</span>
                    </div>
                ) : (
                    <img
                        src={url}
                        alt={documentKey}
                        className="w-full h-full object-contain"
                        onError={() => handleImageError(documentKey)}
                    />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                    <Eye size={24} className="text-white" />
                </div>
            </div>
        );
    };

    const handleDocumentOpen = (url: string) => {
        if (!url) return;

        // Clean and encode the URL properly
        const cleanUrl = url.trim();
        const encodedUrl = encodeURIComponent(cleanUrl);
        router.push(`/document-viewer/${encodedUrl}`);
    };

    const renderLoadingState = () => (
        <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-t-4 border-primary rounded-full animate-spin"
                    style={{ borderTopColor: COLORS.primary, borderColor: COLORS.lightgray }}></div>
                <p className="mt-4" style={{ color: COLORS.gray }}>Loading application details...</p>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex bg-container" style={{ backgroundColor: COLORS.container }}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={user} />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <Header user={user} notificationsCount={0} />
                    <main className="p-6">
                        {renderLoadingState()}
                    </main>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen flex bg-container" style={{ backgroundColor: COLORS.container }}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={user} />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <Header user={user} notificationsCount={0} />
                    <main className="p-6">
                        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-sm">
                            <AlertTriangle size={48} className="text-red-500 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
                            <p className="text-gray-500 mb-6">The application details you're looking for could not be found.</p>
                            <Button onClick={() => router.push('/seller-applications')}>
                                Return to Applications
                            </Button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-container" style={{ backgroundColor: COLORS.container }}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={user} />
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Header user={user} notificationsCount={0} />
                <main className="p-6">
                    <div className="flex flex-col gap-6">
                        {/* Header with back button */}
                        <div className="flex items-center gap-2 mb-2">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/seller-applications')}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                style={{ color: COLORS.accent }}
                            >
                                <ArrowLeft size={20} />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>
                                    Seller Application Details
                                </h1>
                                <p className="text-sm" style={{ color: COLORS.gray }}>
                                    Review detailed information and documents for this seller application
                                </p>
                            </div>
                        </div>

                        {/* Application Status Card */}
                        <Card className="border-none shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div className="h-1 w-full" style={{ backgroundColor: getStatusBadgeStyle(application.status).backgroundColor }}></div>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-full transition-all duration-300"
                                            style={{ backgroundColor: `${getStatusBadgeStyle(application.status).backgroundColor}20` }}>
                                            {getStatusIcon(application.status)}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold" style={{ fontFamily: FONTS.semibold }}>
                                                {`${application.first_name} ${application.last_name}`}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className="transition-all duration-300"
                                                    style={getStatusBadgeStyle(application.status)}>
                                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                </Badge>
                                                <span className="text-xs" style={{ color: COLORS.gray }}>
                                                    Submitted {formattedDate(application.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {application.status === 'pending' && (
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <Button
                                                className="flex-1 md:flex-none items-center justify-center gap-2 transition-all duration-300 hover:shadow-md"
                                                onClick={() => handleStatusUpdate('accepted')}
                                                style={{ backgroundColor: COLORS.success }}
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1 md:flex-none items-center justify-center gap-2 transition-all duration-300 hover:shadow-md"
                                                onClick={() => handleStatusUpdate('rejected')}
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs Navigation */}
                        <Card className="border-none shadow-md overflow-hidden">
                            <Tabs
                                defaultValue="profile"
                                className="w-full"
                                value={activeTab}
                                onValueChange={setActiveTab}
                            >
                                <TabsList className="bg-white w-full justify-start rounded-none p-0 border-b border-gray-100">
                                    <TabsTrigger
                                        value="profile"
                                        className="py-4 px-8 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none transition-all duration-300"
                                        style={{
                                            color: activeTab === 'profile' ? COLORS.primary : COLORS.gray,
                                            fontFamily: FONTS.semibold,
                                            borderColor: COLORS.primary,
                                            fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
                                        }}
                                    >
                                        <User size={18} className="mr-2" />
                                        Profile Information
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="documents"
                                        className="py-4 px-8 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none transition-all duration-300"
                                        style={{
                                            color: activeTab === 'documents' ? COLORS.primary : COLORS.gray,
                                            fontFamily: FONTS.semibold,
                                            borderColor: COLORS.primary,
                                            fontWeight: activeTab === 'documents' ? 'bold' : 'normal'
                                        }}
                                    >
                                        <FileText size={18} className="mr-2" />
                                        Documents
                                    </TabsTrigger>
                                </TabsList>

                                {/* Content Container with Animation */}
                                <div className="p-6 bg-white transition-all duration-500 ease-in-out">
                                    {/* Profile Tab Content */}
                                    <TabsContent
                                        value="profile"
                                        className="mt-0 transition-opacity duration-500 ease-in-out"
                                        style={{
                                            opacity: activeTab === 'profile' ? 1 : 0,
                                            height: activeTab === 'profile' ? 'auto' : '0',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Personal Information */}
                                            <Card className="border-none shadow-md md:col-span-2 transition-all duration-300 hover:shadow-lg">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <div className="p-2 rounded-full bg-blue-100">
                                                            <User size={20} style={{ color: COLORS.primary }} />
                                                        </div>
                                                        <h3 className="text-lg font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                            Personal Information
                                                        </h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
                                                            <label className="text-xs block mb-1" style={{ color: COLORS.gray }}>First Name</label>
                                                            <p className="font-medium text-lg" style={{ color: COLORS.accent }}>
                                                                {application.first_name}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
                                                            <label className="text-xs block mb-1" style={{ color: COLORS.gray }}>Last Name</label>
                                                            <p className="font-medium text-lg" style={{ color: COLORS.accent }}>
                                                                {application.last_name}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
                                                            <label className="text-xs block mb-1" style={{ color: COLORS.gray }}>Email Address</label>
                                                            <div className="flex items-center gap-2">
                                                                <Mail size={16} style={{ color: COLORS.gray }} />
                                                                <p className="font-medium">{application.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
                                                            <label className="text-xs block mb-1" style={{ color: COLORS.gray }}>Phone Number</label>
                                                            <div className="flex items-center gap-2">
                                                                <Phone size={16} style={{ color: COLORS.gray }} />
                                                                <p className="font-medium">{application.phone_number || 'Not provided'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Application Timeline */}
                                            <Card className="border-none shadow-md h-fit transition-all duration-300 hover:shadow-lg">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <div className="p-2 rounded-full bg-blue-100">
                                                            <Clock size={20} style={{ color: COLORS.primary }} />
                                                        </div>
                                                        <h3 className="text-lg font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                            Application Timeline
                                                        </h3>
                                                    </div>
                                                    <div className="relative pl-6 border-l-2 border-dashed" style={{ borderColor: `${COLORS.primary}40` }}>
                                                        <div className="mb-6 relative">
                                                            <div className="absolute -left-[25px] p-1 rounded-full bg-white shadow-md"
                                                                style={{ borderColor: COLORS.primary }}>
                                                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: COLORS.primary }}></div>
                                                            </div>
                                                            <h4 className="text-sm font-medium" style={{ color: COLORS.accent }}>Application Submitted</h4>
                                                            <p className="text-xs" style={{ color: COLORS.gray }}>{formattedDate(application.created_at)}</p>
                                                        </div>

                                                        {application.status !== 'pending' && (
                                                            <div className="relative">
                                                                <div className="absolute -left-[25px] p-1 rounded-full bg-white shadow-md"
                                                                    style={{
                                                                        borderColor: application.status === 'accepted' ? COLORS.success : COLORS.error
                                                                    }}>
                                                                    <div className="h-4 w-4 rounded-full" style={{
                                                                        backgroundColor: application.status === 'accepted' ? COLORS.success : COLORS.error
                                                                    }}></div>
                                                                </div>
                                                                <h4 className="text-sm font-medium" style={{ color: COLORS.accent }}>
                                                                    Application {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                                </h4>
                                                                <p className="text-xs" style={{ color: COLORS.gray }}>
                                                                    Recently updated
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Application Status Summary */}
                                            <Card className="border-none shadow-md md:col-span-3 mt-2 transition-all duration-300 hover:shadow-lg">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="p-2 rounded-full bg-blue-100">
                                                            <AlertCircle size={20} style={{ color: COLORS.primary }} />
                                                        </div>
                                                        <h3 className="text-lg font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                            Application Status
                                                        </h3>
                                                    </div>

                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                            <div className="mb-4 md:mb-0">
                                                                <h4 className="font-medium mb-1">Current Status</h4>
                                                                <div className="flex items-center">
                                                                    <Badge
                                                                        className="mr-2"
                                                                        style={getStatusBadgeStyle(application.status)}
                                                                    >
                                                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                                    </Badge>
                                                                    <span className="text-sm" style={{ color: COLORS.gray }}>
                                                                        {application.status === 'pending' ? 'Awaiting review' :
                                                                            application.status === 'accepted' ? 'Seller account activated' :
                                                                                'Application declined'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {application.status === 'pending' && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        className="items-center justify-center gap-2 transition-all duration-300"
                                                                        onClick={() => handleStatusUpdate('accepted')}
                                                                        style={{ backgroundColor: COLORS.success }}
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        className="items-center justify-center gap-2 transition-all duration-300"
                                                                        onClick={() => handleStatusUpdate('rejected')}
                                                                    >
                                                                        <XCircle size={16} />
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* Documents Tab Content */}
                                    <TabsContent
                                        value="documents"
                                        className="mt-0 transition-opacity duration-500 ease-in-out"
                                        style={{
                                            opacity: activeTab === 'documents' ? 1 : 0,
                                            height: activeTab === 'documents' ? 'auto' : '0',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Document Overview */}
                                        <Card className="border-none shadow-md mb-6 transition-all duration-300 hover:shadow-lg">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-2 rounded-full bg-blue-100">
                                                        <FileText size={20} style={{ color: COLORS.primary }} />
                                                    </div>
                                                    <h3 className="text-lg font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                        Submitted Documents Overview
                                                    </h3>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                    <p className="text-sm" style={{ color: COLORS.gray }}>
                                                        The applicant has submitted the following documents for verification. Please review each document
                                                        carefully before making a decision on this application.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                                        <CheckCircle size={18} style={{ color: COLORS.success }} />
                                                        <span className="text-sm font-medium">Business Permit</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                                        <CheckCircle size={18} style={{ color: COLORS.success }} />
                                                        <span className="text-sm font-medium">Valid ID</span>
                                                    </div>
                                                    {application.dti_registration ? (
                                                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                                            <CheckCircle size={18} style={{ color: COLORS.success }} />
                                                            <span className="text-sm font-medium">DTI Registration</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                                                            <AlertCircle size={18} style={{ color: COLORS.gray }} />
                                                            <span className="text-sm font-medium text-gray-500">DTI Registration (Not provided)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Business Permit */}
                                            <Card className="border-none shadow-md transition-all duration-300 hover:shadow-lg group">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 rounded-full bg-blue-100">
                                                                <Building size={18} style={{ color: COLORS.primary }} />
                                                            </div>
                                                            <h3 className="font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                                Business Permit
                                                            </h3>
                                                        </div>
                                                        <Badge style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primary }}>Required</Badge>
                                                    </div>

                                                    {renderDocumentPreview(application.business_permit, 'business_permit')}

                                                    <Button
                                                        className="w-full transition-all duration-300 hover:shadow-md group-hover:translate-y-1 mt-4"
                                                        style={{ backgroundColor: COLORS.primary }}
                                                        onClick={() => handleDocumentOpen(application.business_permit)}
                                                    >
                                                        <Download size={16} className="mr-2" />
                                                        {application.business_permit.toLowerCase().endsWith('.pdf') ? 'View PDF' : 'View/Download'}
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            {/* Valid ID */}
                                            <Card className="border-none shadow-md transition-all duration-300 hover:shadow-lg group">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 rounded-full bg-blue-100">
                                                                <ShieldCheck size={18} style={{ color: COLORS.primary }} />
                                                            </div>
                                                            <h3 className="font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                                Valid ID
                                                            </h3>
                                                        </div>
                                                        <Badge style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primary }}>Required</Badge>
                                                    </div>

                                                    {renderDocumentPreview(application.valid_id, 'valid_id')}

                                                    <Button
                                                        className="w-full transition-all duration-300 hover:shadow-md group-hover:translate-y-1 mt-4"
                                                        style={{ backgroundColor: COLORS.primary }}
                                                        onClick={() => handleDocumentOpen(application.valid_id)}
                                                    >
                                                        <Download size={16} className="mr-2" />
                                                        View/Download Document
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            {/* DTI Registration */}
                                            {application.dti_registration && (
                                                <Card className="border-none shadow-md transition-all duration-300 hover:shadow-lg group">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-full bg-blue-100">
                                                                    <FileText size={18} style={{ color: COLORS.primary }} />
                                                                </div>
                                                                <h3 className="font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                                    DTI Registration
                                                                </h3>
                                                            </div>
                                                            <Badge style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primary }}>Optional</Badge>
                                                        </div>

                                                        {renderDocumentPreview(application.dti_registration, 'dti_registration')}

                                                        <Button
                                                            className="w-full transition-all duration-300 hover:shadow-md group-hover:translate-y-1 mt-4"
                                                            style={{ backgroundColor: COLORS.primary }}
                                                            onClick={() => application.dti_registration && handleDocumentOpen(application.dti_registration)}
                                                        >
                                                            <Eye size={16} className="mr-2" />
                                                            View Document
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>

                                        {/* Document Verification Summary */}
                                        <Card className="border-none shadow-md mt-6 transition-all duration-300 hover:shadow-lg">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-2 rounded-full bg-blue-100">
                                                        <AlertCircle size={20} style={{ color: COLORS.primary }} />
                                                    </div>
                                                    <h3 className="text-lg font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                        Document Verification
                                                    </h3>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                        <div className="mb-4 md:mb-0">
                                                            <h4 className="font-medium mb-1">Status</h4>
                                                            <div className="flex items-center">
                                                                <Badge
                                                                    className="mr-2"
                                                                    style={getStatusBadgeStyle(application.status)}
                                                                >
                                                                    {application.status === 'pending' ? 'Needs Verification' :
                                                                        application.status === 'accepted' ? 'Verified' :
                                                                            'Rejected'}
                                                                </Badge>
                                                                <span className="text-sm" style={{ color: COLORS.gray }}>
                                                                    {application.status === 'pending' ? 'Please review all documents' :
                                                                        application.status === 'accepted' ? 'All documents have been verified' :
                                                                            'Documents did not meet requirements'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {application.status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    className="items-center justify-center gap-2 transition-all duration-300"
                                                                    onClick={() => handleStatusUpdate('accepted')}
                                                                    style={{ backgroundColor: COLORS.success }}
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    className="items-center justify-center gap-2 transition-all duration-300"
                                                                    onClick={() => handleStatusUpdate('rejected')}
                                                                >
                                                                    <XCircle size={16} />
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Confirmation Modal */}
            {actionType && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    title={getConfirmationData().title}
                    description={getConfirmationData().description}
                    confirmLabel={getConfirmationData().confirmLabel}
                    cancelLabel="Cancel"
                    onConfirm={confirmStatusUpdate}
                    type={actionType === 'accepted' ? 'success' : 'error'}
                />
            )}
        </div>
    );
}
