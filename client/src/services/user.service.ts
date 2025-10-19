import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

class UserService {
    async getUsers() {
        try {
            const response = await axios.get(`${API_URL}/api/users`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(userId: string) {
        try {
            const response = await axios.get(`${API_URL}/api/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateUser(id: string, data: any) {
        try {
            const response = await axios.patch(`${API_URL}/api/users/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createUser(data: any) {
        try {
            const response = await axios.post(`${API_URL}/api/users`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteUserById(userId: string) {
        try {
            const response = await axios.delete(`${API_URL}/api/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new UserService();
