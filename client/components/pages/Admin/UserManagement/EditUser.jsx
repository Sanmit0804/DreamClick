import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import userService from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Zod validation schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  role: z.enum(['end_user', 'content_creator', 'admin'], {
    message: 'Role is required',
  }),
  phone: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  
  // Billing Address
  billingAddress: z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    country: z.string().default('India'),
    zipCode: z.string().optional().or(z.literal('')),
  }).optional(),
  
  // Creator Profile
  creatorProfile: z.object({
    bio: z.string().optional().or(z.literal('')),
    avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    socialLinks: z.object({
      youtube: z.string().optional().or(z.literal('')),
      instagram: z.string().optional().or(z.literal('')),
      twitter: z.string().optional().or(z.literal('')),
    }).optional(),
    isVerified: z.boolean().default(false),
  }).optional(),
  
  // Preferences
  preferences: z.object({
    emailNotifications: z.object({
      newTemplates: z.boolean().default(true),
      promotions: z.boolean().default(true),
    }),
  }).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const EditUser = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const mode = location.state?.mode || 'edit';

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId,
  });

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'end_user',
      phone: '',
      isActive: true,
      emailVerified: false,
      billingAddress: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
      },
      creatorProfile: {
        bio: '',
        avatar: '',
        website: '',
        socialLinks: {
          youtube: '',
          instagram: '',
          twitter: '',
        },
        isVerified: false,
      },
      preferences: {
        emailNotifications: {
          newTemplates: true,
          promotions: true,
        },
      },
    },
  });

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'end_user',
        phone: user.phone || '',
        isActive: user.isActive ?? true,
        emailVerified: user.emailVerified ?? false,
        billingAddress: {
          street: user.billingAddress?.street || '',
          city: user.billingAddress?.city || '',
          state: user.billingAddress?.state || '',
          country: user.billingAddress?.country || 'India',
          zipCode: user.billingAddress?.zipCode || '',
        },
        creatorProfile: {
          bio: user.creatorProfile?.bio || '',
          avatar: user.creatorProfile?.avatar || '',
          website: user.creatorProfile?.website || '',
          socialLinks: {
            youtube: user.creatorProfile?.socialLinks?.youtube || '',
            instagram: user.creatorProfile?.socialLinks?.instagram || '',
            twitter: user.creatorProfile?.socialLinks?.twitter || '',
          },
          isVerified: user.creatorProfile?.isVerified ?? false,
        },
        preferences: {
          emailNotifications: {
            newTemplates: user.preferences?.emailNotifications?.newTemplates ?? true,
            promotions: user.preferences?.emailNotifications?.promotions ?? true,
          },
        },
      });
    }
  }, [user, reset]);

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data: UserFormData) => userService.updateUser(userId!, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      navigate('/admin/users');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    },
  });

  const onSubmit = (data: UserFormData) => {
    updateMutation.mutate(data);
  };

  const role = watch('role');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit User</h1>
            <p className="text-gray-600">Update user information and settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="creator">Creator Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the user's basic account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="user@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">
                      Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watch('role')}
                      onValueChange={(value) => setValue('role', value as any, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="end_user">End User</SelectItem>
                        <SelectItem value="content_creator">Content Creator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-500">{errors.role.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+91 1234567890"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Account Status</Label>
                      <p className="text-sm text-gray-500">
                        Enable or disable user account access
                      </p>
                    </div>
                    <Switch
                      checked={watch('isActive')}
                      onCheckedChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verified</Label>
                      <p className="text-sm text-gray-500">
                        Mark email as verified
                      </p>
                    </div>
                    <Switch
                      checked={watch('emailVerified')}
                      onCheckedChange={(checked) => setValue('emailVerified', checked, { shouldDirty: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Address Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
                <CardDescription>
                  Manage the user's billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    {...register('billingAddress.street')}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register('billingAddress.city')}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register('billingAddress.state')}
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...register('billingAddress.country')}
                      placeholder="India"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...register('billingAddress.zipCode')}
                      placeholder="400001"
                    />
                  </div>
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
                  Manage creator-specific information
                  {role !== 'content_creator' && (
                    <span className="block mt-1 text-amber-600">
                      Note: This user is not a content creator
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...register('creatorProfile.bio')}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      {...register('creatorProfile.avatar')}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {errors.creatorProfile?.avatar && (
                      <p className="text-sm text-red-500">
                        {errors.creatorProfile.avatar.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      {...register('creatorProfile.website')}
                      placeholder="https://example.com"
                    />
                    {errors.creatorProfile?.website && (
                      <p className="text-sm text-red-500">
                        {errors.creatorProfile.website.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base">Social Links</Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      {...register('creatorProfile.socialLinks.youtube')}
                      placeholder="https://youtube.com/@username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      {...register('creatorProfile.socialLinks.instagram')}
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      {...register('creatorProfile.socialLinks.twitter')}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Verified Creator</Label>
                    <p className="text-sm text-gray-500">
                      Mark this creator as verified
                    </p>
                  </div>
                  <Switch
                    checked={watch('creatorProfile.isVerified')}
                    onCheckedChange={(checked) =>
                      setValue('creatorProfile.isVerified', checked, { shouldDirty: true })
                    }
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
                  Manage user notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Templates</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications about new templates
                    </p>
                  </div>
                  <Switch
                    checked={watch('preferences.emailNotifications.newTemplates')}
                    onCheckedChange={(checked) =>
                      setValue('preferences.emailNotifications.newTemplates', checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Promotions</Label>
                    <p className="text-sm text-gray-500">
                      Receive promotional emails and offers
                    </p>
                  </div>
                  <Switch
                    checked={watch('preferences.emailNotifications.promotions')}
                    onCheckedChange={(checked) =>
                      setValue('preferences.emailNotifications.promotions', checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/users')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;