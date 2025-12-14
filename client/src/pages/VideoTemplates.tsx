import { Skeleton } from '@/components/ui/skeleton';
import useDeviceType from '@/hooks/useDeviceType';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import VideoTemplateModal from '@/components/VideoTemplateModal';

const VideoTemplates = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hoverStates, setHoverStates] = useState<{ [key: number]: boolean }>({});
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const deviceType = useDeviceType();

  const handleMouseEnter = (index: number) => {
    setHoverStates(prev => ({ ...prev, [index]: true }));
  };

  const handleMouseLeave = (index: number) => {
    setHoverStates(prev => ({ ...prev, [index]: false }));
  };

  const handlePlayClick = (index: number) => {
    setPlayingIndex(index);
  };

  // FOR EXAMPLE
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
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

  const videos = [
    {
      src: 'https://www.youtube.com/shorts/SCvvhs8GNxE',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Cinematic Travel',
      description: 'Perfect for adventure reels',
      price: '₹199'
    },
    {
      src: './sample_video1.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Golden Hour',
      description: 'Soft tones and slow motion',
      price: '₹249'
    },
    {
      src: './sample_video2.mp4',
      thumbnail: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Urban Motion',
      description: 'Fast transitions for city clips',
      price: '₹179'
    },
    {
      src: './sample_video3.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Aesthetic Edit',
      description: 'Clean minimal transitions',
      price: '₹149'
    },
    {
      src: './sample_video4.mp4',
      thumbnail: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Vlog Starter',
      description: 'Best for YouTube intros',
      oldPrice: '₹299',
      price: 'FREE'
    },
    {
      src: './sample_video5.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Mountain Adventure',
      description: 'Epic landscape transitions',
      price: '₹299'
    },
    {
      src: './sample_video6.mp4',
      thumbnail: 'https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Night Life',
      description: 'Urban night transitions',
      oldPrice: '₹349',
      price: '₹279'
    },
    {
      src: './sample_video7.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Beach Waves',
      description: 'Calming ocean transitions',
      price: '₹199'
    }
  ];

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6">
        {videos.map((video, index) => {
          const isMobile = deviceType === 'mobile';
          const showThumbnail = isMobile && video.thumbnail;
          const isPlaying = isMobile ? playingIndex === index : hoverStates[index];

          return (
            <div key={index} className="flex flex-col items-start w-[calc(50%-6px)] sm:w-48 md:w-56 lg:w-60 xl:w-64">
              <div
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className="overflow-hidden rounded-md w-full"
                style={{ height: 'clamp(300px, 70vw, 460px)' }}
              >
                <ReactPlayer
                  key={isMobile ? `mobile-${playingIndex}-${index}` : `desktop-${index}`}
                  src={video.src}
                  playing={isPlaying}
                  muted={true}
                  controls={isPlaying}
                  width="100%"
                  height="100%"
                  light={showThumbnail ? video.thumbnail : false}
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
                  onClick={() => setSelectedTemplate(video)}
                  className="cursor-pointer font-medium text-foreground text-xs sm:text-sm md:text-base line-clamp-2 hover:underline"
                >
                  {video.title}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mt-1">
                  {video.description}
                </p>
                <div className="flex items-center mt-1">
                  {video.oldPrice && (
                    <span className="text-muted-foreground me-2 sm:me-3 line-through text-xs sm:text-sm">
                      {video.oldPrice}
                    </span>
                  )}
                  <span className="text-primary font-semibold text-xs sm:text-sm md:text-base">
                    {video.price}
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