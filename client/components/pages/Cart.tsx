'use client';

import { useState } from 'react';
import { ShoppingCart, Film } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import BackButton from '@/components/widgets/BackButton';
import TemplateCard from '@/components/templates/TemplateCard';
import VideoTemplateModal from '@/components/VideoTemplateModal';
import useCart from '@/hooks/useCart';
import useAuth from '@/hooks/useAuth';
import templateService from '@/services/template.service';

const Cart = () => {
    const { cart } = useCart();
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

    const cartTemplates = allTemplates.filter(t => cart.includes(t._id));

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                    <BackButton fallbackPath="/video-templates" className="text-muted-foreground" />
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">Shopping Cart</h1>
                    <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-semibold">
                        {cart.length}
                    </span>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
                {isLoading ? (
                    <div className="text-muted-foreground flex justify-center py-10">Loading Cart...</div>
                ) : cartTemplates.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {cartTemplates.map(template => (
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
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">Your cart is empty</h3>
                        <p className="text-sm text-muted-foreground/70">Browse templates and add them to your cart to purchase.</p>
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

export default Cart;
