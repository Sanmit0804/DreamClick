import React, { useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoTemplate {
  _id: string;
  templateName: string;
  templateDescription: string;
  templateContent: string;
  templatePrice: number;
  templateThumbnail: string;
  userId: string;
  templateCategory: string;
  templateTags: string[];
  createdAt: string;
  updatedAt: string;
  templateOldPrice?: number;
}

interface VideoTemplateModalProps {
  video: VideoTemplate;
  isOpen: boolean;
  onClose: () => void;
}

const VideoTemplateModal: React.FC<VideoTemplateModalProps> = ({ video, isOpen, onClose }) => {
  if (!isOpen) return null;
  const isMobile = useIsMobile();

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <Card className="z-50 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-xl md:text-2xl font-bold">{video?.templateName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-0 md:flex">
          {!isMobile &&
            <div className="w-full md:w-1/2 bg-black/5 p-4 flex items-center justify-center min-h-[300px] md:min-h-full border-r">
              <div className="relative w-full aspect-[9/16] max-h-[60vh] max-w-[300px] rounded-lg overflow-hidden shadow-lg">
                <ReactPlayer
                  src={video.templateContent}
                  playing={true}
                  controls={true}
                  width="100%"
                  height="100%"
                  light={false}
                />
              </div>
            </div>
          }

          <div className="w-full md:w-1/2 p-6 flex flex-col gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Description</h3>
                <p className="text-muted-foreground">{video.templateDescription}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">₹{video.templatePrice}</span>
                {video.templateOldPrice && (
                  <span className="text-sm text-muted-foreground line-through">₹{video.templateOldPrice}</span>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                How Access Works
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Complete payment securely via Razorpay.</li>
                <li>Choose UPI, Card, Net Banking, or Wallet.</li>
                <li>Product link is sent to your registered email.</li>
              </ul>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Payment Details
              </h3>
              <div className="bg-muted/50 p-4 rounded-lg text-sm border">
                <p>Secure payments powered by <strong>Razorpay</strong>.</p>
                <p className="text-xs text-muted-foreground italic">
                  * Ensure your email is correct for delivery.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Button className="w-full text-lg py-6 shadow-md hover:shadow-lg transition-all">
                Buy Now
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoTemplateModal;