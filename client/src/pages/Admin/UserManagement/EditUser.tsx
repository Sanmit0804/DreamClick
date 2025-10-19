// pages/EditUser.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import config from '@/config/config';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Services and types
import userService from '@/services/user.service';

// schemas/user.schema.ts
import { z } from 'zod';
import { format } from 'date-fns';

export const userSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'end_user', 'content_creator'], {
        message: 'Role is required',
    }),
    phone: z.string().optional().or(z.literal('')),
    billingAddress: z.object({
        country: z.string().optional(),
    }).optional(),
    creatorProfile: z.object({
        isVerified: z.boolean().optional(),
        bio: z.string().max(500, 'Bio is too long').optional(),
        website: z.string().url('Invalid URL').optional().or(z.literal('')),
        socialLinks: z.object({
            youtube: z.string().url('Invalid URL').optional().or(z.literal('')),
            instagram: z.string().optional().or(z.literal('')),
            twitter: z.string().optional().or(z.literal('')),
        }).optional(),
    }).optional(),
    preferences: z.object({
        emailNotifications: z.object({
            newTemplates: z.boolean().optional(),
            promotions: z.boolean().optional(),
            productUpdates: z.boolean().optional(),
        }).optional(),
    }).optional(),
    isActive: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

const EditUser = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const mode = location.state?.mode || 'edit';

    // Fetch user data
    const {
        data: user,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getUserById(id!),
        enabled: !!id,
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: (data: UserFormData) => userService.updateUser(id!, data),
        onSuccess: () => {
            toast.success('User updated successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user');
        },
    });

    // Initialize form
    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            role: 'end_user',
            phone: '',
            billingAddress: {
                country: '',
            },
            creatorProfile: {
                isVerified: false,
                bio: '',
                website: '',
                socialLinks: {
                    youtube: '',
                    instagram: '',
                    twitter: '',
                },
            },
            preferences: {
                emailNotifications: {
                    newTemplates: true,
                    promotions: true,
                    productUpdates: true,
                },
            },
            isActive: true,
        },
    });

    // Reset form when user data is loaded
    React.useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'end_user',
                phone: user.phone || '',
                billingAddress: {
                    country: user.billingAddress?.country || '',
                },
                creatorProfile: {
                    isVerified: user.creatorProfile?.isVerified || false,
                    bio: user.creatorProfile?.bio || '',
                    website: user.creatorProfile?.website || '',
                    socialLinks: {
                        youtube: user.creatorProfile?.socialLinks?.youtube || '',
                        instagram: user.creatorProfile?.socialLinks?.instagram || '',
                        twitter: user.creatorProfile?.socialLinks?.twitter || '',
                    },
                },
                preferences: {
                    emailNotifications: {
                        newTemplates: user.preferences?.emailNotifications?.newTemplates ?? true,
                        promotions: user.preferences?.emailNotifications?.promotions ?? true,
                        productUpdates: user.preferences?.emailNotifications?.productUpdates ?? true,
                    },
                },
                isActive: user.isActive ?? true,
            });
        }
    }, [user, form]);

    const onSubmit = (data: UserFormData) => {
        updateMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">Error loading user data</p>
                <Button onClick={() => navigate('/admin/users')} className="mt-4">
                    Back to Users
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate('/admin/users')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {mode === 'edit' ? 'Edit User' : 'View User'}
                        </h1>
                        <p className="text-muted-foreground">
                            {mode === 'edit'
                                ? 'Update user information and preferences'
                                : 'View user details'
                            }
                        </p>
                    </div>
                </div>
                {mode === 'edit' && (
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="basic" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="basic">Basic Information</TabsTrigger>
                            <TabsTrigger value="billing">Billing & Contact</TabsTrigger>
                            <TabsTrigger value="creator">Creator Profile</TabsTrigger>
                            <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Update user's basic information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter full name"
                                                            disabled={mode === 'view'}
                                                        />
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
                                                    <FormLabel>Email Address *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            placeholder="Enter email address"
                                                            disabled={mode === 'view'}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Role *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        disabled={mode === 'view'}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select role" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="end_user">End User</SelectItem>
                                                            <SelectItem value="content_creator">Content Creator</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="isActive"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">
                                                            Active Status
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Enable or disable user account
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            disabled={mode === 'view'}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Read-only fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Auth Provider
                                            </label>
                                            <p className="text-sm">
                                                <Badge variant="outline">
                                                    {user?.authProvider || 'local'}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Email Verified
                                            </label>
                                            <p className="text-sm">
                                                <Badge variant={user?.emailVerified ? "default" : "secondary"}>
                                                    {user?.emailVerified ? 'Verified' : 'Not Verified'}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Member Since
                                            </label>
                                            <p className="text-sm">
                                                {user?.createdAt ? format(user.createdAt, config.DATE_FORMAT) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Razorpay IDs */}
                                    {(user?.razorpayContactId || user?.razorpayCustomerId) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                            {user.razorpayContactId && (
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        Razorpay Contact ID
                                                    </label>
                                                    <p className="text-sm font-mono text-xs">
                                                        {user.razorpayContactId}
                                                    </p>
                                                </div>
                                            )}
                                            {user.razorpayCustomerId && (
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        Razorpay Customer ID
                                                    </label>
                                                    <p className="text-sm font-mono text-xs">
                                                        {user.razorpayCustomerId}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Billing & Contact Tab */}
                        <TabsContent value="billing" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact & Billing Information</CardTitle>
                                    <CardDescription>
                                        Update user's contact details and billing country
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter phone number"
                                                        disabled={mode === 'view'}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="billingAddress.country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter country"
                                                        disabled={mode === 'view'}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Creator Profile Tab */}
                        <TabsContent value="creator" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Creator Profile</CardTitle>
                                    <CardDescription>
                                        Manage content creator specific settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="creatorProfile.isVerified"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Verified Creator
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Mark this creator as verified
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={mode === 'view'}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="creatorProfile.bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Enter creator bio"
                                                        className="min-h-[100px]"
                                                        disabled={mode === 'view'}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Brief description about the creator (max 500 characters)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="creatorProfile.website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="https://example.com"
                                                        disabled={mode === 'view'}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium">Social Links</h4>

                                        <FormField
                                            control={form.control}
                                            name="creatorProfile.socialLinks.youtube"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>YouTube</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="https://youtube.com/@username"
                                                            disabled={mode === 'view'}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="creatorProfile.socialLinks.instagram"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Instagram</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="@username"
                                                            disabled={mode === 'view'}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="creatorProfile.socialLinks.twitter"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Twitter</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="@username"
                                                            disabled={mode === 'view'}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Preferences Tab */}
                        <TabsContent value="preferences" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Preferences</CardTitle>
                                    <CardDescription>
                                        Manage user's email notification preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="preferences.emailNotifications.newTemplates"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        New Templates
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Receive notifications about new templates
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={mode === 'view'}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="preferences.emailNotifications.promotions"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Promotions & Offers
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Receive promotional emails and special offers
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={mode === 'view'}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="preferences.emailNotifications.productUpdates"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Product Updates
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Receive notifications about product updates and new features
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={mode === 'view'}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
};

export default EditUser;