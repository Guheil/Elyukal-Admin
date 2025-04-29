'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { Search, Filter, ArrowUpDown, Eye, CheckCircle, XCircle, Phone, Mail, Calendar, ChevronLeft, ChevronRight, FileCheck, FileText, User } from 'lucide-react';

// Define the type for seller application
interface SellerApplication {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    business_permit_url: string;
    valid_id_url: string;
    dti_registration_url?: string;
}

export default function SellerApplicationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [applications, setApplications] = useState<SellerApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [applicationToAction, setApplicationToAction] = useState<{ id: string, action: 'approved' | 'rejected' } | null>(null);
    const applicationsPerPage = 8;

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/seller-applications`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (applicationId: string, status: 'approved' | 'rejected') => {
        setApplicationToAction({ id: applicationId, action: status });
        setIsConfirmModalOpen(true);
    };

    const confirmStatusUpdate = async () => {
        if (!applicationToAction) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/seller-applications/${applicationToAction.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: applicationToAction.action }),
            });

            if (!response.ok) {
                throw new Error('Failed to update application status');
            }

            // Refresh the applications list
            fetchApplications();
        } catch (error) {
            console.error('Error updating application status:', error);
        } finally {
            setIsConfirmModalOpen(false);
            setApplicationToAction(null);
        }
    };

    const cancelStatusUpdate = () => {
        setIsConfirmModalOpen(false);
        setApplicationToAction(null);
    };

    // Filter applications based on search term and status
    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.phone_number && app.phone_number.includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Sort applications
    const sortedApplications = [...filteredApplications].sort((a, b) => {
        if (sortBy === 'name') {
            const nameA = `${a.first_name} ${a.last_name}`;
            const nameB = `${b.first_name} ${b.last_name}`;
            return sortOrder === 'asc'
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        } else if (sortBy === 'created_at') {
            return sortOrder === 'asc'
                ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
    });

    // Get current applications for pagination
    const indexOfLastApplication = currentPage * applicationsPerPage;
    const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
    const currentApplications = sortedApplications.slice(indexOfFirstApplication, indexOfLastApplication);
    const totalPages = Math.ceil(sortedApplications.length / applicationsPerPage);

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return { backgroundColor: COLORS.warning, color: 'white' };
            case 'approved':
                return { backgroundColor: COLORS.success, color: 'white' };
            case 'rejected':
                return { backgroundColor: COLORS.error, color: 'white' };
            default:
                return { backgroundColor: COLORS.primary, color: 'white' };
        }
    };

    const getConfirmationData = () => {
        if (!applicationToAction) return { title: '', description: '', confirmLabel: '' };

        if (applicationToAction.action === 'approved') {
            return {
                title: 'Confirm Approval',
                description: 'Are you sure you want to approve this seller application? The seller will be notified and granted access to the platform.',
                confirmLabel: 'Approve'
            };
        } else {
            return {
                title: 'Confirm Rejection',
                description: 'Are you sure you want to reject this seller application? The applicant will be notified of the rejection.',
                confirmLabel: 'Reject'
            };
        }
    };

    const renderPagination = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                    className="w-10 h-10 rounded-md"
                    style={{
                        backgroundColor: currentPage === i ? COLORS.primary : 'transparent',
                        color: currentPage === i ? 'white' : COLORS.gray,
                        borderColor: COLORS.lightgray
                    }}
                >
                    {i}
                </Button>
            );
        }

        return (
            <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    style={{
                        borderColor: COLORS.lightgray,
                        color: COLORS.gray,
                        backgroundColor: currentPage === 1 ? COLORS.lightgray : 'transparent'
                    }}
                >
                    <ChevronLeft size={18} />
                </Button>
                {pages}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    style={{
                        borderColor: COLORS.lightgray,
                        color: COLORS.gray,
                        backgroundColor: currentPage === totalPages ? COLORS.lightgray : 'transparent'
                    }}
                >
                    <ChevronRight size={18} />
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex bg-container" style={{ backgroundColor: COLORS.container }}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={user} />
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Header user={user} notificationsCount={0} />
                <main className="p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Seller Applications</h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Review and manage seller applications for your platform</p>
                            </div>
                        </div>

                        {/* Control Panel */}
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <Input
                                            placeholder="Search applications..."
                                            className="pl-10 rounded-lg border-gray-200 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ borderColor: COLORS.lightgray }}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm" style={{ borderLeft: `3px solid ${COLORS.highlight}` }}>
                                            <Filter size={16} style={{ color: COLORS.highlight }} />
                                            <select
                                                className="border-none bg-transparent text-sm focus:outline-none"
                                                style={{ color: COLORS.gray }}
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm" style={{ borderLeft: `3px solid ${COLORS.primary}` }}>
                                            <ArrowUpDown size={16} style={{ color: COLORS.primary }} />
                                            <select
                                                className="border-none bg-transparent text-sm focus:outline-none"
                                                style={{ color: COLORS.gray }}
                                                value={`${sortBy}-${sortOrder}`}
                                                onChange={(e) => {
                                                    const [field, order] = e.target.value.split('-');
                                                    setSortBy(field);
                                                    setSortOrder(order);
                                                }}
                                            >
                                                <option value="name-asc">Name (A-Z)</option>
                                                <option value="name-desc">Name (Z-A)</option>
                                                <option value="created_at-desc">Newest First</option>
                                                <option value="created_at-asc">Oldest First</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Applications Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-t-4 border-primary rounded-full animate-spin" style={{ borderTopColor: COLORS.primary, borderColor: COLORS.lightgray }}></div>
                                    <p className="mt-4" style={{ color: COLORS.gray }}>Loading applications...</p>
                                </div>
                            </div>
                        ) : currentApplications.length === 0 ? (
                            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                                <p style={{ color: COLORS.gray }}>No applications found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {currentApplications.map(application => (
                                    <Card key={application.id} className="flex flex-col h-full border-none shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                        {/* Header with status */}
                                        <div
                                            className="h-2 w-full"
                                            style={{ backgroundColor: getStatusBadgeStyle(application.status).backgroundColor }}
                                        ></div>

                                        {/* Profile section */}
                                        <div className="px-6 pt-6 pb-2 flex items-center border-b border-gray-100">
                                            <div className="bg-gray-100 rounded-full p-3 mr-4">
                                                <User size={28} style={{ color: COLORS.accent }} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                                                    {`${application.first_name} ${application.last_name}`}
                                                </h3>
                                                <Badge
                                                    className="mt-1"
                                                    style={getStatusBadgeStyle(application.status)}
                                                >
                                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardContent className="p-6 flex-grow flex flex-col">
                                            {/* Contact information */}
                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center text-gray-600">
                                                    <Mail className="h-4 w-4 mr-3" />
                                                    <span className="text-sm truncate">{application.email}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Phone className="h-4 w-4 mr-3" />
                                                    <span className="text-sm">{application.phone_number || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="h-4 w-4 mr-3" />
                                                    <span className="text-sm">{new Date(application.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>

                                            {/* Documents section */}
                                            <div className="mt-2 mb-6">
                                                <p className="text-xs mb-2" style={{ color: COLORS.gray }}>Submitted Documents</p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center p-2 rounded-md" style={{ backgroundColor: `${COLORS.primary}10` }}>
                                                        <FileCheck size={16} className="mr-2" style={{ color: COLORS.primary }} />
                                                        <span className="text-xs" style={{ color: COLORS.accent }}>Business Permit</span>
                                                    </div>
                                                    <div className="flex items-center p-2 rounded-md" style={{ backgroundColor: `${COLORS.primary}10` }}>
                                                        <FileCheck size={16} className="mr-2" style={{ color: COLORS.primary }} />
                                                        <span className="text-xs" style={{ color: COLORS.accent }}>Valid ID</span>
                                                    </div>
                                                    {application.dti_registration_url && (
                                                        <div className="flex items-center p-2 rounded-md" style={{ backgroundColor: `${COLORS.primary}10` }}>
                                                            <FileCheck size={16} className="mr-2" style={{ color: COLORS.primary }} />
                                                            <span className="text-xs" style={{ color: COLORS.accent }}>DTI Registration</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-auto space-y-2">
                                                <Button
                                                    variant="outline"
                                                    className="w-full flex items-center justify-center gap-2"
                                                    onClick={() => router.push(`/seller-applications/${application.id}`)}
                                                    style={{ borderColor: COLORS.lightgray, color: COLORS.primary }}
                                                >
                                                    <Eye size={16} />
                                                    View Details
                                                </Button>

                                                {application.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            className="flex-1 flex items-center justify-center gap-2"
                                                            onClick={() => handleStatusUpdate(application.id, 'approved')}
                                                            style={{ backgroundColor: COLORS.success }}
                                                        >
                                                            <CheckCircle size={16} />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            className="flex-1 flex items-center justify-center gap-2"
                                                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                                        >
                                                            <XCircle size={16} />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && sortedApplications.length > 0 && renderPagination()}

                        {/* Confirmation Modal */}
                        {applicationToAction && (
                            <ConfirmationModal
                                isOpen={isConfirmModalOpen}
                                onClose={cancelStatusUpdate}
                                title={getConfirmationData().title}
                                description={getConfirmationData().description}
                                confirmLabel={getConfirmationData().confirmLabel}
                                cancelLabel="Cancel"
                                onConfirm={confirmStatusUpdate}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}