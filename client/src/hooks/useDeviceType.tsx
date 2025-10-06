import { useEffect, useState } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'laptop';

const getDeviceType = (width: number): DeviceType => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'laptop';
};

const useDeviceType = (): DeviceType => {
    const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType(window.innerWidth));

    useEffect(() => {
        const handleResize = () => {
            setDeviceType(getDeviceType(window.innerWidth));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceType;
};

export default useDeviceType;