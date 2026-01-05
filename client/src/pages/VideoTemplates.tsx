import { Skeleton } from '@/components/ui/skeleton';
import useDeviceType from '@/hooks/useDeviceType';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import VideoTemplateModal from '@/components/VideoTemplateModal';
import templateService from '@/services/template.service';

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

const VideoTemplates = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hoverStates, setHoverStates] = useState<{ [key: string]: boolean }>({});
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [videoTemplates, setVideoTemplates] = useState<VideoTemplate[]>([]);
  const deviceType = useDeviceType();

  const handleMouseEnter = (templateId: string) => {
    setHoverStates(prev => ({ ...prev, [templateId]: true }));
  };

  const handleMouseLeave = (templateId: string) => {
    setHoverStates(prev => ({ ...prev, [templateId]: false }));
  };

  const handlePlayClick = (index: number) => {
    setPlayingIndex(index);
  };

  const fetchVideoTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await templateService.getTemplates();
      console.log("Fetched templates:", response);
      setVideoTemplates(response);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchVideoTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="flex flex-col items-start w-[calc(50%-6px)] sm:w-48 md:w-56 lg:w-60 xl:w-64">
            <div className="overflow-hidden rounded-md w-full" style={{ height: 'clamp(300px, 70vw, 460px)' }}>
              <Skeleton className="h-full w-full" />
            </div>
            <div className="mt-2 w-full space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6">
        {videoTemplates.length > 0 && videoTemplates.map((template, index) => {
          const isMobile = deviceType === 'mobile';
          const showThumbnail = isMobile && template.templateThumbnail;
          const isPlaying = isMobile ? playingIndex === index : hoverStates[template._id];

          return (
            <div key={template._id} className="flex flex-col items-start w-[calc(50%-6px)] sm:w-48 md:w-56 lg:w-60 xl:w-64">
              <div
                onMouseEnter={() => handleMouseEnter(template._id)}
                onMouseLeave={() => handleMouseLeave(template._id)}
                className="overflow-hidden rounded-md w-full"
                style={{ height: 'clamp(300px, 70vw, 460px)' }}
              >
                <ReactPlayer
                  key={isMobile ? `mobile-${playingIndex}-${index}` : `desktop-${template._id}`}
                  src={template.templateContent}
                  playing={isPlaying}
                  muted={true}
                  controls={isPlaying}
                  width="100%"
                  height="100%"
                  light={showThumbnail ? template.templateThumbnail : false}
                  onClickPreview={() => handlePlayClick(index)}
                  playIcon={
                    <div className="flex flex-col items-center gap-2">
                      <button className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      <span className="text-white text-xs bg-black/60 px-2 py-1 rounded">Tap twice to play</span>
                    </div>
                  }
                />
              </div>

              <div className="mt-2 w-full">
                <p
                  onClick={() => setSelectedTemplate(template)}
                  className="cursor-pointer font-medium text-foreground text-xs sm:text-sm md:text-base line-clamp-2 hover:underline"
                >
                  {template.templateName}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mt-1">
                  {template.templateDescription}
                </p>
                <div className="flex items-center mt-1">
                  {template.templateOldPrice && (
                    <span className="text-muted-foreground me-2 sm:me-3 line-through text-xs sm:text-sm">
                      ₹{template.templateOldPrice}
                    </span>
                  )}
                  <span className="text-primary font-semibold text-xs sm:text-sm md:text-base">
                    ₹{template.templatePrice}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTemplate && (
        <VideoTemplateModal
          video={selectedTemplate}
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </>
  );
};

export default VideoTemplates;