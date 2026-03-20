import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, LayoutGrid, User2, Film, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VideoTemplateModal from '@/components/VideoTemplateModal';
import AddTemplateModal from '@/components/templates/AddTemplateModal';
import TemplateCard from '@/components/templates/TemplateCard';
import templateService from '@/services/template.service';
import useAuth from '@/hooks/useAuth';
import type { VideoTemplate, TemplateFilter } from '@/types';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const TemplateSkeleton = () => (
  <div className="flex flex-col items-start w-full animate-pulse">
    <div className="w-full rounded-xl bg-muted" style={{ height: 'clamp(280px, 60vw, 440px)' }} />
    <div className="mt-3 w-full space-y-2 px-0.5">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-4 bg-muted rounded w-1/4" />
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ filter, onAdd }: { filter: TemplateFilter; onAdd?: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
    <Film className="h-16 w-16 text-muted-foreground/40 mb-4" />
    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
      {filter === 'mine' ? "You haven't uploaded any templates yet" : 'No templates available'}
    </h3>
    <p className="text-sm text-muted-foreground/70 mb-6 max-w-xs">
      {filter === 'mine'
        ? 'Share your creative work with the community by uploading your first template.'
        : 'Be the first to share a stunning VN video template!'}
    </p>
    {onAdd && (
      <Button onClick={onAdd} size="sm" className="gap-2">
        <Plus className="h-4 w-4" /> Upload Template
      </Button>
    )}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const VideoTemplates = () => {
  const [filter, setFilter] = useState<TemplateFilter>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // ── Query: ALL templates — always running, feeds the "All" tab count + list ─
  const {
    data: allTemplates = [],
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useQuery({
    queryKey: ['templates', 'all'],
    queryFn: () => templateService.getTemplates(false),
    staleTime: 2 * 60 * 1000,
  });

  // ── Query: MY templates — only runs when authenticated, feeds "My" tab ──────
  const {
    data: myTemplates = [],
    isLoading: isLoadingMine,
    isError: isErrorMine,
  } = useQuery({
    queryKey: ['templates', 'mine'],
    queryFn: () => templateService.getTemplates(true),
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated, // skip call when not logged in
  });

  // Derive active list + loading/error from the active filter's query
  const activeTemplates = filter === 'mine' ? myTemplates : allTemplates;
  const isLoading = filter === 'mine' ? isLoadingMine : isLoadingAll;
  const isError = filter === 'mine' ? isErrorMine : isErrorAll;

  // ── Delete Mutation ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => templateService.deleteTemplate(id),
    onSuccess: () => {
      toast.success('Template deleted.');
      // Refresh both queries so BOTH badge counts update
      queryClient.invalidateQueries({ queryKey: ['templates', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'mine'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || 'Failed to delete template';
      toast.error(msg);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDeleteRequest = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleAddSuccess = useCallback(() => {
    // Refresh both queries so both counts update right away
    queryClient.invalidateQueries({ queryKey: ['templates', 'all'] });
    queryClient.invalidateQueries({ queryKey: ['templates', 'mine'] });
  }, [queryClient]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">

          {/* Title */}
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">Video Templates</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Premium VN editing templates for creators
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-muted rounded-lg p-1 gap-1">

            {/* All — badge reads from allTemplates (always up-to-date) */}
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              All
              <Badge variant="secondary" className="text-xs h-4 px-1.5 min-w-4">
                {isLoadingAll ? '…' : allTemplates.length}
              </Badge>
            </button>

            {/* My Templates — badge reads from myTemplates (always up-to-date) */}
            {isAuthenticated && (
              <button
                onClick={() => setFilter('mine')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'mine'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <User2 className="h-3.5 w-3.5" />
                My Templates
                <Badge variant="secondary" className="text-xs h-4 px-1.5 min-w-4">
                  {isLoadingMine ? '…' : myTemplates.length}
                </Badge>
              </button>
            )}
          </div>

          {/* Upload Button */}
          {isAuthenticated && (
            <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Upload Template
            </Button>
          )}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="h-12 w-12 text-destructive/60 mb-4" />
            <h3 className="font-semibold text-muted-foreground">Failed to load templates</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Please check your connection and try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['templates', 'all'] });
                queryClient.invalidateQueries({ queryKey: ['templates', 'mine'] });
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => <TemplateSkeleton key={i} />)
              : activeTemplates.length === 0
                ? (
                  <EmptyState
                    filter={filter}
                    onAdd={isAuthenticated ? () => setShowAddModal(true) : undefined}
                  />
                )
                : activeTemplates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    currentUser={user}
                    onSelect={setSelectedTemplate}
                    onDelete={handleDeleteRequest}
                  />
                ))
            }
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {selectedTemplate && (
        <VideoTemplateModal
          video={selectedTemplate}
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}

      <AddTemplateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default VideoTemplates;