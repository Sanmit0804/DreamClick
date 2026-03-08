// Shared TypeScript types used across the application

export interface Uploader {
    _id: string;
    name: string;
    creatorProfile?: {
        avatar?: string;
    };
}

export interface VideoTemplate {
    _id: string;
    templateName: string;
    templateDescription: string;
    videoUrl: string;
    templateFileUrl?: string | null;
    templatePrice: number;
    templateOldPrice?: number | null;
    templateThumbnail?: string | null;
    templateCategory?: string;
    templateTags?: string[];
    userId: string | Uploader; // string when not populated, Uploader when populated
    createdAt: string;
    updatedAt: string;
}

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: 'end_user' | 'content_creator' | 'admin';
    creatorProfile?: {
        avatar?: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export type TemplateFilter = 'all' | 'mine';
