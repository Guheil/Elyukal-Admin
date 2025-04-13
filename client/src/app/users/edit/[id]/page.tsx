'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import { fetchUserByEmail, User } from '../../../api/userService';

import Sidebar from '../../../dashboard/components/Sidebar';
import Header from '../../../dashboard/components/Header';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import { FeedbackModal } from '@/components/ui/feedback-modal';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
const userFormSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function EditUserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userEmail = decodeURIComponent(params.id as string);

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  
  // Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetchUserByEmail(userEmail);
        if (response && response.user) {
          const userData = response.user;
          setUserData(userData);

          // Set form values
          form.reset({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setModalType('error');
        setModalTitle('Error Loading User');
        setModalDescription('There was a problem loading the user data. Please try again.');
        setShowFeedbackModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (userEmail) {
      loadUser();
    }
  }, [userEmail, form]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);

    try {
      // Import the updateUser function dynamically
      const { updateUser } = await import('../../../api/userService');

      // Send the data to the backend
      await updateUser(userEmail, data);

      // Show success message with modal
      setModalType('success');
      setModalTitle('User Updated Successfully');
      setModalDescription('The user information has been updated.');
      setShowFeedbackModal(true);
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Show error message with modal
      setModalType('error');
      setModalTitle('Error Updating User');
      setModalDescription('There was a problem updating the user. Please try again.');
      setShowFeedbackModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close and redirect if success
  const handleModalClose = () => {
    setShowFeedbackModal(false);
    if (modalType === 'success') {
      router.push('/users');
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
                  Back to Users
                </Button>
                <h1 className="text-2xl font-bold" style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Edit User</h1>
                <p className="text-sm mt-1" style={{ color: COLORS.gray }}>Update user information</p>
              </div>
            </div>

            {isLoading ? (
              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-center items-center h-40">
                    <p>Loading user data...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle style={{ color: COLORS.accent }}>User Information</CardTitle>
                  <CardDescription>Update the user's details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: COLORS.gray }}>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: COLORS.gray }}>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: COLORS.gray }}>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter email address" 
                                  {...field} 
                                  disabled 
                                  className="bg-gray-100"
                                />
                              </FormControl>
                              <FormDescription>
                                Email address cannot be changed
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                          {isSubmitting ? 'Updating...' : 'Update User'}
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