import React, { useEffect, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
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
    templateTags?: string;
    templateThumbnail?: string;
    templateFileUrl?: string;
};

interface EditTemplateModalProps {
    template: VideoTemplate;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updated: VideoTemplate) => void;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
    template,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [selectedCategory, setSelectedCategory] = useState(
        template.templateCategory || 'General'
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            templateName: template.templateName,
            templateDescription: template.templateDescription,
            videoUrl: template.videoUrl,
            templatePrice: template.templatePrice,
            templateOldPrice: template.templateOldPrice ?? undefined,
            templateTags: template.templateTags?.join(', ') ?? '',
            templateThumbnail: template.templateThumbnail ?? '',
            templateFileUrl: template.templateFileUrl ?? '',
        },
    });

    // Re-sync form when template changes (e.g. switching rows)
    useEffect(() => {
        reset({
            templateName: template.templateName,
            templateDescription: template.templateDescription,
            videoUrl: template.videoUrl,
            templatePrice: template.templatePrice,
            templateOldPrice: template.templateOldPrice ?? undefined,
            templateTags: template.templateTags?.join(', ') ?? '',
            templateThumbnail: template.templateThumbnail ?? '',
            templateFileUrl: template.templateFileUrl ?? '',
        });
        setSelectedCategory(template.templateCategory || 'General');
    }, [template, reset]);

    const onSubmit = async (data: FormValues) => {
        try {
            const payload: Partial<CreateTemplatePayload> = {
                templateName: data.templateName.trim(),
                templateDescription: data.templateDescription.trim(),
                videoUrl: data.videoUrl.trim(),
                templatePrice: Number(data.templatePrice),
                templateOldPrice: data.templateOldPrice
                    ? Number(data.templateOldPrice)
                    : undefined,
                templateCategory: selectedCategory,
                templateTags: data.templateTags
                    ? data.templateTags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
                templateThumbnail: data.templateThumbnail?.trim() || undefined,
                templateFileUrl: data.templateFileUrl?.trim() || undefined,
            };

            const updated = await templateService.updateTemplate(template._id, payload);
            toast.success('Template updated successfully! ✅');
            onSuccess(updated);
            onClose();
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to update template';
            toast.error(message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Template</DialogTitle>
                    <DialogDescription>
                        Update the details below. Admin edits override the original uploader's data.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
                    {/* Template Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-templateName">
                            Template Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-templateName"
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
                        <Label htmlFor="edit-templateDescription">
                            Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="edit-templateDescription"
                            rows={3}
                            {...register('templateDescription', {
                                required: 'Description is required',
                                maxLength: { value: 1000, message: 'Max 1000 characters' },
                            })}
                        />
                        {errors.templateDescription && (
                            <p className="text-xs text-destructive">
                                {errors.templateDescription.message}
                            </p>
                        )}
                    </div>

                    {/* Preview Video URL */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-videoUrl">
                            Preview Video URL <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-videoUrl"
                            type="url"
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
                        <Label htmlFor="edit-templateFileUrl">VN Template File URL</Label>
                        <Input
                            id="edit-templateFileUrl"
                            type="url"
                            placeholder="Link to downloadable .vnp / .zip file"
                            {...register('templateFileUrl')}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <Label>Category <span className="text-destructive">*</span></Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger id="edit-templateCategory">
                                <SelectValue />
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
                            <Label htmlFor="edit-templatePrice">
                                Price (₹) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit-templatePrice"
                                type="number"
                                min={0}
                                {...register('templatePrice', {
                                    required: 'Price is required',
                                    min: { value: 0, message: 'Must be ≥ 0' },
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.templatePrice && (
                                <p className="text-xs text-destructive">
                                    {errors.templatePrice.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-templateOldPrice">
                                Old Price ₹{' '}
                                <span className="text-muted-foreground text-xs">(optional)</span>
                            </Label>
                            <Input
                                id="edit-templateOldPrice"
                                type="number"
                                min={0}
                                {...register('templateOldPrice', { min: 0 })}
                            />
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-templateThumbnail">
                            Thumbnail URL{' '}
                            <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <Input
                            id="edit-templateThumbnail"
                            type="url"
                            placeholder="https://…"
                            {...register('templateThumbnail')}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-templateTags">
                            Tags{' '}
                            <span className="text-muted-foreground text-xs">
                                (optional, comma-separated)
                            </span>
                        </Label>
                        <Input
                            id="edit-templateTags"
                            placeholder="wedding, cinematic, reels"
                            {...register('templateTags')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditTemplateModal;
