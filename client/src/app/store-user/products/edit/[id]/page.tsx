'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, ArrowLeft, Box } from 'lucide-react';
import { fetchMunicipalities, Municipality } from '../../../../api/municipalityService';

import Sidebar from '../../../dashboard/components/Sidebar';
import Header from '../../../dashboard/components/Header';
import { useStoreUserAuth } from '@/context/StoreUserAuthContext';
import { COLORS } from '../../../../constants/colors';
import { FONTS } from '../../../../constants/fonts';
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

export default function EditProductPage() {
  const { storeUser } = useStoreUserAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imagesToKeep, setImagesToKeep] = useState<string[]>([]);
  const [arAssetFile, setArAssetFile] = useState<File | null>(null);
  const [keepArAsset, setKeepArAsset] = useState(true);
  const [selectedMunicipalityName, setSelectedMunicipalityName] = useState<string | null>(null);

  // Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');

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
      town: '',
    },
  });

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

  // Update town field when municipalities are loaded and productData is available
  useEffect(() => {
    if (!loadingMunicipalities && productData && productData.town && municipalities.length > 0) {
      // Ensure the town value is set correctly after municipalities are loaded
      form.setValue('town', productData.town.toString());

      // Find the municipality name for the selected town ID
      const selectedMunicipality = municipalities.find(
        m => m.id.toString() === productData.town.toString()
      );

      if (selectedMunicipality) {
        setSelectedMunicipalityName(selectedMunicipality.name);
      }
    }
  }, [loadingMunicipalities, productData, municipalities, form]);

  // Fetch product data when component mounts
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        const { fetchStoreUserProductById } = await import('../../../../api/storeUserProductService');
        const response = await fetchStoreUserProductById(parseInt(productId));

        // The backend returns data in a nested structure with a "product" key
        const data = response.product || response;

        console.log("Raw product data from API:", response);
        setProductData(data);

        // Set image preview URLs from existing product images
        if (data.image_urls && Array.isArray(data.image_urls)) {
          setImagePreviewUrls(data.image_urls);
          setImagesToKeep(data.image_urls);
        }

        // Set form values
        form.reset({
          name: data.name || '',
          description: data.description || '',
          category: data.category || '',
          price_min: data.price_min || 0,
          price_max: data.price_max || 0,
          address: data.address || '',
          in_stock: data.in_stock !== undefined ? data.in_stock : true,
          town: data.town ? data.town.toString() : '',
        });

        // Force update the town field value after form reset
        if (data.town) {
          setTimeout(() => {
            form.setValue('town', data.town.toString());
          }, 100);
        }

        console.log("Processed product data:", data);
      } catch (error) {
        console.error('Error loading product:', error);
        setModalType('error');
        setModalTitle('Error Loading Product');
        setModalDescription('There was a problem loading the product data. Please try again.');
        setShowFeedbackModal(true);
        router.push('/store-user/products');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, form, router]);

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
    const removedUrl = newPreviewUrls[index];

    console.log(`Removing image at index ${index}:`, removedUrl);

    // Check if this is an existing image or a new one
    const isExistingImage = imagesToKeep.includes(removedUrl);

    if (isExistingImage) {
      // Remove from imagesToKeep if it's an existing image
      console.log("Removing existing image from imagesToKeep");
      setImagesToKeep(prev => {
        const updated = prev.filter(url => url !== removedUrl);
        console.log("Updated imagesToKeep:", updated);
        return updated;
      });
    } else {
      // If it's a new image, revoke the object URL to avoid memory leaks
      console.log("Removing newly added image");
      URL.revokeObjectURL(removedUrl);

      // Calculate the offset for new images
      const existingImagesCount = imagesToKeep.length;
      const newImageIndex = index - existingImagesCount;

      if (newImageIndex >= 0 && newImageIndex < imageFiles.length) {
        const newFiles = [...imageFiles];
        console.log(`Removing file at index ${newImageIndex} from imageFiles`);
        newFiles.splice(newImageIndex, 1);
        setImageFiles(newFiles);
      } else {
        console.warn("Could not find corresponding file in imageFiles array");
      }
    }

    // Remove from preview URLs
    newPreviewUrls.splice(index, 1);
    console.log("Updated imagePreviewUrls:", newPreviewUrls);
    setImagePreviewUrls(newPreviewUrls);
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      console.log("Form data being submitted:", data);

      // Create FormData object to send files and form data
      const formData = new FormData();

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Add location data
      formData.append('location_name', data.address);
      formData.append('latitude', productData?.latitude || '0');
      formData.append('longitude', productData?.longitude || '0');

      // Add images to keep as JSON string
      formData.append('keep_images', JSON.stringify(imagesToKeep));
      console.log("Images to keep:", imagesToKeep);

      // Add all new image files
      if (imageFiles.length > 0) {
        console.log(`Adding ${imageFiles.length} new image files`);
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
      } else {
        // If no new images are being added, we need to provide an empty file list
        // Some backends require at least an empty file array for multipart/form-data
        console.log("No new images to add");
      }

      // Add AR asset information
      formData.append('keep_ar_asset', keepArAsset.toString());
      if (arAssetFile && !keepArAsset) {
        console.log("Adding new AR asset:", arAssetFile.name);
        formData.append('ar_asset', arAssetFile);
      } else {
        console.log("Keeping existing AR asset:", keepArAsset);
      }

      // Import the updateStoreUserProduct function
      const { updateStoreUserProduct } = await import('../../../../api/storeUserProductService');

      // Send the data to the backend
      const response = await updateStoreUserProduct(parseInt(productId), formData);
      console.log("Update response:", response);

      // Show success message with modal
      setModalType('success');
      setModalTitle('Product Updated Successfully');
      setModalDescription('Your product has been updated.');
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
                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Edit Product</h1>
                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Update your product information</p>
              </div>
            </div>

            {isLoading ? (
              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-center items-center h-40">
                    <p>Loading product data...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle style={{ color: COLORS.accent }}>Product Information</CardTitle>
                  <CardDescription>Update the details of your product</CardDescription>
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
                                  {loadingMunicipalities ? (
                                    <option value="">Loading municipalities...</option>
                                  ) : field.value ? (
                                    <option value={field.value}>{selectedMunicipalityName || 'Selected municipality'}</option>
                                  ) : (
                                    <option value="">Select a municipality</option>
                                  )}
                                  {municipalities.map((municipality) => (
                                    <option
                                      key={municipality.id}
                                      value={municipality.id.toString()}
                                    >
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
                            {productData?.ar_asset_url && keepArAsset ? (
                              <div className="flex items-center space-x-2">
                                <Box size={20} className="text-gray-400" />
                                <span className="text-sm text-gray-600">Current AR asset: {productData.ar_asset_url.split('/').pop()}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setKeepArAsset(false)}
                                  className="h-8 px-2 text-xs"
                                >
                                  Replace
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                                  <Upload size={16} className="text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {arAssetFile ? arAssetFile.name : 'Upload AR Model (.glb, .usdz)'}
                                  </span>
                                  <input
                                    type="file"
                                    accept=".glb,.usdz"
                                    onChange={handleArAssetUpload}
                                    className="hidden"
                                  />
                                </label>
                                {productData?.ar_asset_url && !keepArAsset && !arAssetFile && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setKeepArAsset(true)}
                                    className="h-8 px-2 text-xs"
                                  >
                                    Keep Current
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">Upload a 3D model for AR viewing (GLB or USDZ format)</p>

                          {/* 3D Model Preview */}
                          {(productData?.ar_asset_url || arAssetFile) && (
                            <div className="mt-4">
                              <h3 className="text-sm font-medium mb-2" style={{ color: COLORS.gray }}>3D Model Preview</h3>
                              <div className="border rounded-lg overflow-hidden" style={{ height: '300px' }}>
                                <ModelViewer
                                  src={arAssetFile || productData?.ar_asset_url}
                                  alt={`3D model of ${productData?.name || 'product'}`}
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

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.back()}
                          style={{ borderColor: COLORS.lightgray, color: COLORS.gray }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          style={{ backgroundColor: COLORS.primary }}
                        >
                          {isSubmitting ? 'Updating...' : 'Update Product'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
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