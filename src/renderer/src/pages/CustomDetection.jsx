import React, { useRef } from 'react';
import { usePoseLandMarker } from '@/hooks/usePoseLandMarker';
// import { useHandLandMarker } from '@/hooks/useHandLandMarker';
// import { useFaceLandMarker } from '@/hooks/useFaceLandMarker';

export const CustomDetection = () => {
    // const { videoRef, canvasRef, landmarks } = useHandLandMarker();
    const { videoRef, canvasRef, landmarks } = usePoseLandMarker();
    // const { videoRef, canvasRef, landmarks } = useFaceLandMarker({ videoRef, canvasRef });

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