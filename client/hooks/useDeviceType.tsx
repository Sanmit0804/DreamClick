'use client';

import { useEffect, useState } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'laptop';

const getDeviceType = (width: number): DeviceType => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'laptop';
};

const useDeviceType = (): DeviceType => {
    // Default to 'mobile' for SSR, then update on client
    const [deviceType, setDeviceType] = useState<DeviceType>('mobile');

    useEffect(() => {
        // Now we're on the client — safely access window
        setDeviceType(getDeviceType(window.innerWidth));

        const handleResize = () => {
            setDeviceType(getDeviceType(window.innerWidth));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceType;
};

export default useDeviceType;