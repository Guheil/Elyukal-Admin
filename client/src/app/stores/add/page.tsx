'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, ArrowLeft, MapPin } from 'lucide-react';
import MapPreview from '../components/MapPreview';
import Sidebar from '../../dashboard/components/Sidebar';
import Header from '../../dashboard/components/Header';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
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
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

export default function AddStorePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeImage, setStoreImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Sample store types (would come from API in a real implementation)
  const storeTypes = [
    'Marketplace',
    'Agri-Tourism Center',
    'Local Crafts Shop',
    'Food Stall',
    'Souvenir Shop',
    'Farm',
    'Restaurant',
    'Specialty Store',
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
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setStoreImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  const removeImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setStoreImage(null);
    setImagePreviewUrl(null);
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
  };

  const onSubmit = async (data: StoreFormValues) => {
    setIsSubmitting(true);

    try {
      console.log('Form data:', data);
      console.log('Store image:', storeImage);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert('Store added successfully! (Frontend only)');
      router.push('/stores');
    } catch (error) {
      console.error('Error adding store:', error);
      alert('Error adding store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Add New Store</h1>
                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Create a new store listing for the marketplace</p>
              </div>
            </div>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle style={{ color: COLORS.accent }}>Store Information</CardTitle>
                <CardDescription>Enter the details of the new store</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.gray }}>Latitude</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.000001" placeholder="Enter latitude" {...field} />
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
                              <Input type="number" step="0.000001" placeholder="Enter longitude" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: COLORS.gray }}>Description</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Enter store description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <Label style={{ color: COLORS.gray }}>Store Image</Label>
                      <div className="flex items-center gap-4">
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: COLORS.lightgray }}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2" style={{ color: COLORS.primary }} />
                            <p className="text-xs text-center" style={{ color: COLORS.gray }}>Click to upload</p>
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        {imagePreviewUrl && (
                          <div className="relative w-32 h-32">
                            <img
                              src={imagePreviewUrl}
                              alt="Store preview"
                              className="w-full h-full object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: COLORS.gray }}>
                        Upload a high-quality image of your store. This will be displayed on the marketplace.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label style={{ color: COLORS.gray }}>Location Preview</Label>
                      <MapPreview
                        latitude={parseFloat(form.watch('latitude') as unknown as string) || 16.6157}
                        longitude={parseFloat(form.watch('longitude') as unknown as string) || 120.3210}
                        onCoordinatesChange={handleCoordinatesChange}
                      />
                      <p className="text-xs" style={{ color: COLORS.gray }}>
                        Click on the map to set coordinates or enter them manually above
                      </p>
                    </div>

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
                        {isSubmitting ? 'Adding Store...' : 'Add Store'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}