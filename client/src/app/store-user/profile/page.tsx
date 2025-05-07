'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { useStoreUserAuth } from '@/context/StoreUserAuthContext';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Edit, Save, AlertCircle, Calendar } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function UserProfile() {
    const { storeUser, refreshUserData } = useStoreUserAuth();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        joined_date: '',
        position: 'Seller Account',
    });

    useEffect(() => {
        if (storeUser) {
            setFormData(prev => ({
                ...prev,
                first_name: storeUser.first_name || '',
                last_name: storeUser.last_name || '',
                email: storeUser.email || '',
                phone_number: storeUser.phone_number || '',
                joined_date: storeUser.created_at || '',
            }));
        }
    }, [storeUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setError('');
        setSuccess('');
    };

    // We're now using the refreshUserData function from the context

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/store-user/update-profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone_number: formData.phone_number,
                }),
            });

            if (response.ok) {
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
                // Refresh user data using the context function
                await refreshUserData();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('An error occurred while updating your profile');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        return `${formData.first_name?.charAt(0) || ''}${formData.last_name?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="min-h-screen flex bg-container" style={{ backgroundColor: COLORS.container }}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)} user={storeUser} />
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Header user={storeUser} notificationsCount={0} />

                <main className="p-6">
                    {error && (
                        <div className="p-4 mb-6 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#FEECEC', color: COLORS.error }}>
                            <AlertCircle size={18} />
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 mb-6 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#ECFEEC', color: COLORS.success }}>
                            <AlertCircle size={18} />
                            <p>{success}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-6">
                        {/* Profile Header */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                <div>
                                    <Avatar className="w-24 h-24 border-4" style={{ borderColor: COLORS.primary }}>
                                        <AvatarFallback style={{ backgroundColor: COLORS.primary, color: 'white', fontSize: '1.5rem' }}>
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-2xl font-bold" style={{ fontFamily: FONTS.bold }}>
                                        {formData.first_name} {formData.last_name}
                                    </h1>
                                    <p className="text-gray-500 mt-1">{formData.position}</p>

                                    <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                            <Calendar size={14} />
                                            Joined {new Date(formData.joined_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </Badge>
                                        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                                            <User size={14} />
                                            Active User
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    {!isEditing ? (
                                        <Button
                                            onClick={handleEditToggle}
                                            className="flex items-center gap-2"
                                            style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                        >
                                            <Edit size={16} />
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleEditToggle}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleProfileUpdate}
                                                disabled={loading}
                                                className="flex items-center gap-2"
                                                style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                            >
                                                <Save size={16} />
                                                Save
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <Card className="bg-white">
                            <CardContent className="p-6">
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
                                                <User size={20} />
                                                Personal Information
                                            </h2>
                                            <Separator className="mb-6" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor="first_name">First Name</Label>
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="last_name">Last Name</Label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
                                                <Mail size={20} />
                                                Contact Details
                                            </h2>
                                            <Separator className="mb-6" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor="email" className="flex items-center gap-2">
                                                        <Mail size={16} style={{ color: COLORS.gray }} />
                                                        Email Address
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        disabled={true}
                                                        className="mt-1"
                                                    />
                                                    <p className="text-xs mt-1 text-gray-500">Email cannot be changed</p>
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone_number" className="flex items-center gap-2">
                                                        <Phone size={16} style={{ color: COLORS.gray }} />
                                                        Phone Number
                                                    </Label>
                                                    <Input
                                                        id="phone_number"
                                                        name="phone_number"
                                                        value={formData.phone_number}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        className="mt-1"
                                                        placeholder="e.g. +63 912 345 6789"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end mt-6">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center gap-2"
                                                style={{ backgroundColor: COLORS.primary, color: 'white' }}
                                            >
                                                <Save size={16} />
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}