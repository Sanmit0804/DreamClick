import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

class UserService {
    async getUsers() {
        const response = await api.get(`/api/users`);
        return response.data;
    }

    async getUserById(userId: string) {
        const response = await api.get(`/api/users/${userId}`);
        return response.data;
    }

    async updateUser(id: string, data: any) {
        const response = await api.patch(`/api/users/${id}`, data);
        return response.data;
    }

    async createUser(data: any) {
        const response = await api.post(`/api/users`, data);
        return response.data;
    }

    async deleteUserById(userId: string) {
        const response = await api.delete(`/api/users/${userId}`);
        return response.data;
    }

    async toggleCart(templateId: string) {
        const response = await api.post('/api/users/cart', { templateId });
        return response.data;
    }

    async toggleFavorite(templateId: string) {
        const response = await api.post('/api/users/favorites', { templateId });
        return response.data;
    }
}

export default new UserService();
