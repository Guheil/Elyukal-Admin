'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { Search, ArrowUpDown, Edit, Mail, User as UserIcon, Calendar, ChevronLeft, ChevronRight, Ban, AlertTriangle } from 'lucide-react';
import { fetchUsers, User, banUser } from '../api/userService';
import { FeedbackModal } from '@/components/ui/feedback-modal';
import { toast } from 'react-hot-toast';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';

export default function UsersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('first_name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 8;

    // Ban user modal state
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [userToBan, setUserToBan] = useState<User | null>(null);
    const [banReason, setBanReason] = useState('');
    const [isBanning, setIsBanning] = useState(false);

    // Feedback modal state
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const response = await fetchUsers();
                if (response && response.users) {
                    setUsers(response.users);
                }
            } catch (error) {
                console.error('Error loading users:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Sort users
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortBy === 'first_name') {
            return sortOrder === 'asc'
                ? a.first_name.localeCompare(b.first_name)
                : b.first_name.localeCompare(a.first_name);
        } else if (sortBy === 'last_name') {
            return sortOrder === 'asc'
                ? a.last_name.localeCompare(b.last_name)
                : b.last_name.localeCompare(a.last_name);
        } else if (sortBy === 'email') {
            return sortOrder === 'asc'
                ? a.email.localeCompare(b.email)
                : b.email.localeCompare(a.email);
        } else if (sortBy === 'created_at') {
            return sortOrder === 'asc'
                ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
    });

    // Get current users for pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleEdit = (email: string) => {
        router.push(`/users/edit/${encodeURIComponent(email)}`);
    };

    const handleBanClick = (userToBan: User) => {
        setUserToBan(userToBan);
        setBanReason('');
        setIsBanModalOpen(true);
    };

    const handleBanConfirm = async () => {
        if (!userToBan) return;

        try {
            setIsBanning(true);
            const result = await banUser(userToBan.email, banReason);

            // Show success feedback
            setFeedbackType('success');
            setFeedbackMessage(result.message || `User ${userToBan.first_name} ${userToBan.last_name} has been banned successfully.`);

            // Remove the banned user from the list
            setUsers(prevUsers => prevUsers.filter(u => u.email !== userToBan.email));

            // Close the ban modal
            setIsBanModalOpen(false);

            // Show the feedback modal
            setIsFeedbackModalOpen(true);

            // Show toast notification
            toast.success(`User ${userToBan.first_name} ${userToBan.last_name} has been banned.`);
        } catch (error) {
            console.error('Error banning user:', error);

            // Show error feedback
            setFeedbackType('error');
            setFeedbackMessage(error instanceof Error ? error.message : 'An unknown error occurred while banning the user.');

            // Show the feedback modal
            setIsFeedbackModalOpen(true);

            // Show toast notification
            toast.error('Failed to ban user. Please try again.');
        } finally {
            setIsBanning(false);
        }
    };

    const handleBanCancel = () => {
        setIsBanModalOpen(false);
        setUserToBan(null);
        setBanReason('');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Users Management</h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Manage and monitor all users in the system</p>
                            </div>
                            {/* Add User button can be added here if needed */}
                        </div>

                        {/* Control Panel */}
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <Input
                                            placeholder="Search users..."
                                            className="pl-10 rounded-lg border-gray-200 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Users Table */}
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b" style={{ backgroundColor: COLORS.lightgray }}>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleSort('first_name')}
                                                    >
                                                        First Name
                                                        <ArrowUpDown size={14} className="text-gray-400" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleSort('last_name')}
                                                    >
                                                        Last Name
                                                        <ArrowUpDown size={14} className="text-gray-400" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleSort('email')}
                                                    >
                                                        Email
                                                        <ArrowUpDown size={14} className="text-gray-400" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleSort('created_at')}
                                                    >
                                                        Created At
                                                        <ArrowUpDown size={14} className="text-gray-400" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        Loading users...
                                                    </td>
                                                </tr>
                                            ) : currentUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No users found
                                                    </td>
                                                </tr>
                                            ) : (
                                                currentUsers.map((user) => (
                                                    <tr key={user.email} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <UserIcon size={14} className="text-gray-400" />
                                                                {user.first_name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.last_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex items-center gap-2">
                                                                <Mail size={14} className="text-gray-400" />
                                                                {user.email}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} className="text-gray-400" />
                                                                {formatDate(user.created_at)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex items-center gap-1 rounded-md"
                                                                    style={{ borderColor: COLORS.lightgray, color: COLORS.primary }}
                                                                    onClick={() => handleEdit(user.email)}
                                                                >
                                                                    <Edit size={14} />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex items-center gap-1 rounded-md"
                                                                    style={{ borderColor: COLORS.lightgray, color: COLORS.error }}
                                                                    onClick={() => handleBanClick(user)}
                                                                >
                                                                    <Ban size={14} />
                                                                    Ban
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        {!loading && currentUsers.length > 0 && renderPagination()}
                    </div>
                </main>
            </div>

            {/* Custom Ban User Modal */}
            <Modal open={isBanModalOpen} onOpenChange={handleBanCancel}>
                <ModalContent className="sm:max-w-md">
                    <ModalHeader>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6" style={{ color: COLORS.error }} />
                            <ModalTitle
                                style={{
                                    color: COLORS.error,
                                    fontFamily: FONTS.bold
                                }}
                            >
                                Ban User
                            </ModalTitle>
                        </div>
                        <ModalDescription>
                            Are you sure you want to ban <span className="font-semibold">{userToBan?.first_name} {userToBan?.last_name}</span>?
                            This action will prevent the user from accessing the platform.
                        </ModalDescription>
                    </ModalHeader>

                    <div className="p-4 pt-0">
                        <div className="space-y-2">
                            <label htmlFor="banReason" className="block text-sm font-medium text-gray-700">
                                Reason for banning (optional)
                            </label>
                            <Textarea
                                id="banReason"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Enter reason for banning this user..."
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                rows={3}
                            />
                        </div>
                    </div>

                    <ModalFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBanCancel}
                            style={{
                                borderColor: COLORS.lightgray,
                                color: COLORS.gray,
                                fontFamily: FONTS.regular
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBanConfirm}
                            disabled={isBanning}
                            style={{
                                backgroundColor: COLORS.error,
                                color: COLORS.white,
                                fontFamily: FONTS.semibold
                            }}
                        >
                            {isBanning ? 'Banning...' : 'Ban User'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                title={feedbackType === 'success' ? 'Success' : 'Error'}
                description={feedbackMessage}
                type={feedbackType}
            />
        </div>
    );
}