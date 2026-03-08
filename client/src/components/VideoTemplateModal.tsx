import React, { useEffect } from 'react';
import ReactPlayer from 'react-player';
import { X, CheckCircle2, CreditCard, Trash2, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import useAuth from '@/hooks/useAuth';
import type { VideoTemplate } from '@/types';

interface VideoTemplateModalProps {
  video: VideoTemplate;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

// Delete button visible only to the template's uploader (owner)
const canDelete = (template: VideoTemplate, userId?: string): boolean => {
  if (!userId) return false;
  const uploaderId =
    typeof template.userId === 'string' ? template.userId : template.userId._id;
  return uploaderId === userId;
};

const VideoTemplateModal: React.FC<VideoTemplateModalProps> = ({
  video,
  isOpen,
  onClose,
  onDelete,
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const uploaderName =
    typeof video.userId === 'object' ? video.userId.name : null;

  const showDelete = onDelete && canDelete(video, user?._id);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-50 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 border-border/50 overflow-hidden">
        {/* Header */}
        <CardHeader className="flex flex-row items-start justify-between border-b py-4 px-5 gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl font-bold leading-tight line-clamp-2">
              {video.templateName}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {video.templateCategory && (
                <Badge variant="secondary" className="text-xs">
                  {video.templateCategory}
                </Badge>
              )}
              {uploaderName && (
                <span className="text-xs text-muted-foreground">
                  by <span className="font-medium text-foreground">{uploaderName}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/50"
                onClick={() => {
                  if (window.confirm('Delete this template?')) {
                    onDelete!(video._id);
                    onClose();
                  }
                }}
                title="Delete template"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="flex-1 overflow-auto p-0 md:flex">
          {/* Video Preview (desktop only) */}
          {!isMobile && (
            <div className="w-full md:w-[45%] bg-black/5 dark:bg-black/20 flex items-center justify-center p-5 border-r shrink-0">
              <div className="relative w-full aspect-[9/16] max-h-[65vh] max-w-[260px] rounded-xl overflow-hidden shadow-xl">
                <ReactPlayer
                  src={video.videoUrl}
                  playing={true}
                  controls={true}
                  width="100%"
                  height="100%"
                  light={false}
                  muted
                />
              </div>
            </div>
          )}

          {/* Details */}
          <div className="flex-1 p-5 md:p-6 flex flex-col gap-5 overflow-auto">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary">
                {video.templatePrice === 0 ? 'Free' : `₹${video.templatePrice}`}
              </span>
              {video.templateOldPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{video.templateOldPrice}
                </span>
              )}
              {video.templatePrice === 0 && (
                <Badge variant="outline" className="text-green-600 border-green-500 text-xs">Free Download</Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Description</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {video.templateDescription}
              </p>
            </div>

            {/* Tags */}
            {video.templateTags && video.templateTags.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {video.templateTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* How Access Works */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                How Access Works
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                <li>Complete payment securely via Razorpay.</li>
                <li>Choose UPI, Card, Net Banking, or Wallet.</li>
                <li>Download link is sent to your registered email.</li>
              </ul>
            </div>

            {/* Payment */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                Payment
              </h3>
              <div className="bg-muted/50 p-3.5 rounded-lg text-sm border">
                <p>Secure payments powered by <strong>Razorpay</strong>.</p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  * Ensure your email is correct for delivery.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto pt-2">
              <Button className="w-full py-5 text-base font-semibold shadow-md hover:shadow-lg transition-shadow">
                {video.templatePrice === 0 ? '⬇ Download Free' : '🛒 Buy Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoTemplateModal;