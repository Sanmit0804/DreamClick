import axios from "axios"
import { z } from "zod"

// Schemas
const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

// Response types
interface AuthResponse {
    user: {
        _id: string;
        name: string;
        email: string;
        createdAt: string;
        updatedAt: string;
    };
    token: string;
}

interface ApiError {
    message: string;
    error?: string;
}

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ERR_NETWORK') {
            throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
        }
        
        if (error.response?.status === 401) {
            // Auto logout if 401 response
            localStorage.removeItem("token");
            window.location.href = '/login';
        }
        
        throw error;
    }
);

class AuthService {
    async login(data: LoginFormData): Promise<AuthResponse> {
        // Validate data before sending
        const parsed = loginSchema.safeParse(data);
        if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message || 'Validation failed');
        }

        try {
            const response = await api.post<AuthResponse>('/auth/login', {
                email: data.email,
                password: data.password,
            });
            
            // Save token
            if (response.data.token) {
                this.setToken(response.data.token);
            }
            
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError<ApiError>(error)) {
                const message = error.response?.data?.message || error.response?.data?.error || 'Login failed';
                throw new Error(message);
            }
            throw error;
        }
    }

    async signup(data: SignupFormData): Promise<AuthResponse> {
        const parsed = signupSchema.safeParse(data);
        if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message || 'Validation failed');
        }

        try {
            const response = await api.post<AuthResponse>('/auth/signup', {
                name: data.name,
                email: data.email,
                password: data.password,
            });
            
            // Save token
            if (response.data.token) {
                this.setToken(response.data.token);
            }
            
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError<ApiError>(error)) {
                const message = error.response?.data?.message || error.response?.data?.error || 'Signup failed';
                throw new Error(message);
            }
            throw error;
        }
    }

    logout(): void {
        localStorage.removeItem("token");
        // Optional: Call logout endpoint if you have one
        // await api.post('/auth/logout');
    }

    getToken(): string | null {
        return localStorage.getItem("token");
    }

    setToken(token: string): void {
        localStorage.setItem("token", token);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Optional: Get current user info if you have a /me endpoint
    async getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            this.logout();
            return null;
        }
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
export type { LoginFormData, SignupFormData, AuthResponse };