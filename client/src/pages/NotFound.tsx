import { Button } from '@/components/ui/button';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    const handleDashboardClick = () => {
        navigate('/dashboard');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Button variant={'outline'} className='border-0 mt-5' onClick={handleDashboardClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
                Go to Dashboard
            </Button>
        </div>
    );
};

export default NotFound;