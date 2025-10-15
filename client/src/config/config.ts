const config = {
    BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
    DATE_FORMAT: import.meta.env.VITE_DATE_FORMAT || 'dd/MM/yyyy',
    DATE_FORMAT_MONTH: import.meta.env.VITE_DATE_FORMAT_MONTH || 'dd-MM-yy'

};

export default config;