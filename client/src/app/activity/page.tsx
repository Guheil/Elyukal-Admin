'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { Search, Filter, ArrowUpDown, User as UserIcon, Clock, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { fetchActivities } from '../api/activityService';

interface Activity {
    id: string;
    admin_id: string;
    admin_name: string;
    activity: 'edited' | 'added' | 'deleted';
    object: string;
    created_at: string;
}

// Remove the mock implementation
// const fetchActivities = async (): Promise<Activity[]> => {
//     // This is a mock implementation - replace with actual API call
//     return [
//         // Sample data
//         { id: '1', admin_id: 'a1', admin_name: 'John Doe', activity: 'added', object: 'Product: Bauang Grape', created_at: '2025-03-23T10:00:00Z' },
//         { id: '2', admin_id: 'a2', admin_name: 'Jane Smith', activity: 'edited', object: 'Product: Aringay Bangus', created_at: '2025-03-23T12:00:00Z' },
//     ];
// };

export default function ActivityHistoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const activitiesPerPage = 8;

    useEffect(() => {
        const loadActivities = async () => {
            setLoading(true);
            try {
                const response = await fetchActivities();
                setActivities(response);
            } catch (error) {
                console.error('Error loading activities:', error);
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
    }, []);

    // Filter activities based on search term
    const filteredActivities = activities.filter(activity => {
        return activity.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.object.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Sort activities
    const sortedActivities = [...filteredActivities].sort((a, b) => {
        if (sortBy === 'created_at') {
            return sortOrder === 'asc'
                ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === 'admin_name') {
            return sortOrder === 'asc'
                ? a.admin_name.localeCompare(b.admin_name)
                : b.admin_name.localeCompare(a.admin_name);
        } else if (sortBy === 'object') {
            return sortOrder === 'asc'
                ? a.object.localeCompare(b.object)
                : b.object.localeCompare(a.object);
        }
        return 0;
    });

    // Pagination
    const indexOfLastActivity = currentPage * activitiesPerPage;
    const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
    const currentActivities = sortedActivities.slice(indexOfFirstActivity, indexOfLastActivity);
    const totalPages = Math.ceil(sortedActivities.length / activitiesPerPage);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActivityBadge = (activity: string) => {
        switch (activity) {
            case 'added':
                return <Badge style={{ backgroundColor: COLORS.success }}>Added</Badge>;
            case 'edited':
                return <Badge style={{ backgroundColor: COLORS.primary }}>Edited</Badge>;
            case 'deleted':
                return <Badge style={{ backgroundColor: COLORS.error }}>Deleted</Badge>;
            default:
                return <Badge>{activity}</Badge>;
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
                    className="rounded-full w-10 h-10 p-0"
                    style={{ borderColor: COLORS.lightgray, color: COLORS.gray }}
                >
                    <ChevronLeft size={18} />
                </Button>
                {pages}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-full w-10 h-10 p-0"
                    style={{ borderColor: COLORS.lightgray, color: COLORS.gray }}
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
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>
                                    Activity History
                                </h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>
                                    View and track administrative activities
                                </p>
                            </div>
                        </div>

                        {/* Control Panel */}
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardContent className="p-6">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        placeholder="Search activities..."
                                        className="pl-10 rounded-lg border-gray-200"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activities Table */}
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b" style={{ backgroundColor: COLORS.lightgray }}>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleSort('admin_name')}
                                                    >
                                                        Admin
                                                        <ArrowUpDown size={14} className="text-gray-400" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Activity
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleSort('object')}
                                                    >
                                                        Object
                                                        <ArrowUpDown size={14} className="text-gray-400" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleSort('created_at')}
                                                    >
                                                        Timestamp
                                                        <ArrowUpDown size={14} className="text-gray-400" />
                                                    </button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        Loading activities...
                                                    </td>
                                                </tr>
                                            ) : currentActivities.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-3">
                                                            <div className="rounded-full bg-gray-100 p-3">
                                                                <Activity size={24} className="text-gray-400" />
                                                            </div>
                                                            <h3 className="text-lg font-medium" style={{ color: COLORS.gray }}>
                                                                No activities found
                                                            </h3>
                                                            <p className="text-sm text-gray-500 max-w-md text-center">
                                                                There are no admin activities recorded yet. Activities will appear here when admins add, edit, or delete items.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                currentActivities.map((activity) => (
                                                    <tr key={activity.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <UserIcon size={14} className="text-gray-400" />
                                                                {activity.admin_name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {getActivityBadge(activity.activity)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {activity.object}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={14} className="text-gray-400" />
                                                                {formatDate(activity.created_at)}
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
                        {!loading && currentActivities.length > 0 && renderPagination()}
                    </div>
                </main>
            </div>
        </div>
    );
}