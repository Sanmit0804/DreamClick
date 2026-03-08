import axios from 'axios';
import type { ApiResponse, VideoTemplate } from '@/types';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL });

// Attach token from localStorage automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export type CreateTemplatePayload = {
    templateName: string;
    templateDescription: string;
    videoUrl: string;
    templatePrice: number;
    templateCategory?: string;
    templateTags?: string[];
    templateThumbnail?: string;
    templateFileUrl?: string;
    templateOldPrice?: number;
};

class TemplateService {
    /** Fetch all templates. Pass mine=true to return only the current user's. */
    async getTemplates(mine = false): Promise<VideoTemplate[]> {
        const params = mine ? { mine: 'true' } : {};
        const res = await api.get<ApiResponse<VideoTemplate[]>>('/api/templates', { params });
        return res.data.data;
    }

    /** Fetch a single template by ID. */
    async getTemplateById(id: string): Promise<VideoTemplate> {
        const res = await api.get<ApiResponse<VideoTemplate>>(`/api/templates/${id}`);
        return res.data.data;
    }

    /** Create a new template (requires auth). */
    async createTemplate(payload: CreateTemplatePayload): Promise<VideoTemplate> {
        const res = await api.post<ApiResponse<VideoTemplate>>('/api/templates', payload);
        return res.data.data;
    }

    /** Delete a template by ID (requires auth; owner or admin only). */
    async deleteTemplate(id: string): Promise<void> {
        await api.delete(`/api/templates/${id}`);
    }

    /** Update a template (requires auth; owner or admin only). */
    async updateTemplate(id: string, payload: Partial<CreateTemplatePayload>): Promise<VideoTemplate> {
        const res = await api.patch<ApiResponse<VideoTemplate>>(`/api/templates/${id}`, payload);
        return res.data.data;
    }
}

const templateService = new TemplateService();
export default templateService;