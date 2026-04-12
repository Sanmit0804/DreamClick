import { useMemo, useState } from 'react';
import { Heart, Film } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import BackButton from '@/components/widgets/BackButton';
import TemplateCard from '@/components/templates/TemplateCard';
import VideoTemplateModal from '@/components/VideoTemplateModal';
import useFavorites from '@/hooks/useFavorites';
import useAuth from '@/hooks/useAuth';
import templateService from '@/services/template.service';

const Favorites = () => {
    const { favorites } = useFavorites();
    const { user } = useAuth();
    
    // Modal state
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Fetch all templates to display details
    const { data: allTemplates = [], isLoading } = useQuery({
        queryKey: ['templates', 'all'],
        queryFn: () => templateService.getTemplates(false),
        staleTime: 2 * 60 * 1000,
    });

    const favTemplates = useMemo(() => {
        return allTemplates.filter(t => favorites.includes(t._id));
    }, [allTemplates, favorites]);

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                    <BackButton fallbackPath="/video-templates" className="text-muted-foreground" />
                    <Heart className="h-5 w-5" fill="currentColor" />
                    <h1 className="text-xl font-bold tracking-tight">Your Favorites</h1>
                    <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-semibold">
                        {favorites.length}
                    </span>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
                {isLoading ? (
                    <div className="text-muted-foreground flex justify-center py-10">Loading Favorites...</div>
                ) : favTemplates.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {favTemplates.map(template => (
                            <TemplateCard
                                key={template._id}
                                template={template}
                                currentUser={user}
                                onSelect={() => {
                                    setSelectedTemplate(template);
                                    setIsModalOpen(true);
                                }}
                                onDelete={() => {}}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Film className="h-16 w-16 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No favorites yet</h3>
                        <p className="text-sm text-muted-foreground/70">Click the heart icon on any template to add it to your wishlist.</p>
                    </div>
                )}
            </div>

            {/* Template Preview/Purchase Modal */}
            {selectedTemplate && (
                <VideoTemplateModal
                    video={selectedTemplate}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTemplate(null);
                    }}
                />
            )}
        </div>
    );
};

export default Favorites;
