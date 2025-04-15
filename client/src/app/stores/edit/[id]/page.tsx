'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, ArrowLeft, MapPin } from 'lucide-react';
import { fetchStoreById, updateStore, Store } from '../../../api/storeService';
import { fetchMunicipalities, Municipality } from '../../../api/municipalityService';

import Sidebar from '../../../dashboard/components/Sidebar';
import Header from '../../../dashboard/components/Header';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import { FeedbackModal } from '@/components/ui/feedback-modal';
import MapPreview from '../../components/MapPreview';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
const storeFormSchema = z.object({
  name: z.string().min(3, { message: 'Store name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  type: z.string().min(1, { message: 'Please select a store type' }),
  phone: z.string().min(7, { message: 'Please enter a valid phone number' }).optional().or(z.literal('')),
  operating_hours: z.string().min(3, { message: 'Please enter valid operating hours' }).optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90, { message: 'Latitude must be between -90 and 90' }),
  longitude: z.coerce.number().min(-180).max(180, { message: 'Longitude must be between -180 and 180' }),
  town: z.string().optional(),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

export default function EditStorePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);

  // Image management
  const [storeImage, setStoreImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [keepImage, setKeepImage] = useState(true);
  
  // Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  
  // Municipalities data from API
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);

  // Store types (would come from API in a real implementation)
  const storeTypes = [
    'Marketplace',
    'Agri-Tourism Center',
    'Local Crafts Shop',
    'Food Stall',
    'Souvenir Shop',
  ];

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: '',
      phone: '',
      operating_hours: '',
      latitude: 16.6157, // Default to La Union coordinates
      longitude: 120.3210,
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

  // Fetch store data when component mounts
  useEffect(() => {
    const loadStore = async () => {
      setIsLoading(true);
      try {
        const response = await fetchStoreById(storeId);
        if (response && response.store) {
          const storeData = response.store;
          setStore(storeData);

          // Set image preview if store has an image
          if (storeData.store_image) {
            setImagePreviewUrl(storeData.store_image);
          }

          // Set form values
          form.reset({
            name: storeData.name,
            description: storeData.description,
            type: storeData.type || '',
            phone: storeData.phone || '',
            operating_hours: storeData.operating_hours || '',
            latitude: storeData.latitude,
            longitude: storeData.longitude,
            town: storeData.town ? storeData.town.toString() : '',
          });
        }
      } catch (error) {
        console.error('Error loading store:', error);
        setModalType('error');
        setModalTitle('Error Loading Store');
        setModalDescription('There was a problem loading the store data. Please try again.');
        setShowFeedbackModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (storeId) {
      loadStore();
    }
  }, [storeId, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setStoreImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setKeepImage(false);
    }
  };

  const removeImage = () => {
    if (imagePreviewUrl && !keepImage) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setStoreImage(null);
    setImagePreviewUrl(null);
    setKeepImage(false);
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
  };

  const onSubmit = async (data: StoreFormValues) => {
    setIsSubmitting(true);

    try {
      // Create FormData object to send files and form data
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Add image information
      formData.append('keep_image', keepImage.toString());
      if (storeImage && !keepImage) {
        formData.append('store_image', storeImage);
      }

      // Send the data to the backend
      const response = await updateStore(storeId, formData);

      // Show success message with modal
      setModalType('success');
      setModalTitle('Store Updated Successfully');
      setModalDescription('Your store has been updated in the marketplace.');
      setShowFeedbackModal(true);
    } catch (error) {
      console.error('Error updating store:', error);
      
      // Show error message with modal
      setModalType('error');
      setModalTitle('Error Updating Store');
      setModalDescription('There was a problem updating your store. Please try again.');
      setShowFeedbackModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close and redirect if success
  const handleModalClose = () => {
    setShowFeedbackModal(false);
    if (modalType === 'success') {
      router.push('/stores');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-container" style={{ backgroundColor: COLORS.container }}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={user} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header user={user} notificationsCount={0} />
          <main className="p-6 flex justify-center items-center h-[calc(100vh-64px)]">
            <p>Loading store data...</p>
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
                  Back to Stores
                </Button>
                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>
                  Edit Store
                </h1>
                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Update store information</p>
              </div>
            </div>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle style={{ color: COLORS.accent }}>Store Information</CardTitle>
                <CardDescription>Update the details of the store</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Store Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.gray }}>Store Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter store name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Store Type */}
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.gray }}>Store Type</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="">Select a store type</option>
                                {storeTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.gray }}>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Operating Hours */}
                      <FormField
                        control={form.control}
                        name="operating_hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.gray }}>Operating Hours</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Mon-Fri: 9AM-5PM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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

                      {/* Description - Full width */}
                      <div className="col-span-1 md:col-span-2">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: COLORS.gray }}>Description</FormLabel>
                              <FormControl>
                                <textarea
                                  className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Enter store description"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Store Image - Full width */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="space-y-2">
                          <Label style={{ color: COLORS.gray }}>Store Image</Label>
                          <div className="flex flex-col gap-4">
                            {imagePreviewUrl ? (
                              <div className="relative w-full max-w-md">
                                <img
                                  src={imagePreviewUrl}
                                  alt="Store preview"
                                  className="w-full h-48 object-cover rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                  onClick={removeImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : null}
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => document.getElementById('store-image')?.click()}
                              >
                                <Upload className="h-4 w-4" />
                                {imagePreviewUrl ? 'Change Image' : 'Upload Image'}
                              </Button>
                              <input
                                id="store-image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                              {store?.store_image && (
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="keep-image"
                                    checked={keepImage}
                                    onChange={(e) => setKeepImage(e.target.checked)}
                                    className="mr-2"
                                  />
                                  <Label htmlFor="keep-image" className="text-sm cursor-pointer">
                                    Keep existing image
                                  </Label>
                                </div>
                              )}
                            </div>
                            <FormDescription>
                              Upload a high-quality image of your store. This will be displayed on the marketplace.
                            </FormDescription>
                          </div>
                        </div>
                      </div>

                      {/* Location - Full width */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="space-y-4">
                          <div>
                            <Label style={{ color: COLORS.gray }} className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Location
                            </Label>
                            <p className="text-sm text-gray-500 mb-2">
                              Click on the map to set the store location
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FormField
                              control={form.control}
                              name="latitude"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel style={{ color: COLORS.gray }}>Latitude</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="any" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="longitude"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel style={{ color: COLORS.gray }}>Longitude</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="any" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="h-[500px]">
                            <MapPreview
                              latitude={form.watch('latitude')}
                              longitude={form.watch('longitude')}
                              onCoordinatesChange={handleCoordinatesChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      {/* <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/stores')}
                      >
                        Cancel
                      </Button> */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          background: `linear-gradient(to right, ${COLORS.gradient.start}, ${COLORS.gradient.middle})`,
                          color: 'white',
                        }}
                      >
                        {isSubmitting ? 'Updating Store...' : 'Update Store'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleModalClose}
        title={modalTitle}
        description={modalDescription}
        type={modalType}
        actionLabel={modalType === 'success' ? 'Go to Stores' : 'Try Again'}
        onAction={handleModalClose}
      />
    </div>
  );
}