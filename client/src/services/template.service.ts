import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

class TemplateService{
    async getTemplates() {
        try {
            const response = await axios.get(`${API_URL}/api/templates`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new TemplateService();