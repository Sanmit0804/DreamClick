import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import templateService, { type CreateTemplatePayload } from '@/services/template.service';
import type { VideoTemplate } from '@/types';

const CATEGORIES = [
    'General', 'Wedding', 'Travel', 'Birthday', 'Music', 'Cinematic',
    'Lyrical', 'Festival', 'Love Story', 'Fashion', 'Other',
];

type FormValues = {
    templateName: string;
    templateDescription: string;
    videoUrl: string;
    templatePrice: number;
    templateOldPrice?: number;
    templateCategory: string;
    templateTags?: string;
    templateThumbnail?: string;
    templateFileUrl?: string;
};

interface AddTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (template: VideoTemplate) => void;
}

const AddTemplateModal: React.FC<AddTemplateModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [selectedCategory, setSelectedCategory] = useState('General');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: { templateCategory: 'General' },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const payload: CreateTemplatePayload = {
                templateName: data.templateName.trim(),
                templateDescription: data.templateDescription.trim(),
                videoUrl: data.videoUrl.trim(),
                templatePrice: Number(data.templatePrice),
                templateOldPrice: data.templateOldPrice ? Number(data.templateOldPrice) : undefined,
                templateCategory: selectedCategory,
                templateTags: data.templateTags
                    ? data.templateTags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
                templateThumbnail: data.templateThumbnail?.trim() || undefined,
                templateFileUrl: data.templateFileUrl?.trim() || undefined,
            };

            const newTemplate = await templateService.createTemplate(payload);
            toast.success('Template uploaded successfully! 🎉');
            onSuccess(newTemplate);
            reset();
            setSelectedCategory('General');
            onClose();
        } catch (err: any) {
            const message = err?.response?.data?.error?.message || err?.message || 'Failed to upload template';
            toast.error(message);
        }
    };

    const handleClose = () => {
        reset();
        setSelectedCategory('General');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Upload New Template</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add your VN video template to the marketplace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
                    {/* Template Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="templateName">Template Title <span className="text-destructive">*</span></Label>
                        <Input
                            id="templateName"
                            placeholder="e.g. Cinematic Wedding Reel"
                            {...register('templateName', {
                                required: 'Template title is required',
                                maxLength: { value: 120, message: 'Max 120 characters' },
                            })}
                        />
                        {errors.templateName && (
                            <p className="text-xs text-destructive">{errors.templateName.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="templateDescription">Description <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="templateDescription"
                            rows={3}
                            placeholder="Describe what's included, editing tips, compatible app version…"
                            {...register('templateDescription', {
                                required: 'Description is required',
                                maxLength: { value: 1000, message: 'Max 1000 characters' },
                            })}
                        />
                        {errors.templateDescription && (
                            <p className="text-xs text-destructive">{errors.templateDescription.message}</p>
                        )}
                    </div>

                    {/* Preview Video URL */}
                    <div className="space-y-1.5">
                        <Label htmlFor="videoUrl">Preview Video URL <span className="text-destructive">*</span></Label>
                        <Input
                            id="videoUrl"
                            type="url"
                            placeholder="https://…"
                            {...register('videoUrl', {
                                required: 'Preview video URL is required',
                                pattern: { value: /^https?:\/\/.+/, message: 'Enter a valid URL' },
                            })}
                        />
                        {errors.videoUrl && (
                            <p className="text-xs text-destructive">{errors.videoUrl.message}</p>
                        )}
                    </div>

                    {/* VN Template File URL */}
                    <div className="space-y-1.5">
                        <Label htmlFor="templateFileUrl" className="flex items-center gap-1.5">
                            <Upload className="h-3.5 w-3.5" />
                            VN Template File URL
                        </Label>
                        <Input
                            id="templateFileUrl"
                            type="url"
                            placeholder="Link to downloadable .vnp / .zip file"
                            {...register('templateFileUrl')}
                        />
                        <p className="text-xs text-muted-foreground">
                            Upload your file to storage first, then paste the URL here.
                        </p>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <Label>Category <span className="text-destructive">*</span></Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger id="templateCategory">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="templatePrice">Price (₹) <span className="text-destructive">*</span></Label>
                            <Input
                                id="templatePrice"
                                type="number"
                                placeholder="0"
                                min={0}
                                {...register('templatePrice', {
                                    required: 'Price is required',
                                    min: { value: 0, message: 'Price must be ≥ 0' },
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.templatePrice && (
                                <p className="text-xs text-destructive">{errors.templatePrice.message}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="templateOldPrice">Old Price ₹ <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input
                                id="templateOldPrice"
                                type="number"
                                placeholder="0"
                                min={0}
                                {...register('templateOldPrice', { min: 0 })}
                            />
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="space-y-1.5">
                        <Label htmlFor="templateThumbnail">Thumbnail URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Input
                            id="templateThumbnail"
                            type="url"
                            placeholder="https://…"
                            {...register('templateThumbnail')}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                        <Label htmlFor="templateTags">Tags <span className="text-muted-foreground text-xs">(optional, comma-separated)</span></Label>
                        <Input
                            id="templateTags"
                            placeholder="wedding, cinematic, reels"
                            {...register('templateTags')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading…
                                </>
                            ) : (
                                'Upload Template'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddTemplateModal;
