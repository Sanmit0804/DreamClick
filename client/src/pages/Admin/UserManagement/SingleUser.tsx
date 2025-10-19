// pages/SingleUser.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Edit, Key } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

// Services and types
import userService from '@/services/user.service';

// schemas/user.schema.ts
import { z } from 'zod';
import { format } from 'date-fns';

// Enhanced user schema with password fields
export const userSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'end_user', 'content_creator'], {
        message: 'Role is required',
    }),
    phone: z.string().optional().or(z.literal('')),
    billingAddress: z.object({
        street: z.string().optional().or(z.literal('')),
        city: z.string().optional().or(z.literal('')),
        state: z.string().optional().or(z.literal('')),
        country: z.string().optional().or(z.literal('')),
        zipCode: z.string().optional().or(z.literal('')),
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
    // Password fields - only for new users or when explicitly updating password
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
        .optional()
        .or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    // Only validate password confirmation if password is provided
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type UserFormData = z.infer<typeof userSchema>;

const SingleUser = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    // State for password visibility
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    
    // Determine mode from URL params or location state
    const urlParams = new URLSearchParams(location.search);
    const mode = id 
        ? (location.state?.mode || urlParams.get('mode') || 'view')
        : 'new';

    // Fetch user data for edit/view modes
    const {
        data: user,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getUserById(id!),
        enabled: !!id && mode !== 'new',
    });

    // Create user mutation
    const createMutation = useMutation({
        mutationFn: (data: UserFormData) => {
            const { confirmPassword, ...userData } = data;
            return userService.createUser(userData);
        },
        onSuccess: (newUser) => {
            toast.success('User created successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate(`/admin/users`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create user');
        },
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: (data: UserFormData) => {
            const { confirmPassword, password, ...userData } = data;
            
            // Only include password if it's provided (user wants to change it)
            const updateData: any = { ...userData };
            if (password && password.trim() !== '') {
                updateData.password = password;
            }
            
            return userService.updateUser(id!, updateData);
        },
        onSuccess: () => {
            toast.success('User updated successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            
            // Clear password fields after successful update
            form.setValue('password', '');
            form.setValue('confirmPassword', '');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user');
        },
    });

    // Initialize form with default values
    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            role: 'end_user',
            phone: '',
            password: '',
            confirmPassword: '',
            billingAddress: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: '',
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

    // Reset form when user data is loaded (for edit/view modes)
    React.useEffect(() => {
        if (user && mode !== 'new') {
            form.reset({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'end_user',
                phone: user.phone || '',
                password: '', // Always empty for security
                confirmPassword: '', // Always empty for security
                billingAddress: {
                    street: user.billingAddress?.street || '',
                    city: user.billingAddress?.city || '',
                    state: user.billingAddress?.state || '',
                    country: user.billingAddress?.country || '',
                    zipCode: user.billingAddress?.zipCode || '',
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
    }, [user, form, mode]);

    const onSubmit = (data: UserFormData) => {
        if (mode === 'new') {
            createMutation.mutate(data);
        } else if (mode === 'edit') {
            updateMutation.mutate(data);
        }
    };

    const handleSwitchToEdit = () => {
        navigate(`?mode=edit`, { 
            replace: true,
            state: { mode: 'edit' } 
        });
    };

    const handleCancel = () => {
        if (mode === 'new') {
            navigate('/admin/users');
        } else {
            navigate(`?mode=view`, { 
                replace: true,
                state: { mode: 'view' } 
            });
            // Reset form to current user data
            if (user) {
                form.reset({
                    name: user.name || '',
                    email: user.email || '',
                    role: user.role || 'end_user',
                    phone: user.phone || '',
                    password: '', // Clear password fields
                    confirmPassword: '', // Clear password fields
                    billingAddress: {
                        street: user.billingAddress?.street || '',
                        city: user.billingAddress?.city || '',
                        state: user.billingAddress?.state || '',
                        country: user.billingAddress?.country || '',
                        zipCode: user.billingAddress?.zipCode || '',
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
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const isFormDisabled = mode === 'view';

    // Check if password fields should be required (only for new users)
    const isPasswordRequired = mode === 'new';

    if (mode !== 'new' && isLoading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (mode !== 'new' && error) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center py-8">
                    <p className="text-red-500">Error loading user data</p>
                    <Button onClick={() => navigate('/admin/users')} className="mt-4">
                        Back to Users
                    </Button>
                </div>
            </div>
        );
    }

    const getModeConfig = () => {
        switch (mode) {
            case 'new':
                return {
                    title: 'Create New User',
                    description: 'Add a new user to the system',
                };
            case 'edit':
                return {
                    title: 'Edit User',
                    description: 'Update user information and preferences',
                };
            case 'view':
            default:
                return {
                    title: 'User Details',
                    description: 'View user information',
                };
        }
    };

    const modeConfig = getModeConfig();

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
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {modeConfig.title}
                            </h1>
                            <p className="text-muted-foreground">
                                {modeConfig.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {mode === 'view' && user && (
                        <Button
                            onClick={handleSwitchToEdit}
                            variant="outline"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                        </Button>
                    )}
                    
                    {(mode === 'edit' || mode === 'new') && (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isPending}
                            >
                                {isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                <Save className="w-4 h-4 mr-2" />
                                {mode === 'new' ? 'Create User' : 'Save Changes'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="basic" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="basic">Basic Information</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
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
                                        {mode === 'new' 
                                            ? "Enter user's basic information"
                                            : mode === 'edit'
                                            ? "Update user's basic information"
                                            : "View user's basic information"
                                        }
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
                                                            disabled={isFormDisabled}
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
                                                            disabled={isFormDisabled}
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
                                                        disabled={isFormDisabled}
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
                                                            disabled={isFormDisabled}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Read-only fields (only show for existing users) */}
                                    {mode !== 'new' && user && (
                                        <>
                                            <Separator />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
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

                                            {/* Last Login */}
                                            {user?.lastLogin && (
                                                <div className="pt-4 border-t">
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                            Last Login
                                                        </label>
                                                        <p className="text-sm">
                                                            {format(user.lastLogin, config.DATE_FORMAT)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Razorpay IDs */}
                                            {(user?.razorpayContactId || user?.razorpayCustomerId) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                                    {user.razorpayContactId && (
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Razorpay Contact ID
                                                            </label>
                                                            <p className="text-xm font-mono text-xs">
                                                                {user.razorpayContactId}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {user.razorpayCustomerId && (
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Razorpay Customer ID
                                                            </label>
                                                            <p className="text-xm font-mono text-xs">
                                                                {user.razorpayCustomerId}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5" />
                                        Security Settings
                                    </CardTitle>
                                    <CardDescription>
                                        {mode === 'new'
                                            ? "Set user password"
                                            : mode === 'edit'
                                            ? "Update user password (leave blank to keep current password)"
                                            : "Password management"
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Password {isPasswordRequired && '*'}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder={
                                                                mode === 'new' 
                                                                    ? "Enter password" 
                                                                    : "Enter new password (leave blank to keep current)"
                                                            }
                                                            disabled={isFormDisabled}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            disabled={isFormDisabled}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">
                                                                {showPassword ? "Hide password" : "Show password"}
                                                            </span>
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    {mode === 'new' 
                                                        ? "Password must be at least 8 characters with uppercase, lowercase, and number"
                                                        : "Leave blank to keep current password unchanged"
                                                    }
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm Password {isPasswordRequired && '*'}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm password"
                                                            disabled={isFormDisabled}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            disabled={isFormDisabled}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">
                                                                {showConfirmPassword ? "Hide password" : "Show password"}
                                                            </span>
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {mode === 'view' && (
                                        <div className="p-4 border rounded-lg bg-muted/50">
                                            <p className="text-sm text-muted-foreground">
                                                Password cannot be viewed for security reasons. 
                                                Use edit mode to change the password.
                                            </p>
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
                                        {mode === 'new'
                                            ? "Enter user's contact details and billing address"
                                            : mode === 'edit'
                                            ? "Update user's contact details and billing address"
                                            : "View user's contact details and billing address"
                                        }
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
                                                        disabled={isFormDisabled}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="billingAddress.street"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Street Address</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter street address"
                                                            disabled={isFormDisabled}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="billingAddress.city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter city"
                                                            disabled={isFormDisabled}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="billingAddress.state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter state"
                                                            disabled={isFormDisabled}
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
                                                            disabled={isFormDisabled}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="billingAddress.zipCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ZIP Code</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter ZIP code"
                                                            disabled={isFormDisabled}
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

                        {/* Creator Profile Tab */}
                        <TabsContent value="creator" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Creator Profile</CardTitle>
                                    <CardDescription>
                                        {mode === 'new'
                                            ? "Configure content creator settings"
                                            : mode === 'edit'
                                            ? "Manage content creator specific settings"
                                            : "View content creator profile"
                                        }
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
                                                        disabled={isFormDisabled}
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
                                                        disabled={isFormDisabled}
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
                                                        disabled={isFormDisabled}
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
                                                            disabled={isFormDisabled}
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
                                                            disabled={isFormDisabled}
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
                                                            disabled={isFormDisabled}
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
                                        {mode === 'new'
                                            ? "Set email notification preferences"
                                            : mode === 'edit'
                                            ? "Manage user's email notification preferences"
                                            : "View user's email notification preferences"
                                        }
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
                                                        disabled={isFormDisabled}
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
                                                        disabled={isFormDisabled}
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
                                                        disabled={isFormDisabled}
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

export default SingleUser;