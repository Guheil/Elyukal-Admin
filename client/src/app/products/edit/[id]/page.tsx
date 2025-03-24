'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, ArrowLeft, Box } from 'lucide-react';
import { fetchStores, Store } from '../../../api/storeService';
import { fetchMunicipalities, Municipality } from '../../../api/municipalityService';
import { fetchProductById, updateProduct, Product } from '../../../api/productService';

import Sidebar from '../../../dashboard/components/Sidebar';
import Header from '../../../dashboard/components/Header';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import { FeedbackModal } from '@/components/ui/feedback-modal';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModelViewer } from '@/components/ui/model-viewer';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

// Form validation schema
const productFormSchema = z.object({
    name: z.string().min(3, { message: 'Product name must be at least 3 characters' }),
    description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
    category: z.string().min(1, { message: 'Please select a category' }),
    price_min: z.coerce.number().min(0, { message: 'Minimum price cannot be negative' }),
    price_max: z.coerce.number().min(0, { message: 'Maximum price cannot be negative' }),
    address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
    in_stock: z.boolean().default(true),
    store_id: z.string().min(1, { message: 'Please select a valid store' }),
    town: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProductPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const productId = Number(params.id);

    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);

    // Image management
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [arAssetFile, setArAssetFile] = useState<File | null>(null);
    const [keepArAsset, setKeepArAsset] = useState(true);
    
    // Modal state
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalTitle, setModalTitle] = useState('');
    const [modalDescription, setModalDescription] = useState('');

    // Store data from API
    const [stores, setStores] = useState<Store[]>([]);
    const [loadingStores, setLoadingStores] = useState(true);

    // Municipalities data from API
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);

    // Sample categories (would come from API in a real implementation)
    const categories = [
        'Handicrafts',
        'Food Products',
        'Textiles',
        'Souvenirs',
        'Agricultural Products',
        'Beverages',
        'Clothing',
        'Accessories',
    ];

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '',
            price_min: 0,
            price_max: 0,
            address: '',
            in_stock: true,
            store_id: '',
            town: '',
        },
    });

    // Fetch product data when component mounts
    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true);
            try {
                const response = await fetchProductById(productId);
                if (response && response.product) {
                    const productData = response.product;
                    setProduct(productData);

                    // Set existing image URLs
                    if (productData.image_urls && Array.isArray(productData.image_urls)) {
                        setExistingImageUrls(productData.image_urls);
                        setImagePreviewUrls(productData.image_urls);
                    }

                    // Set form values
                    form.reset({
                        name: productData.name,
                        description: productData.description,
                        category: productData.category,
                        price_min: productData.price_min,
                        price_max: productData.price_max,
                        address: productData.address,
                        in_stock: productData.in_stock,
                        store_id: productData.store_id.toString(),
                        town: productData.town || '',
                    });
                }
            } catch (error) {
                console.error('Error loading product:', error);
                alert('Error loading product. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            loadProduct();
        }
    }, [productId, form]);

    // Fetch stores and municipalities data
    useEffect(() => {
        const loadStores = async () => {
            setLoadingStores(true);
            try {
                const storesData = await fetchStores();
                if (storesData && Array.isArray(storesData)) {
                    setStores(storesData);
                }
            } catch (error) {
                console.error('Error loading stores:', error);
            } finally {
                setLoadingStores(false);
            }
        };

        const loadMunicipalities = async () => {
            setLoadingMunicipalities(true);
            try {
                const municipalitiesData = await fetchMunicipalities();
                if (municipalitiesData && Array.isArray(municipalitiesData)) {
                    setMunicipalities(municipalitiesData);
                }
            } catch (error) {
                console.error('Error loading municipalities:', error);
            } finally {
                setLoadingMunicipalities(false);
            }
        };

        loadStores();
        loadMunicipalities();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...newFiles]);

            // Create preview URLs
            const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const handleArAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setArAssetFile(e.target.files[0]);
            setKeepArAsset(false);
        }
    };

    const removeImage = (index: number) => {
        const newPreviewUrls = [...imagePreviewUrls];
        if (index < existingImageUrls.length) {
            // Remove from existing images
            const newExistingUrls = [...existingImageUrls];
            newExistingUrls.splice(index, 1);
            setExistingImageUrls(newExistingUrls);
        } else {
            // Remove from new images
            const adjustedIndex = index - existingImageUrls.length;
            const newFiles = [...imageFiles];
            URL.revokeObjectURL(newPreviewUrls[index]);
            newFiles.splice(adjustedIndex, 1);
            setImageFiles(newFiles);
        }
        newPreviewUrls.splice(index, 1);
        setImagePreviewUrls(newPreviewUrls);
    };

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();

            // Add all form fields
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });

            // Add location data (placeholder values)
            formData.append('location_name', data.address);
            formData.append('latitude', '0');
            formData.append('longitude', '0');

            // Add existing images to keep
            formData.append('keep_images', JSON.stringify(existingImageUrls));

            // Add new image files
            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            // Add AR asset information
            formData.append('keep_ar_asset', keepArAsset.toString());
            if (arAssetFile && !keepArAsset) {
                formData.append('ar_asset', arAssetFile);
            }

            // Send the data to the backend
            const response = await updateProduct(productId, formData);

            // Show success message with modal
            setModalType('success');
            setModalTitle('Product Updated Successfully');
            setModalDescription('Your product has been updated in the marketplace.');
            setShowFeedbackModal(true);
        } catch (error) {
            console.error('Error updating product:', error);
            
            // Show error message with modal
            setModalType('error');
            setModalTitle('Error Updating Product');
            setModalDescription('There was a problem updating your product. Please try again.');
            setShowFeedbackModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle modal close and redirect if success
    const handleModalClose = () => {
        setShowFeedbackModal(false);
        if (modalType === 'success') {
            router.push('/products');
        }
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex bg-container" style={{ backgroundColor: COLORS.container }}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={user} />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <Header user={user} notificationsCount={0} />
                    <main className="p-6 flex justify-center items-center h-[calc(100vh-64px)]">
                        <p>Loading product data...</p>
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
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <Button
                                    variant="ghost"
                                    className="mb-2 flex items-center gap-1 text-gray-500 hover:text-gray-700"
                                    onClick={() => router.back()}
                                >
                                    <ArrowLeft size={16} />
                                    Back to Products
                                </Button>
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>
                                    Edit Product
                                </h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Update product information</p>
                            </div>
                        </div>

                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle style={{ color: COLORS.accent }}>Product Information</CardTitle>
                                <CardDescription>Update the details of the product</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Product Name */}
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel style={{ color: COLORS.gray }}>Product Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter product name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Category */}
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel style={{ color: COLORS.gray }}>Category</FormLabel>
                                                        <FormControl>
                                                            <select
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                                {...field}
                                                            >
                                                                <option value="">Select a category</option>
                                                                {categories.map((category) => (
                                                                    <option key={category} value={category}>
                                                                        {category}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Price Range */}
                                            <FormField
                                                control={form.control}
                                                name="price_min"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel style={{ color: COLORS.gray }}>Minimum Price (₱)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="price_max"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel style={{ color: COLORS.gray }}>Maximum Price (₱)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Store */}
                                            <FormField
                                                control={form.control}
                                                name="store_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel style={{ color: COLORS.gray }}>Store</FormLabel>
                                                        <FormControl>
                                                            <select
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                                {...field}
                                                                value={field.value}
                                                                onChange={(e) => field.onChange(e.target.value)}
                                                                disabled={loadingStores}
                                                            >
                                                                <option value="">{loadingStores ? 'Loading stores...' : 'Select a store'}</option>
                                                                {stores.map((store) => (
                                                                    <option key={store.store_id} value={store.store_id}>
                                                                        {store.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Town/Municipality */}
                                            <FormField
                                                control={form.control}
                                                name="town"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel style={{ color: COLORS.gray }}>Town/Municipality</FormLabel>
                                                        <FormControl>
                                                            <select
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                                {...field}
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value)}
                                                                disabled={loadingMunicipalities}
                                                            >
                                                                <option value="">{loadingMunicipalities ? 'Loading municipalities...' : 'Select a municipality'}</option>
                                                                {municipalities.map((municipality) => (
                                                                    <option key={municipality.id} value={municipality.id.toString()}>
                                                                        {municipality.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Address */}
                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel style={{ color: COLORS.gray }}>Address</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter product location" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* In Stock */}
                                            <FormField
                                                control={form.control}
                                                name="in_stock"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                                        <FormControl>
                                                            <input
                                                                type="checkbox"
                                                                checked={field.value}
                                                                onChange={field.onChange}
                                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel style={{ color: COLORS.gray }}>In Stock</FormLabel>
                                                            <FormDescription>
                                                                Mark if this product is currently available
                                                            </FormDescription>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Description */}
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel style={{ color: COLORS.gray }}>Description</FormLabel>
                                                    <FormControl>
                                                        <textarea
                                                            className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                            placeholder="Enter product description"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Image Upload */}
                                        <div className="space-y-3">
                                            <Label style={{ color: COLORS.gray }}>Product Images</Label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.lightgray }}>
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-8 h-8 mb-2" style={{ color: COLORS.primary }} />
                                                        <p className="text-xs text-center" style={{ color: COLORS.gray }}>Click to upload</p>
                                                    </div>
                                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                                </label>

                                                {/* Image Previews */}
                                                <div className="flex flex-wrap gap-3">
                                                    {imagePreviewUrls.map((url, index) => (
                                                        <div key={index} className="relative w-32 h-32">
                                                            <img
                                                                src={url}
                                                                alt={`Product preview ${index + 1}`}
                                                                className="w-full h-full object-cover rounded-lg border"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs" style={{ color: COLORS.gray }}>
                                                Upload up to 5 images of your product. First image will be the featured image.
                                            </p>
                                        </div>

                                        {/* AR Asset Upload */}
                                        <div className="space-y-3">
                                            <Label style={{ color: COLORS.gray }}>AR Asset (Optional)</Label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.lightgray }}>
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-8 h-8 mb-2" style={{ color: COLORS.primary }} />
                                                        <p className="text-xs text-center" style={{ color: COLORS.gray }}>Upload 3D Model</p>
                                                    </div>
                                                    <input type="file" accept=".glb" className="hidden" onChange={handleArAssetUpload} />
                                                </label>

                                                {/* AR Asset Preview */}
                                                {arAssetFile && (
                                                    <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg">
                                                        <span className="text-sm font-medium truncate max-w-xs">{arAssetFile.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setArAssetFile(null)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs" style={{ color: COLORS.gray }}>
                                                Upload a 3D model to enable AR viewing. Supported formats: GLB only
                                            </p>
                                            
                                            {/* AR Model Preview */}
                                            <div className="mt-4">
                                                <Label style={{ color: COLORS.gray }}>AR Model Preview</Label>
                                                <div className="h-64 mt-2 border rounded-lg overflow-hidden">
                                                    {arAssetFile ? (
                                                        <ModelViewer 
                                                            src={arAssetFile} 
                                                            className="w-full h-full" 
                                                        />
                                                    ) : product?.ar_asset_url ? (
                                                        <ModelViewer 
                                                            src={product.ar_asset_url} 
                                                            className="w-full h-full" 
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                                                            <Box className="w-12 h-12 text-gray-300 mb-2" />
                                                            <p className="text-sm text-gray-500">No 3D model available</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6"
                                                style={{
                                                    backgroundColor: isSubmitting ? COLORS.lightgray : COLORS.primary,
                                                    color: 'white'
                                                }}
                                            >
                                                {isSubmitting ? 'Updating Product...' : 'Update Product'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
            
            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={handleModalClose}
                title={modalTitle}
                description={modalDescription}
                type={modalType}
                actionLabel={modalType === 'success' ? 'Go to Products' : 'Try Again'}
            />
        </div>
    );
}