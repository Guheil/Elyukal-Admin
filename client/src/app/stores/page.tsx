'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { Search, Filter, ArrowUpDown, Edit, Trash2, Star, MapPin, Phone, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchStores, Store } from '../api/storeService';

export default function StoresPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedType, setSelectedType] = useState('all');
    const storesPerPage = 8;

    useEffect(() => {
        const loadStores = async () => {
            setLoading(true);
            try {
                const response = await fetchStores();
                if (response && Array.isArray(response)) {
                    setStores(response);
                }
            } catch (error) {
                console.error('Error loading stores:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStores();
    }, []);

    // Filter stores based on search term and type
    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || store.type === selectedType;
        return matchesSearch && matchesType;
    });

    // Sort stores
    const sortedStores = [...filteredStores].sort((a, b) => {
        if (sortBy === 'name') {
            return sortOrder === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (sortBy === 'rating') {
            return sortOrder === 'asc'
                ? a.rating - b.rating
                : b.rating - a.rating;
        }
        return 0;
    });

    // Get current stores for pagination
    const indexOfLastStore = currentPage * storesPerPage;
    const indexOfFirstStore = indexOfLastStore - storesPerPage;
    const currentStores = sortedStores.slice(indexOfFirstStore, indexOfLastStore);
    const totalPages = Math.ceil(sortedStores.length / storesPerPage);

    // Get unique types for filter
    const types = ['all', ...new Set(stores.filter(store => store.type).map(store => store.type || ''))];

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleEdit = (storeId: string) => {
        router.push(`/stores/edit/${storeId}`);
    };

    const handleDelete = async (storeId: string) => {
        if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
            try {
                const { deleteStore } = await import('../api/storeService');
                await deleteStore(storeId);
                // Refresh the stores list
                const response = await fetchStores();
                if (response && Array.isArray(response)) {
                    setStores(response);
                }
            } catch (error) {
                console.error('Error deleting store:', error);
                alert('Error deleting store. Please try again.');
            }
        }
    };

    const renderRatingStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(rating) ? COLORS.accent : 'transparent'}
                        stroke={COLORS.accent}
                        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
                    />
                ))}
                <span className="ml-1 text-sm" style={{ color: COLORS.gray }}>{rating.toFixed(1)}</span>
            </div>
        );
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
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Stores Management</h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Manage and monitor all stores in the marketplace</p>
                            </div>
                            <Button
                                className="self-start md:self-auto flex items-center gap-2 rounded-md transition-all duration-200 hover:shadow-lg"
                                style={{
                                    background: `linear-gradient(to right, ${COLORS.gradient.start}, ${COLORS.gradient.middle})`,
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                                onClick={() => router.push('/stores/add')}
                            >
                                <Plus size={18} />
                                Add New Store
                            </Button>
                        </div>

                        {/* Control Panel */}
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <Input
                                            placeholder="Search stores..."
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
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                            >
                                                {types.map((type) => (
                                                    <option key={type} value={type || ''}>
                                                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </option>
                                                ))}
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
                                                <option value="rating-asc">Rating (Low to High)</option>
                                                <option value="rating-desc">Rating (High to Low)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stores Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-t-4 border-primary rounded-full animate-spin" style={{ borderTopColor: COLORS.primary, borderColor: COLORS.lightgray }}></div>
                                    <p className="mt-4" style={{ color: COLORS.gray }}>Loading stores...</p>
                                </div>
                            </div>
                        ) : currentStores.length === 0 ? (
                            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                                <p style={{ color: COLORS.gray }}>No stores found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {currentStores.map((store) => (
                                    <Card key={store.store_id} className="flex flex-col h-full border-none shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                        <div className="relative w-full h-60 overflow-hidden group"> {/* Added group class for hover effects */}
                                            {store.store_image ? (
                                                <img
                                                    src={store.store_image}
                                                    alt={store.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <span className="text-gray-400">No Image</span>
                                                </div>
                                            )}
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            ></div>
                                            <Badge
                                                className="absolute top-3 right-3 py-1 px-3 text-xs font-semibold shadow-md"
                                                style={{ backgroundColor: store.type ? COLORS.secondary : COLORS.gray, color: 'black' }}
                                            >
                                                {store.type || 'Unknown'}
                                            </Badge>
                                            <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <div className="flex justify-between gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(store.store_id)}
                                                        className="flex-1 flex items-center justify-center gap-1 bg-white/90 backdrop-blur-sm hover:bg-white"
                                                        style={{ borderColor: 'transparent', color: COLORS.primary }}
                                                    >
                                                        <Edit size={14} />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(store.store_id)}
                                                        className="flex-1 flex items-center justify-center gap-1 bg-white/90 backdrop-blur-sm hover:bg-white"
                                                        style={{ borderColor: 'transparent', color: COLORS.error }}
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="p-5 flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold truncate text-lg" style={{ color: COLORS.accent }}>{store.name}</h3>
                                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md" style={{ backgroundColor: COLORS.lightgray }}>
                                                    <Star size={14} fill={COLORS.gold} stroke={COLORS.gold} />
                                                    <span className="text-sm ml-1 font-medium">{store.rating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="mb-3 px-3 py-1 font-normal text-xs rounded-full" style={{ borderColor: COLORS.highlight, color: COLORS.highlight, backgroundColor: `${COLORS.highlight}10` }}>
                                                {store.type || 'General'}
                                            </Badge>
                                            <p className="text-sm mb-3 line-clamp-2" style={{ color: COLORS.gray }}>
                                                {store.description}
                                            </p>
                                            <div className="space-y-2 mt-2">
                                                {store.phone && (
                                                    <div className="flex items-center text-sm" style={{ color: COLORS.gray }}>
                                                        <Phone size={14} className="mr-2" />
                                                        <span>{store.phone}</span>
                                                    </div>
                                                )}

                                                {store.operating_hours && (
                                                    <div className="flex items-center text-sm" style={{ color: COLORS.gray }}>
                                                        <Clock size={14} className="mr-2" />
                                                        <span className="truncate">{store.operating_hours}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center text-sm" style={{ color: COLORS.gray }}>
                                                    <MapPin size={14} className="mr-2" />
                                                    <span>{store.latitude.toFixed(2)}, {store.longitude.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </CardContent>

                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && currentStores.length > 0 && renderPagination()}
                    </div>
                </main>
            </div>
        </div>
    );
}