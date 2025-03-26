'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { Search, Filter, ArrowUpDown, Edit, Trash2, Star, Image, Plus, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { fetchProducts } from '../api/productService';
import { Product } from '../api/productService';
import { ReviewModal } from '@/components/ui/review-modal';

export default function ProductsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const productsPerPage = 8;

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await fetchProducts();
                if (response && response.products) {
                    setProducts(response.products);
                }
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Filter products based on search term and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'name') {
            return sortOrder === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (sortBy === 'price') {
            return sortOrder === 'asc'
                ? a.price_min - b.price_min
                : b.price_min - a.price_min;
        } else if (sortBy === 'rating') {
            return sortOrder === 'asc'
                ? parseFloat(a.average_rating) - parseFloat(b.average_rating)
                : parseFloat(b.average_rating) - parseFloat(a.average_rating);
        }
        return 0;
    });

    // Get current products for pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    // Get unique categories for filter
    const categories = ['all', ...new Set(products.map(product => product.category))];

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleEdit = (productId: number) => {
        router.push(`/products/edit/${productId}`);
    };

    const handleDelete = (productId: number) => {
        setProductToDelete(productId);
        setIsDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
        if (productToDelete) {
            try {
                const { deleteProduct } = await import('../api/productService');
                await deleteProduct(productToDelete);
                // Refresh the products list
                const response = await fetchProducts();
                if (response && response.products) {
                    setProducts(response.products);
                }
                // Close the modal
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error deleting product. Please try again.');
                // Close the modal even on error
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
            }
        }
    };
    
    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    const handleViewReviews = (product: Product) => {
        setSelectedProduct(product);
        setReviewModalOpen(true);
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
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Products Management</h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Manage and monitor all products in the marketplace</p>
                            </div>
                            <Button
                                className="self-start md:self-auto flex items-center gap-2 rounded-md transition-all duration-200 hover:shadow-lg"
                                style={{
                                    background: `linear-gradient(to right, ${COLORS.gradient.start}, ${COLORS.gradient.middle})`,
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                                onClick={() => router.push('/products/add')}
                            >
                                <Plus size={18} />
                                Add New Product
                            </Button>
                        </div>

                        {/* Control Panel */}
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <Input
                                            placeholder="Search products..."
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
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                {categories.map(category => (
                                                    <option key={category} value={category}>
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
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
                                                <option value="price-asc">Price (Low to High)</option>
                                                <option value="price-desc">Price (High to Low)</option>
                                                <option value="rating-asc">Rating (Low to High)</option>
                                                <option value="rating-desc">Rating (High to Low)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-t-4 border-primary rounded-full animate-spin" style={{ borderTopColor: COLORS.primary, borderColor: COLORS.lightgray }}></div>
                                    <p className="mt-4" style={{ color: COLORS.gray }}>Loading products...</p>
                                </div>
                            </div>
                        ) : currentProducts.length === 0 ? (
                            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                                <p style={{ color: COLORS.gray }}>No products found matching your criteria.</p>
                            </div>
                        ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {currentProducts.map(product => (
                                            <Card key={product.id} className="flex flex-col h-full border-none shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                                <div className="relative w-full h-60 overflow-hidden group"> {/* Adjusted height */}
                                                    {product.image_urls && product.image_urls.length > 0 ? (
                                                        <img
                                                            src={product.image_urls[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full bg-gray-100">
                                                            <Image size={48} />
                                                            <p className="text-sm mt-2">No image available</p>
                                                        </div>
                                                    )}
                                                    <div
                                                        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    ></div>
                                                    <Badge
                                                        className="absolute top-3 right-3 py-1 px-3 text-xs font-semibold shadow-md"
                                                        style={{
                                                            backgroundColor: product.in_stock ? COLORS.success : COLORS.error,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                                    </Badge>
                                                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                        <div className="flex justify-between gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(product.id)}
                                                                className="flex-1 flex items-center justify-center gap-1 bg-white/90 backdrop-blur-sm hover:bg-white"
                                                                style={{ borderColor: 'transparent', color: COLORS.primary }}
                                                            >
                                                                <Edit size={14} />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(product.id)}
                                                                className="flex-1 flex items-center justify-center gap-1 bg-white/90 backdrop-blur-sm hover:bg-white"
                                                                style={{ borderColor: 'transparent', color: COLORS.error }}
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <CardContent className="p-5 flex-grow flex flex-col">
                                                    {/* Product info section with fixed height */}
                                                    <div className="flex-grow" style={{ minHeight: '180px' }}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-semibold truncate text-lg" style={{ color: COLORS.accent }}>{product.name}</h3>
                                                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md" style={{ backgroundColor: COLORS.lightgray }}>
                                                                <Star size={14} fill={COLORS.gold} stroke={COLORS.gold} />
                                                                <span className="text-sm ml-1 font-medium">{product.average_rating}</span>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="mb-3 px-3 py-1 font-normal text-xs rounded-full" style={{ borderColor: COLORS.highlight, color: COLORS.highlight, backgroundColor: `${COLORS.highlight}10` }}>
                                                            {product.category}
                                                        </Badge>
                                                        <p className="text-sm mb-3 line-clamp-2" style={{ color: COLORS.gray }}>
                                                            {product.description}
                                                        </p>
                                                        <div className="flex justify-between items-end mt-2">
                                                            <div>
                                                                <p className="text-xs" style={{ color: COLORS.gray }}>Price Range</p>
                                                                <p className="font-semibold text-lg" style={{ color: COLORS.primary }}>
                                                                    ₱{product.price_min.toLocaleString()} - ₱{product.price_max.toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs" style={{ color: COLORS.gray }}>Store</p>
                                                                <p className="text-sm font-medium" style={{ color: COLORS.accent }}>
                                                                    {product.stores.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Review button at the bottom */}
                                                    <div className="mt-auto pt-3">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewReviews(product)}
                                                            className="w-full flex items-center justify-center gap-1"
                                                            style={{ borderColor: COLORS.lightgray, color: COLORS.accent }}
                                                        >
                                                            <MessageSquare size={14} />
                                                            View Reviews ({product.total_reviews})
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                        )}

                        {/* Pagination */}
                        {!loading && sortedProducts.length > 0 && renderPagination()}
                        
                        {/* Review Modal */}
                        {selectedProduct && (
                            <ReviewModal
                                isOpen={reviewModalOpen}
                                onClose={() => setReviewModalOpen(false)}
                                productId={selectedProduct.id}
                                productName={selectedProduct.name}
                            />
                        )}
                        
                        {/* Delete Confirmation Modal */}
                        <ConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            title="Confirm Deletion"
                            description="Are you sure you want to delete this product? This action cannot be undone."
                            confirmLabel="Delete"
                            cancelLabel="Cancel"
                            onConfirm={confirmDelete}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}