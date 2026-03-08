import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Trash2, Film, Plus, Loader2, Pencil, Eye, RefreshCw, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ReactPlayer from 'react-player';
import AddTemplateModal from '@/components/templates/AddTemplateModal';
import EditTemplateModal from '@/components/templates/EditTemplateModal';
import templateService from '@/services/template.service';
import type { VideoTemplate } from '@/types';

// ─── Quick Preview ─────────────────────────────────────────────────────────────
const PreviewModal = ({
    template,
    onClose,
}: {
    template: VideoTemplate;
    onClose: () => void;
}) => (
    <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle className="line-clamp-2">{template.templateName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
                {template.videoUrl && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                        <ReactPlayer
                            src={template.videoUrl}
                            controls
                            width="100%"
                            height="100%"
                            playing={false}
                            light={template.templateThumbnail || false}
                            style={{ borderRadius: '0.5rem' }}
                        />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Category</p>
                        <Badge variant="outline">{template.templateCategory || 'General'}</Badge>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Price</p>
                        <p className="font-bold text-primary">
                            {template.templatePrice === 0 ? 'Free' : `₹${template.templatePrice}`}
                            {template.templateOldPrice && (
                                <span className="ml-2 text-muted-foreground line-through font-normal text-xs">
                                    ₹{template.templateOldPrice}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Description</p>
                    <p className="text-muted-foreground leading-relaxed">{template.templateDescription}</p>
                </div>
                {template.templateTags && template.templateTags.length > 0 && (
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                            {template.templateTags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                            ))}
                        </div>
                    </div>
                )}
                {template.templateFileUrl && (
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Template File</p>
                        <a
                            href={template.templateFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline text-xs break-all"
                        >
                            {template.templateFileUrl}
                        </a>
                    </div>
                )}
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Uploaded by</p>
                    <p>{typeof template.userId === 'object' ? template.userId.name : '—'}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Uploaded on</p>
                    <p>{new Date(template.createdAt).toLocaleString('en-IN')}</p>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminTemplates = () => {
    const [templates, setTemplates] = useState<VideoTemplate[]>([]);
    const [filtered, setFiltered] = useState<VideoTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [editTarget, setEditTarget] = useState<VideoTemplate | null>(null);
    const [previewTarget, setPreviewTarget] = useState<VideoTemplate | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await templateService.getTemplates(false);
            setTemplates(data);
            setFiltered(data);
        } catch {
            toast.error('Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    // ── Search filter ──────────────────────────────────────────────────────────
    useEffect(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) {
            setFiltered(templates);
            return;
        }
        setFiltered(
            templates.filter(
                (t) =>
                    t.templateName.toLowerCase().includes(q) ||
                    t.templateCategory?.toLowerCase().includes(q) ||
                    (typeof t.userId === 'object' &&
                        t.userId.name.toLowerCase().includes(q)) ||
                    t.templateTags?.some((tag) => tag.toLowerCase().includes(q))
            )
        );
    }, [searchQuery, templates]);

    // ── CREATE success ─────────────────────────────────────────────────────────
    const handleAddSuccess = (template: VideoTemplate) => {
        setTemplates((prev) => [template, ...prev]);
        toast.success(`"${template.templateName}" added!`);
    };

    // ── UPDATE success ─────────────────────────────────────────────────────────
    const handleEditSuccess = (updated: VideoTemplate) => {
        setTemplates((prev) =>
            prev.map((t) => (t._id === updated._id ? updated : t))
        );
    };

    // ── DELETE ─────────────────────────────────────────────────────────────────
    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Permanently delete "${name}"?\nThis cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await templateService.deleteTemplate(id);
            setTemplates((prev) => prev.filter((t) => t._id !== id));
            toast.success('Template deleted.');
        } catch (err: any) {
            const msg = err?.response?.data?.error?.message || 'Delete failed';
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Template Management</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {templates.length} templates total · Admin full access
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchTemplates}
                        title="Refresh"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Template
                    </Button>
                </div>
            </div>

            {/* ── Search ──────────────────────────────────────────────────────── */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    className="pl-9 h-9 text-sm"
                    placeholder="Search by name, category, uploader, tag…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* ── Table ───────────────────────────────────────────────────────── */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl">
                    <Film className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground font-medium">
                        {searchQuery ? 'No templates match your search' : 'No templates yet'}
                    </p>
                    {!searchQuery && (
                        <Button
                            size="sm"
                            className="mt-4 gap-2"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus className="h-4 w-4" /> Add First Template
                        </Button>
                    )}
                </div>
            ) : (
                <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/60 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Template</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Price</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Uploader</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Date</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.map((t, idx) => {
                                const uploaderName =
                                    typeof t.userId === 'object' ? t.userId.name : '—';
                                const isBeingDeleted = deletingId === t._id;

                                return (
                                    <tr
                                        key={t._id}
                                        className={`transition-colors ${isBeingDeleted ? 'opacity-50' : 'hover:bg-muted/30'}`}
                                    >
                                        {/* Index */}
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {idx + 1}
                                        </td>

                                        {/* Name + Description */}
                                        <td className="px-4 py-3 max-w-[220px]">
                                            <p className="font-semibold line-clamp-1">{t.templateName}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                {t.templateDescription}
                                            </p>
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {t.templateCategory || 'General'}
                                            </Badge>
                                        </td>

                                        {/* Price */}
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="font-bold text-primary">
                                                {t.templatePrice === 0 ? 'Free' : `₹${t.templatePrice}`}
                                            </span>
                                            {t.templateOldPrice && (
                                                <span className="ml-1.5 text-muted-foreground line-through text-xs">
                                                    ₹{t.templateOldPrice}
                                                </span>
                                            )}
                                        </td>

                                        {/* Uploader */}
                                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                                            {uploaderName}
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs whitespace-nowrap">
                                            {new Date(t.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>

                                        {/* Actions: View | Edit | Delete */}
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* View / Preview */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="Preview"
                                                    onClick={() => setPreviewTarget(t)}
                                                    disabled={isBeingDeleted}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {/* Edit */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:bg-blue-500/10"
                                                    title="Edit"
                                                    onClick={() => setEditTarget(t)}
                                                    disabled={isBeingDeleted}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>

                                                {/* Delete */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    title="Delete"
                                                    disabled={isBeingDeleted}
                                                    onClick={() => handleDelete(t._id, t.templateName)}
                                                >
                                                    {isBeingDeleted ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Footer row */}
                    <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
                        Showing {filtered.length} of {templates.length} templates
                        {searchQuery && ` matching "${searchQuery}"`}
                    </div>
                </div>
            )}

            {/* ── Modals ──────────────────────────────────────────────────────── */}

            {/* Add */}
            <AddTemplateModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
            />

            {/* Edit */}
            {editTarget && (
                <EditTemplateModal
                    template={editTarget}
                    isOpen={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Preview */}
            {previewTarget && (
                <PreviewModal
                    template={previewTarget}
                    onClose={() => setPreviewTarget(null)}
                />
            )}
        </div>
    );
};

export default AdminTemplates;
