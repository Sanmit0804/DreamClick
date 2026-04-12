import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Trash2, Play, Heart, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VideoTemplate, AuthUser } from '@/types';
import useCart from '@/hooks/useCart';
import useFavorites from '@/hooks/useFavorites';

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

/** Animated action button that jiggles when toggled */
const ActionBtn: React.FC<{
    active: boolean;
    title: string;
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
}> = ({ active, title, onClick, children }) => (
    <motion.div
        whileTap={{ scale: 0.82 }}
        animate={active ? { scale: [1, 1.22, 1] } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 12 }}
    >
        <Button
            variant="secondary"
            size="icon"
            className={`h-8 w-8 shadow-lg backdrop-blur-sm border transition-all duration-200 ${
                active
                    ? 'border-white/60 bg-white/20 text-white'
                    : 'border-white/20 bg-black/40 text-white hover:bg-black/60 hover:border-white/30'
            }`}
            onClick={onClick}
            title={title}
        >
            {children}
        </Button>
    </motion.div>
);

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    currentUser,
    onSelect,
    onDelete,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const showDeleteButton = canDelete(template, currentUser);
    const { toggleCart, isInCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();

    const inCart = isInCart(template._id);
    const isFav = isFavorite(template._id);

    const uploaderName =
        typeof template.userId === 'object' ? template.userId.name : null;

    return (
        <div className="flex flex-col items-start w-full">
            {/* Video Container – portrait 9:16 aspect ratio for VN-style templates */}
            <div
                className="relative w-full overflow-hidden rounded-xl cursor-pointer group aspect-[9/16]"
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
                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none transition-opacity duration-300 rounded-xl ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                />

                {/* Actions Top Right — always 40% visible on mobile, full on hover or when active */}
                <div className={`absolute top-2 right-2 flex gap-1.5 transition-opacity duration-200 z-10 ${
                    (isFav || inCart) ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'
                }`}>
                    {/* Favorites */}
                    <ActionBtn
                        active={isFav}
                        title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(template._id);
                        }}
                    >
                        <Heart
                            className="h-3.5 w-3.5 text-white transition-all"
                            fill={isFav ? 'white' : 'none'}
                            strokeWidth={isFav ? 0 : 1.5}
                        />
                    </ActionBtn>

                    {/* Cart */}
                    <ActionBtn
                        active={inCart}
                        title={inCart ? 'Remove from cart' : 'Add to cart'}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCart(template._id);
                        }}
                    >
                        <ShoppingCart
                            className="h-3.5 w-3.5 text-white transition-all"
                            fill={inCart ? 'white' : 'none'}
                            strokeWidth={inCart ? 0 : 1.5}
                        />
                    </ActionBtn>

                    {/* Delete (owner only) */}
                    {showDeleteButton && (
                        <motion.div whileTap={{ scale: 0.85 }}>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(template._id);
                                }}
                                title="Delete template"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Category Badge */}
                {template.templateCategory && (
                    <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm bg-black/40 text-white border-white/20"
                    >
                        {template.templateCategory}
                    </Badge>
                )}

                {/* Active state indicators (always visible, bottom) */}
                <AnimatePresence>
                    {(isFav || inCart) && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            className="absolute bottom-2 left-2 flex gap-1.5 pointer-events-none"
                        >
                            {isFav && (
                                <span className="h-5 px-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center gap-1 text-[10px] font-semibold text-white">
                                    <Heart className="h-2.5 w-2.5 fill-white" /> Saved
                                </span>
                            )}
                            {inCart && (
                                <span className="h-5 px-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center gap-1 text-[10px] font-semibold text-white">
                                    <ShoppingCart className="h-2.5 w-2.5 fill-white" /> In Cart
                                </span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
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
