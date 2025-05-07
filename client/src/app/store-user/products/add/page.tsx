'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, ArrowLeft, Box } from 'lucide-react';
import { fetchMunicipalities, Municipality } from '../../../api/municipalityService';

import Sidebar from '../../dashboard/components/Sidebar';
import Header from '../../dashboard/components/Header';
import { useStoreUserAuth } from '@/context/StoreUserAuthContext';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import { FeedbackModal } from '@/components/ui/feedback-modal';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  town: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const forceHardRefresh = () => {
  // Set a flag in localStorage before refreshing
  localStorage.setItem('hasRefreshed', 'true');
  window.location.reload();
};

export default function AddProductPage() {
  const { storeUser } = useStoreUserAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [arAssetFile, setArAssetFile] = useState<File | null>(null);
  const [needsRefresh, setNeedsRefresh] = useState(true);

  // Add useEffect to trigger hard refresh on component mount, but only once
  useEffect(() => {
    // Check if we've already refreshed
    const hasRefreshed = localStorage.getItem('hasRefreshed');

    if (!hasRefreshed) {
      // Only refresh if we haven't already
      forceHardRefresh();
    } else {
      // Clear the flag so next time user visits the page it will refresh again
      localStorage.removeItem('hasRefreshed');
    }
  }, []);

  // Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');

  // Municipalities data from API
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);

    // Fetch municipalities data when component mounts
    useEffect(() => {
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

        loadMunicipalities();
    }, []);

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
      town: '',
    },
  });

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
    }
  };

  // Fetch municipalities data when component mounts
  useEffect(() => {
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

    loadMunicipalities();
  }, []);

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviewUrls = [...imagePreviewUrls];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);

    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviewUrls(newPreviewUrls);
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      // Create FormData object to send files and form data
      const formData = new FormData();

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Check if store_owned exists in storeUser
      if (!storeUser || !storeUser.store_owned) {
        // Try to refresh the user data first before giving up
        setModalType('error');
        setModalTitle('Refreshing Store Data');
        setModalDescription('Refreshing your store information. Please wait...');
        setShowFeedbackModal(true);

        // Force a refresh and return early
        setTimeout(() => {
          forceHardRefresh();
        }, 2000);
        return;
      }

      // Add store_id from the logged-in store user
      formData.append('store_owned', storeUser.store_owned.toString());

      // Add location data (these would come from a map component in a real implementation)
      formData.append('location_name', data.address); // Using address as location name for now
      formData.append('latitude', '0'); // Placeholder
      formData.append('longitude', '0'); // Placeholder

      // Add all image files
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Add AR asset if available
      if (arAssetFile) {
        formData.append('ar_asset', arAssetFile);
      }

      // Import the addStoreUserProduct function
      const { addStoreUserProduct } = await import('../../../api/storeUserProductService');

      // Send the data to the backend
      const response = await addStoreUserProduct(formData);

      // Show success message with modal
      setModalType('success');
      setModalTitle('Product Added Successfully');
      setModalDescription('Your product has been added to the marketplace.');
      setShowFeedbackModal(true);
    } catch (error) {
      console.error('Error adding product:', error);

      // Show error message with modal
      setModalType('error');
      setModalTitle('Error Adding Product');
      setModalDescription('There was a problem adding your product. Please try again.');
      setShowFeedbackModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close and redirect if success
  const handleModalClose = () => {
    setShowFeedbackModal(false);
    if (modalType === 'success') {
      router.push('/store-user/products');
    }
  };

  const mainContentClasses = isSidebarCollapsed
    ? "ml-20 transition-all duration-300 flex-1"
    : "ml-64 transition-all duration-300 flex-1";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
        user={storeUser}
      />

      {/* Main Content Area */}
      <div className={mainContentClasses}>
        {/* Header */}
        <Header user={storeUser} notificationsCount={0} />

        {/* Main Content */}
        <main className="p-6 overflow-y-auto max-h-[calc(100vh-64px)]">
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
                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Add New Product</h1>
                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Create a new product listing for your store</p>
              </div>
            </div>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle style={{ color: COLORS.accent }}>Product Information</CardTitle>
                <CardDescription>Enter the details of the new product</CardDescription>
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

                      {/* Address */}
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.gray }}>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product location address" {...field} />
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

                      {/* In Stock */}
                      <FormField
                        control={form.control}
                        name="in_stock"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel style={{ color: COLORS.gray }}>In Stock</FormLabel>
                              <FormDescription>
                                Is this product currently available for purchase?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Product Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: COLORS.gray }}>Description</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Enter product description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Product Images */}
                    <div>
                      <Label style={{ color: COLORS.gray }}>Product Images</Label>
                      <div className="mt-2 flex flex-col space-y-2">
                        <div className="flex flex-wrap gap-4 mt-2">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload size={20} className="text-gray-400" />
                              <p className="text-xs text-gray-500 mt-1">Upload</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">Upload multiple product images (JPEG, PNG, WebP)</p>
                      </div>
                    </div>

                    {/* AR Asset Upload */}
                    <div>
                      <Label style={{ color: COLORS.gray }}>AR Asset (Optional)</Label>
                      <div className="mt-2 flex flex-col space-y-2">
                        <div className="flex items-center space-x-4">
                          {arAssetFile ? (
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                              <Box size={20} className="text-gray-400" />
                              <span className="text-sm truncate max-w-[200px]">{arAssetFile.name}</span>
                              <button
                                type="button"
                                onClick={() => setArAssetFile(null)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                              <Upload size={20} className="text-gray-400" />
                              <span className="text-sm text-gray-500">Upload 3D Model</span>
                              <input
                                type="file"
                                accept=".glb,.usdz"
                                onChange={handleArAssetUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Upload a 3D model for AR viewing (GLB or USDZ format)</p>

                        {/* 3D Model Preview */}
                        {arAssetFile && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2" style={{ color: COLORS.gray }}>3D Model Preview</h3>
                            <div className="border rounded-lg overflow-hidden" style={{ height: '300px' }}>
                              <ModelViewer
                                src={arAssetFile}
                                alt="3D model preview"
                                poster={imagePreviewUrls[0]}
                                className="w-full h-full"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Use your mouse to rotate and zoom the 3D model. On mobile devices, you can view the model in AR.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ backgroundColor: COLORS.accent }}
                      >
                        {isSubmitting ? 'Adding Product...' : 'Add Product'}
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
      />
    </div>
  );
}
