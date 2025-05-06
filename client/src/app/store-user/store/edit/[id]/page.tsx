'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, ArrowLeft, MapPin } from 'lucide-react';
import { COLORS } from '../../../../constants/colors';
import { FONTS } from '../../../../constants/fonts';
import { FeedbackModal } from '@/components/ui/feedback-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MapPreview from '../../../../stores/components/MapPreview'; // Reuse the MapPreview component
import { fetchMunicipalities, Municipality } from '../../../../api/municipalityService';
import Sidebar from '../../../dashboard/components/Sidebar';
import Header from '../../../dashboard/components/Header';
import { useStoreUserAuth } from '@/context/StoreUserAuthContext';
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
    const { storeUser } = useStoreUserAuth();
    const router = useRouter();
    const params = useParams();
    const storeId = params.id as string;

    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [storeData, setStoreData] = useState<any>(null);

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
    const [selectedMunicipalityName, setSelectedMunicipalityName] = useState<string | null>(null);

    // Store types
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

    // Update town field when municipalities are loaded and storeData is available
    useEffect(() => {
        if (!loadingMunicipalities && storeData && storeData.town && municipalities.length > 0) {
            // Ensure the town value is set correctly after municipalities are loaded
            form.setValue('town', storeData.town.toString());
            console.log('Setting town value after municipalities loaded:', storeData.town.toString());

            // Find the municipality name for the selected town ID
            const selectedMunicipality = municipalities.find(
                m => m.id.toString() === storeData.town.toString()
            );

            if (selectedMunicipality) {
                setSelectedMunicipalityName(selectedMunicipality.name);
                console.log('Found municipality name:', selectedMunicipality.name);
            }
        }
    }, [loadingMunicipalities, storeData, municipalities, form]);

    // Fetch store data when component mounts
    useEffect(() => {
        const loadStore = async () => {
            setIsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/store-user/store/${storeId}`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setStoreData(data);

                    // Set image preview if store has an image
                    if (data.store_image) {
                        setImagePreviewUrl(data.store_image);
                    }

                    // Set form values
                    form.reset({
                        name: data.name || '',
                        description: data.description || '',
                        type: data.type || '',
                        phone: data.phone || '',
                        operating_hours: data.operating_hours || '',
                        latitude: data.latitude || 16.6157,
                        longitude: data.longitude || 120.3210,
                        town: data.town ? data.town.toString() : '', // Ensure town is a string
                    });

                    console.log("Loaded store data:", data);
                    console.log("Town value set to:", data.town);

                    // Force update the town field value after form reset
                    if (data.town) {
                        setTimeout(() => {
                            form.setValue('town', data.town.toString());
                        }, 100);
                    }
                } else {
                    console.error('Failed to fetch store details');
                    setModalType('error');
                    setModalTitle('Error Loading Store');
                    setModalDescription('There was a problem loading the store data. Please try again.');
                    setShowFeedbackModal(true);
                    router.push('/store-user/store');
                }
            } catch (error) {
                console.error('Error loading store:', error);
                setModalType('error');
                setModalTitle('Error Loading Store');
                setModalDescription('There was a problem loading the store data. Please try again.');
                setShowFeedbackModal(true);
                router.push('/store-user/store');
            } finally {
                setIsLoading(false);
            }
        };

        if (storeId) {
            loadStore();
        }
    }, [storeId, form, router]);

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
        form.setValue('latitude', lat, { shouldValidate: true });
        form.setValue('longitude', lng, { shouldValidate: true });
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

            // Import the updateStore function dynamically
            const { updateUserStore } = await import('../../../../api/storeService');

            // Send the data to the backend
            await updateUserStore(storeId, formData);

            // Show success message with modal
            setModalType('success');
            setModalTitle('Store Updated Successfully');
            setModalDescription('Your store information has been updated.');
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
            router.push('/store-user/store');
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
                {/* Header component */}
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
                                    Back to My Store
                                </Button>
                                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Edit Store</h1>
                                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Update your store information</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <Card className="border-none shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex justify-center items-center h-40">
                                        <p>Loading store data...</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle style={{ color: COLORS.accent }}>Store Information</CardTitle>
                                    <CardDescription>Update your store details</CardDescription>
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
                                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                                <Input placeholder="e.g., Mon-Fri: 9AM-5PM" {...field} />
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
                                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                            </div>

                                            {/* Description - Full Width */}
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel style={{ color: COLORS.gray }}>Description</FormLabel>
                                                        <FormControl>
                                                            <textarea
                                                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                placeholder="Enter store description"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Store Image Upload */}
                                            <div className="space-y-2">
                                                <Label style={{ color: COLORS.gray }}>Store Image</Label>
                                                <div className="flex flex-col gap-4">
                                                    {/* Image Preview */}
                                                    {imagePreviewUrl && (
                                                        <div className="relative w-40 h-40 overflow-hidden rounded-lg">
                                                            <img
                                                                src={imagePreviewUrl}
                                                                alt="Store Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute top-2 right-2 h-6 w-6"
                                                                onClick={removeImage}
                                                            >
                                                                <X size={14} />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Upload Button */}
                                                    {!imagePreviewUrl && (
                                                        <div className="flex items-center gap-4">
                                                            <Label
                                                                htmlFor="store-image"
                                                                className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 hover:bg-gray-50"
                                                            >
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                                                    <p className="text-xs text-gray-500">Upload Image</p>
                                                                </div>
                                                                <Input
                                                                    id="store-image"
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={handleImageUpload}
                                                                />
                                                            </Label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Map Location */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-gray-500" />
                                                    <Label style={{ color: COLORS.gray }}>Store Location</Label>
                                                </div>
                                                <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200">
                                                    <MapPreview
                                                        latitude={form.getValues('latitude')}
                                                        longitude={form.getValues('longitude')}
                                                        onCoordinatesChange={handleCoordinatesChange}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mt-2">
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
                                                    {isSubmitting ? 'Updating...' : 'Update Store'}
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
