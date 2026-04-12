const config = {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
    DATE_FORMAT: process.env.NEXT_PUBLIC_DATE_FORMAT || 'dd/MM/yyyy',
    DATE_FORMAT_MONTH: process.env.NEXT_PUBLIC_DATE_FORMAT_MONTH || 'dd-MM-yy'
};

export default config;