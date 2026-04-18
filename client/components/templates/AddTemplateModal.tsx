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
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [templateFile, setTemplateFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: { templateCategory: 'General' },
    });

    const onSubmit = async (data: FormValues) => {
        if (!videoFile) {
            toast.error('Please select a preview video file.');
            return;
        }

        try {
            // First, upload the video file
            const activeVideoUrl = await templateService.uploadFile(videoFile);
            
            // Optionally, upload template file if selected
            let activeTemplateFileUrl = data.templateFileUrl?.trim();
            if (templateFile) {
                activeTemplateFileUrl = await templateService.uploadFile(templateFile);
            }

            const payload: CreateTemplatePayload = {
                templateName: data.templateName.trim(),
                templateDescription: data.templateDescription.trim(),
                videoUrl: activeVideoUrl,
                templatePrice: Number(data.templatePrice),
                templateOldPrice: data.templateOldPrice ? Number(data.templateOldPrice) : undefined,
                templateCategory: selectedCategory,
                templateTags: data.templateTags
                    ? data.templateTags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
                templateThumbnail: data.templateThumbnail?.trim() || undefined,
                templateFileUrl: activeTemplateFileUrl || undefined,
            };

            const newTemplate = await templateService.createTemplate(payload);
            toast.success('Template uploaded! The YouTube upload is queued in the background 🚀');
            onSuccess(newTemplate);
            
            // Reset state
            reset();
            setSelectedCategory('General');
            setVideoFile(null);
            setTemplateFile(null);
            onClose();
        } catch (err: any) {
            const message = err?.response?.data?.error?.message || err?.message || 'Failed to upload template';
            toast.error(message);
        }
    };

    const handleClose = () => {
        reset();
        setSelectedCategory('General');
        setVideoFile(null);
        setTemplateFile(null);
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

                    {/* Preview Video File */}
                    <div className="space-y-1.5">
                        <Label htmlFor="videoFile">Preview Video (Shorts format) <span className="text-destructive">*</span></Label>
                        <Input
                            id="videoFile"
                            type="file"
                            accept="video/mp4,video/quicktime"
                            onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <p className="text-xs text-muted-foreground mr-1">
                            This video gets uploaded directly to your connected YouTube Shorts channel.
                        </p>
                    </div>

                    {/* VN Template File URL or File */}
                    <div className="space-y-1.5">
                        <Label htmlFor="templateFile" className="flex items-center gap-1.5">
                            <Upload className="h-3.5 w-3.5" />
                            VN Template Source File <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <Input
                            id="templateFile"
                            type="file"
                            accept=".vnp,.zip,.rar"
                            onChange={(e) => setTemplateFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <div className="text-center my-1 text-xs text-muted-foreground">OR</div>
                        <Input
                            id="templateFileUrl"
                            type="url"
                            placeholder="Paste external link if file is too large"
                            {...register('templateFileUrl')}
                        />
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
