import { usePoseLandMarker } from '@/hooks/usePoseLandMarker';
import React, { useRef } from 'react';
import { useHandLandMarker } from '../hooks/useHandLandMarker';

export const CustomDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { landmarks } = useHandLandMarker({ videoRef, canvasRef });
    // const { landmarks } = usePoseLandMarker({ videoRef, canvasRef });

    return (
        <div className='w-full h-full flex flex-col items-center justify-center text-white'>
            <h1>Hand Landmark Detector</h1>
            <div className='relative w-1/3 h-1/2'>
                <video ref={videoRef} className='absolute top-0 left-0 w-full h-full object-cover' />
                <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full' />
            </div>
        </div>
    );
};