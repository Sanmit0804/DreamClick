import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VideoTemplate, AuthUser } from '@/types';

interface TemplateCardProps {
    template: VideoTemplate;
    currentUser: AuthUser | null;
    onSelect: (template: VideoTemplate) => void;
    onDelete: (templateId: string) => void;
}

/**
 * Delete button shows only to the template's uploader (owner).
 * Admins manage deletions from the dedicated admin panel instead.
 */
const canDelete = (template: VideoTemplate, user: AuthUser | null): boolean => {
    if (!user) return false;
    const uploaderId =
        typeof template.userId === 'string' ? template.userId : template.userId._id;
    return uploaderId === user._id;
};

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    currentUser,
    onSelect,
    onDelete,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const showDeleteButton = canDelete(template, currentUser);

    const uploaderName =
        typeof template.userId === 'object' ? template.userId.name : null;

    return (
        <div className="flex flex-col items-start w-full">
            {/* Video Container */}
            <div
                className="relative w-full overflow-hidden rounded-xl cursor-pointer group"
                style={{ height: 'clamp(280px, 60vw, 440px)' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => {
                    if (!isPlaying) setIsPlaying(true);
                }}
            >
                <ReactPlayer
                    key={template._id}
                    src={template.videoUrl}
                    playing={isPlaying || isHovered}
                    muted
                    loop
                    controls={isPlaying}
                    width="100%"
                    height="100%"
                    light={
                        !isHovered && !isPlaying && template.templateThumbnail
                            ? template.templateThumbnail
                            : false
                    }
                    onClickPreview={() => setIsPlaying(true)}
                    playIcon={
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-sm border border-white/20">
                                <Play className="w-6 h-6 text-white ml-1" fill="white" />
                            </div>
                        </div>
                    }
                    style={{ borderRadius: '0.75rem' }}
                />

                {/* Overlay gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none transition-opacity duration-300 rounded-xl ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                {/* Delete Button */}
                {showDeleteButton && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(template._id);
                        }}
                        title="Delete template"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}

                {/* Category Badge */}
                {template.templateCategory && (
                    <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm bg-black/40 text-white border-white/20"
                    >
                        {template.templateCategory}
                    </Badge>
                )}
            </div>

            {/* Template Info */}
            <div className="mt-2.5 w-full px-0.5 space-y-1">
                <p
                    onClick={() => onSelect(template)}
                    className="cursor-pointer font-semibold text-foreground text-sm md:text-base line-clamp-2 hover:text-primary transition-colors leading-snug"
                    title={template.templateName}
                >
                    {template.templateName}
                </p>

                {uploaderName && (
                    <p className="text-xs text-muted-foreground">by {uploaderName}</p>
                )}

                <p className="text-muted-foreground text-xs line-clamp-2">
                    {template.templateDescription}
                </p>

                <div className="flex items-center gap-2 pt-0.5">
                    {template.templateOldPrice && (
                        <span className="text-muted-foreground line-through text-xs">
                            ₹{template.templateOldPrice}
                        </span>
                    )}
                    <span className="text-primary font-bold text-sm md:text-base">
                        ₹{template.templatePrice}
                    </span>
                    {template.templatePrice === 0 && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-500">Free</Badge>
                    )}
                </div>
            </div>
        </div>
    );
};

export { canDelete };
export default TemplateCard;
